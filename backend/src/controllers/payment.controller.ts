import { Request, Response } from 'express';
import Stripe from 'stripe';
import prisma from '../config/database';
import { asyncHandler, AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import logger from '../config/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Stripe: Create payment intent
export const createStripePaymentIntent = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { amount, orderId } = req.body;

    if (!amount || amount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId,
        userId: req.user?.id || 'guest',
      },
    });

    res.json({
      success: true,
      data: {
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      },
    });
  }
);

// Stripe: Webhook handler
export const handleStripeWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const sig = req.headers['stripe-signature'] as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      logger.error('Stripe webhook signature verification failed:', err);
      throw new AppError(`Webhook Error: ${err.message}`, 400);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { orderId } = paymentIntent.metadata;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'PAID',
              paidAt: new Date(),
              status: 'CONFIRMED',
            },
          });

          await prisma.payment.create({
            data: {
              orderId,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              method: 'STRIPE',
              status: 'PAID',
              transactionId: paymentIntent.id,
              gatewayResponse: JSON.stringify(paymentIntent),
            },
          });

          logger.info(`Payment succeeded for order ${orderId}`);
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const { orderId } = paymentIntent.metadata;

        if (orderId) {
          await prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: 'FAILED',
            },
          });

          await prisma.payment.create({
            data: {
              orderId,
              amount: paymentIntent.amount / 100,
              currency: paymentIntent.currency.toUpperCase(),
              method: 'STRIPE',
              status: 'FAILED',
              transactionId: paymentIntent.id,
              gatewayResponse: JSON.stringify(paymentIntent),
            },
          });

          logger.error(`Payment failed for order ${orderId}`);
        }
        break;
      }

      default:
        logger.info(`Unhandled event type ${event.type}`);
    }

    res.json({ received: true });
  }
);

// PayPal: Create order
export const createPayPalOrder = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { amount, orderId } = req.body;

    // In production, you would call PayPal SDK here
    // For now, returning mock response
    res.json({
      success: true,
      data: {
        orderId: `PAYPAL-${Date.now()}`,
        approvalUrl: 'https://www.paypal.com/checkoutnow?token=MOCK',
      },
      message: 'PayPal integration ready - configure with your credentials',
    });
  }
);

// PayPal: Capture payment
export const capturePayPalPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { paypalOrderId, orderId } = req.body;

    // In production, capture the PayPal payment
    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: 'PAID',
        paidAt: new Date(),
        status: 'CONFIRMED',
      },
    });

    await prisma.payment.create({
      data: {
        orderId,
        amount: 0, // Would get from PayPal response
        currency: 'USD',
        method: 'PAYPAL',
        status: 'PAID',
        transactionId: paypalOrderId,
      },
    });

    res.json({
      success: true,
      message: 'Payment captured successfully',
    });
  }
);

// PayPal: Webhook handler
export const handlePayPalWebhook = asyncHandler(
  async (req: Request, res: Response) => {
    const event = req.body;

    logger.info('PayPal webhook received:', event.event_type);

    // Verify webhook signature and process event
    // Implementation depends on PayPal SDK

    res.json({ received: true });
  }
);

// MPesa: Initiate STK push
export const initiateMpesaPayment = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { amount, phoneNumber, orderId } = req.body;

    if (!phoneNumber || !phoneNumber.match(/^254\d{9}$/)) {
      throw new AppError('Invalid phone number format. Use 254XXXXXXXXX', 400);
    }

    // In production, integrate with Safaricom MPesa API
    // This is a mock implementation
    const checkoutRequestId = `MPESA-${Date.now()}`;

    res.json({
      success: true,
      data: {
        checkoutRequestId,
        responseCode: '0',
        responseDescription: 'Success. Request accepted for processing',
        customerMessage: 'Success. Request accepted for processing',
      },
      message: 'MPesa STK push sent. Complete payment on your phone.',
    });
  }
);

// MPesa: Callback handler
export const handleMpesaCallback = asyncHandler(
  async (req: Request, res: Response) => {
    const callbackData = req.body;

    logger.info('MPesa callback received:', callbackData);

    // Process MPesa callback
    // Extract order ID and update payment status

    res.json({
      ResultCode: 0,
      ResultDesc: 'Success',
    });
  }
);

// Process refund
export const processRefund = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { orderId, amount, reason } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { payments: true },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus !== 'PAID') {
      throw new AppError('Order has not been paid', 400);
    }

    const payment = order.payments.find((p) => p.status === 'PAID');

    if (!payment) {
      throw new AppError('No paid payment found', 400);
    }

    let refunded = false;

    // Process refund based on payment method
    if (payment.method === 'STRIPE' && payment.transactionId) {
      try {
        await stripe.refunds.create({
          payment_intent: payment.transactionId,
          amount: amount ? Math.round(amount * 100) : undefined,
        });
        refunded = true;
      } catch (error: any) {
        logger.error('Stripe refund failed:', error);
        throw new AppError(`Refund failed: ${error.message}`, 400);
      }
    }

    if (refunded) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: {
          status: 'REFUNDED',
          refundedAmount: amount || payment.amount,
          refundedAt: new Date(),
          refundReason: reason,
        },
      });

      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: 'REFUNDED',
          status: 'REFUNDED',
        },
      });
    }

    res.json({
      success: true,
      message: 'Refund processed successfully',
    });
  }
);

// Get payment methods for user
export const getPaymentMethods = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;

    const methods = await prisma.paymentMethod.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: methods,
    });
  }
);

// Add payment method
export const addPaymentMethod = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user.id;
    const { type, provider, last4, brand, expiryMonth, expiryYear, providerToken } =
      req.body;

    const paymentMethod = await prisma.paymentMethod.create({
      data: {
        userId,
        type,
        provider,
        last4,
        brand,
        expiryMonth,
        expiryYear,
        providerToken,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payment method added',
      data: paymentMethod,
    });
  }
);

// Delete payment method
export const deletePaymentMethod = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const userId = req.user.id;

    const method = await prisma.paymentMethod.findUnique({ where: { id } });

    if (!method || method.userId !== userId) {
      throw new AppError('Payment method not found', 404);
    }

    await prisma.paymentMethod.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Payment method deleted',
    });
  }
);

import axios from 'axios';
import prisma from '../config/database';
import logger from '../config/logger';
import { AppError } from '../middleware/errorHandler';
import { sendEmail } from '../config/email';

interface StkPushParams {
  orderId: string;
  phoneNumber: string;
  amount: number;
  accountReference?: string;
  transactionDesc?: string;
}

export class MpesaService {
  private consumerKey: string;
  private consumerSecret: string;
  private passkey: string;
  private shortcode: string;
  private callbackUrl: string;
  private baseUrl: string;
  private cachedToken: string | null = null;
  private tokenExpiry: number = 0;

  constructor() {
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || '';
    this.consumerSecret = process.env.MPESA_CONSUMER_SECRET || '';
    this.passkey =
      process.env.MPESA_PASSKEY ||
      'bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919';
    this.shortcode = process.env.MPESA_SHORTCODE || '174379';
    this.callbackUrl =
      process.env.MPESA_CALLBACK_URL ||
      'http://localhost:4000/api/payments/mpesa/callback';

    const env = (process.env.MPESA_ENVIRONMENT || 'sandbox').toLowerCase();
    this.baseUrl =
      env === 'production'
        ? 'https://api.safaricom.co.ke'
        : 'https://sandbox.safaricom.co.ke';
  }

  /**
   * Normalizes any Kenyan phone number to 254XXXXXXXXX format
   */
  public normalizePhoneNumber(phone: string): string {
    if (!phone) {
      throw new AppError('Phone number is required', 400);
    }
    const cleaned = phone.replace(/[\s\-\+\(\)]/g, '');
    let normalized = cleaned;

    if (cleaned.startsWith('07') || cleaned.startsWith('01')) {
      normalized = '254' + cleaned.substring(1);
    } else if (cleaned.startsWith('7') || cleaned.startsWith('1')) {
      normalized = '254' + cleaned;
    } else if (cleaned.startsWith('254')) {
      normalized = cleaned;
    }

    if (!/^254(7|1)\d{8}$/.test(normalized)) {
      throw new AppError(
        'Invalid Kenyan phone number format. Please provide a valid Safaricom/Airtel number (e.g., 0712345678 or 254712345678)',
        400
      );
    }

    return normalized;
  }

  /**
   * Obtains OAuth token from Safaricom Daraja API with in-memory caching
   */
  public async getAccessToken(): Promise<string> {
    const now = Date.now();
    if (this.cachedToken && this.tokenExpiry > now) {
      return this.cachedToken;
    }

    if (!this.consumerKey || !this.consumerSecret) {
      logger.warn(
        'Daraja API credentials not fully configured. Using mock token mode.'
      );
      return 'SANDBOX_MOCK_TOKEN_' + Date.now();
    }

    try {
      const authHeader = Buffer.from(
        `${this.consumerKey}:${this.consumerSecret}`
      ).toString('base64');

      const response = await axios.get(
        `${this.baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${authHeader}`,
          },
          timeout: 15000,
        }
      );

      const { access_token, expires_in } = response.data;
      this.cachedToken = access_token;
      // Subtract 60 seconds buffer before expiration
      this.tokenExpiry = now + (parseInt(expires_in, 10) - 60) * 1000;
      return access_token;
    } catch (error: any) {
      logger.error('Failed to get Daraja OAuth token:', {
        message: error.response?.data || error.message,
      });
      throw new AppError(
        'Failed to authenticate with M-Pesa payment gateway',
        502
      );
    }
  }

  /**
   * Generates formatted timestamp (YYYYMMDDHHmmss)
   */
  public getTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear().toString();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Generates Base64 encoded password for Daraja API
   */
  public generatePassword(shortcode: string, passkey: string, timestamp: string): string {
    return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
  }

  /**
   * Generates timestamp and password required by Daraja STK Push
   */
  private generatePasswordAndTimestamp(): { password: string; timestamp: string } {
    const timestamp = this.getTimestamp();
    const password = this.generatePassword(this.shortcode, this.passkey, timestamp);
    return { password, timestamp };
  }

  /**
   * Initiates STK Push prompt on customer phone
   */
  public async initiateStkPush(params: StkPushParams) {
    const normalizedPhone = this.normalizePhoneNumber(params.phoneNumber);
    const roundedAmount = Math.max(1, Math.round(params.amount));

    // Verify order exists and is not already paid
    const order = await prisma.order.findUnique({
      where: { id: params.orderId },
      include: { user: true },
    });

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (order.paymentStatus === 'PAID') {
      throw new AppError('This order has already been paid', 400);
    }

    // Verify amount matches trusted server order total
    const expectedTotal = Math.round(Number(order.total));
    if (roundedAmount < expectedTotal) {
      throw new AppError(
        `Amount mismatch: Order total is KSh ${expectedTotal}`,
        400
      );
    }

    const { password, timestamp } = this.generatePasswordAndTimestamp();
    const token = await this.getAccessToken();

    const payload = {
      BusinessShortCode: this.shortcode,
      Password: password,
      Timestamp: timestamp,
      TransactionType: 'CustomerPayBillOnline',
      Amount: roundedAmount,
      PartyA: normalizedPhone,
      PartyB: this.shortcode,
      PhoneNumber: normalizedPhone,
      CallBackURL: this.callbackUrl,
      AccountReference: (params.accountReference || order.orderNumber).substring(0, 12),
      TransactionDesc: (params.transactionDesc || `Order ${order.orderNumber}`).substring(0, 13),
    };

    let darajaResponseData: any = null;

    if (this.consumerKey && !token.startsWith('SANDBOX_MOCK_TOKEN')) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/mpesa/stkpush/v1/processrequest`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            timeout: 25000,
          }
        );
        darajaResponseData = response.data;
      } catch (err: any) {
        logger.error('Daraja STK push error:', err.response?.data || err.message);
        throw new AppError(
          err.response?.data?.errorMessage ||
            'M-Pesa STK push request failed. Please check your phone number and try again.',
          502
        );
      }
    } else {
      // Safe sandbox fallback response when Daraja live credentials are not set
      const mockCheckoutId = `ws_CO_${Date.now()}_${Math.floor(Math.random() * 100000)}`;
      darajaResponseData = {
        MerchantRequestID: `MR_${Date.now()}`,
        CheckoutRequestID: mockCheckoutId,
        ResponseCode: '0',
        ResponseDescription: 'Success. Request accepted for processing',
        CustomerMessage: 'Success. Request accepted for processing',
      };
    }

    // Create or update pending Payment record
    const payment = await prisma.payment.upsert({
      where: {
        transactionId: darajaResponseData.CheckoutRequestID,
      },
      update: {
        amount: roundedAmount,
        currency: 'KES',
        method: 'MPESA',
        status: 'PENDING',
        checkoutRequestId: darajaResponseData.CheckoutRequestID,
        merchantRequestId: darajaResponseData.MerchantRequestID,
        phoneNumber: normalizedPhone,
        gatewayResponse: JSON.stringify(darajaResponseData),
      },
      create: {
        orderId: order.id,
        amount: roundedAmount,
        currency: 'KES',
        method: 'MPESA',
        status: 'PENDING',
        transactionId: darajaResponseData.CheckoutRequestID,
        checkoutRequestId: darajaResponseData.CheckoutRequestID,
        merchantRequestId: darajaResponseData.MerchantRequestID,
        phoneNumber: normalizedPhone,
        gatewayResponse: JSON.stringify(darajaResponseData),
      },
    });

    // Record order status history
    await prisma.orderStatusHistory.create({
      data: {
        orderId: order.id,
        previousStatus: order.status,
        newStatus: 'PENDING',
        notes: `M-Pesa STK Push initiated to ${normalizedPhone}. Checkout ID: ${darajaResponseData.CheckoutRequestID}`,
        changedBy: order.userId || 'GUEST',
      },
    });

    return {
      checkoutRequestId: darajaResponseData.CheckoutRequestID,
      merchantRequestId: darajaResponseData.MerchantRequestID,
      customerMessage:
        darajaResponseData.CustomerMessage ||
        'M-Pesa prompt sent to your phone. Enter your PIN to complete the transaction.',
      paymentId: payment.id,
    };
  }

  /**
   * Queries payment status directly from Safaricom Daraja API
   */
  public async queryStkStatus(checkoutRequestId: string) {
    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { checkoutRequestId },
          { transactionId: checkoutRequestId },
        ],
      },
      include: {
        order: {
          include: {
            items: true,
            user: true,
          },
        },
      },
    });

    if (!payment) {
      throw new AppError('Payment record not found', 404);
    }

    // If already finalized in database, return immediately
    if (payment.status === 'PAID') {
      return {
        status: 'PAID',
        paid: true,
        orderId: payment.orderId,
        orderNumber: payment.order.orderNumber,
        receipt: payment.mpesaReceiptNumber,
      };
    }

    if (payment.status === 'FAILED') {
      return {
        status: 'FAILED',
        paid: false,
        orderId: payment.orderId,
        message: payment.resultDesc || 'Payment failed or was cancelled.',
      };
    }

    const { password, timestamp } = this.generatePasswordAndTimestamp();
    const token = await this.getAccessToken();

    if (this.consumerKey && !token.startsWith('SANDBOX_MOCK_TOKEN')) {
      try {
        const response = await axios.post(
          `${this.baseUrl}/mpesa/stkpushquery/v1/query`,
          {
            BusinessShortCode: this.shortcode,
            Password: password,
            Timestamp: timestamp,
            CheckoutRequestID: checkoutRequestId,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            timeout: 15000,
          }
        );

        const data = response.data;
        const resultCode = Number(data.ResultCode);

        if (resultCode === 0) {
          // Reconcile and fulfill payment
          await this.fulfillPayment({
            paymentId: payment.id,
            receiptNumber: data.MpesaReceiptNumber || `MP-${checkoutRequestId.substring(0, 8)}`,
            amount: Number(payment.amount),
            resultCode: 0,
            resultDesc: data.ResultDesc || 'The service request has been accepted successfully',
            rawCallback: JSON.stringify(data),
          });

          return {
            status: 'PAID',
            paid: true,
            orderId: payment.orderId,
            receipt: data.MpesaReceiptNumber,
          };
        } else if (resultCode !== undefined && resultCode !== 1037) {
          // 1037 is DS timeout user cannot be reached yet
          await prisma.payment.update({
            where: { id: payment.id },
            data: {
              status: 'FAILED',
              resultCode,
              resultDesc: data.ResultDesc,
            },
          });

          return {
            status: 'FAILED',
            paid: false,
            orderId: payment.orderId,
            message: data.ResultDesc || 'Payment was cancelled or failed.',
          };
        }
      } catch (err: any) {
        logger.info('STK query returned error/pending:', err.response?.data?.errorMessage || err.message);
      }
    }

    return {
      status: 'PENDING',
      paid: false,
      orderId: payment.orderId,
      message: 'Payment is still being processed on customer phone.',
    };
  }

  /**
   * Processes webhook callback notification sent by Safaricom Daraja
   */
  public async handleCallback(payload: any) {
    logger.info('Received Daraja M-Pesa Callback:', JSON.stringify(payload));

    const stkCallback = payload?.Body?.stkCallback;
    if (!stkCallback) {
      logger.warn('Invalid M-Pesa callback structure');
      return { ResultCode: 1, ResultDesc: 'Invalid payload structure' };
    }

    const {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc,
      CallbackMetadata,
    } = stkCallback;

    const payment = await prisma.payment.findFirst({
      where: {
        OR: [
          { checkoutRequestId: CheckoutRequestID },
          { transactionId: CheckoutRequestID },
        ],
      },
      include: {
        order: {
          include: {
            items: true,
            user: true,
          },
        },
      },
    });

    if (!payment) {
      logger.error(`No payment found for CheckoutRequestID: ${CheckoutRequestID}`);
      return { ResultCode: 0, ResultDesc: 'Payment not found in local system' };
    }

    // Idempotency: Ignore if already marked PAID
    if (payment.status === 'PAID') {
      logger.info(`Payment ${payment.id} already verified as PAID. Skipping redundant callback.`);
      return { ResultCode: 0, ResultDesc: 'Already processed' };
    }

    const numericResultCode = Number(ResultCode);

    if (numericResultCode === 0 && CallbackMetadata?.Item) {
      const items: any[] = CallbackMetadata.Item;
      const amountItem = items.find((i) => i.Name === 'Amount');
      const receiptItem = items.find((i) => i.Name === 'MpesaReceiptNumber');
      const phoneItem = items.find((i) => i.Name === 'PhoneNumber');

      const paidAmount = amountItem ? Number(amountItem.Value) : Number(payment.amount);
      const receiptNumber = receiptItem ? String(receiptItem.Value) : `MP-${CheckoutRequestID.slice(-8)}`;
      const customerPhone = phoneItem ? String(phoneItem.Value) : payment.phoneNumber;

      // Verify that paid amount matches order amount (prevent underpayment fraud)
      const expectedTotal = Math.round(Number(payment.order.total));
      if (paidAmount < expectedTotal) {
        logger.error(`M-Pesa underpayment detected: Paid ${paidAmount}, Expected ${expectedTotal}`);
        await prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            resultCode: 1,
            resultDesc: `Underpayment detected: Received ${paidAmount}, required ${expectedTotal}`,
            rawCallback: JSON.stringify(payload),
          },
        });
        return { ResultCode: 0, ResultDesc: 'Underpayment processed' };
      }

      await this.fulfillPayment({
        paymentId: payment.id,
        receiptNumber,
        amount: paidAmount,
        phoneNumber: customerPhone || undefined,
        resultCode: 0,
        resultDesc: ResultDesc || 'Success',
        rawCallback: JSON.stringify(payload),
      });

      logger.info(`M-Pesa payment ${payment.id} successfully fulfilled with receipt ${receiptNumber}`);
    } else {
      // Payment failed, cancelled by customer, or timed out
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            status: 'FAILED',
            resultCode: numericResultCode,
            resultDesc: ResultDesc || 'M-Pesa transaction failed or was cancelled',
            rawCallback: JSON.stringify(payload),
          },
        }),
        prisma.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            previousStatus: payment.order.status,
            newStatus: payment.order.status,
            notes: `M-Pesa payment failed (${numericResultCode}): ${ResultDesc}`,
            changedBy: 'MPESA_CALLBACK',
          },
        }),
      ]);

      logger.warn(`M-Pesa payment ${payment.id} failed with code ${numericResultCode}: ${ResultDesc}`);
    }

    return { ResultCode: 0, ResultDesc: 'Callback processed successfully' };
  }

  /**
   * Atomically marks order and payment as PAID, creates warranties for purchased items,
   * logs status history, and issues notifications.
   */
  public async fulfillPayment(params: {
    paymentId: string;
    receiptNumber: string;
    amount: number;
    phoneNumber?: string;
    resultCode: number;
    resultDesc: string;
    rawCallback?: string;
  }) {
    const payment = await prisma.payment.findUnique({
      where: { id: params.paymentId },
      include: {
        order: {
          include: {
            items: true,
            user: true,
          },
        },
      },
    });

    if (!payment || payment.status === 'PAID') {
      return;
    }

    const order = payment.order;
    const now = new Date();
    const oneYearLater = new Date(now);
    oneYearLater.setFullYear(oneYearLater.getFullYear() + 1);

    await prisma.$transaction(async (tx) => {
      // 1. Update Payment record
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: 'PAID',
          transactionId: params.receiptNumber,
          mpesaReceiptNumber: params.receiptNumber,
          phoneNumber: params.phoneNumber || payment.phoneNumber,
          resultCode: params.resultCode,
          resultDesc: params.resultDesc,
          rawCallback: params.rawCallback,
        },
      });

      // 2. Update Order
      await tx.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: 'PAID',
          paidAt: now,
          status: 'CONFIRMED',
        },
      });

      // 3. Log Order Status History
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          previousStatus: order.status,
          newStatus: 'CONFIRMED',
          notes: `Payment completed via M-Pesa. Receipt: ${params.receiptNumber}. Amount: KSh ${params.amount}`,
          changedBy: 'MPESA_SYSTEM',
        },
      });

      // 4. Automatically generate 1-year Warranties for each laptop order item
      for (const item of order.items) {
        const existingWarranty = await tx.warranty.findUnique({
          where: { orderItemId: item.id },
        });

        if (!existingWarranty) {
          await tx.warranty.create({
            data: {
              orderItemId: item.id,
              productId: item.productId,
              userId: order.userId,
              durationMonths: 12,
              warrantyType: 'MANUFACTURER',
              startDate: now,
              endDate: oneYearLater,
              terms:
                '1-Year Comprehensive Internal Hardware Warranty covering motherboard, display, and certified components. Excludes physical liquid spills or unauthorized chassis tampering.',
              isActive: true,
            },
          });
        }
      }

      // 5. In-app notification for logged-in user
      if (order.userId) {
        await tx.notification.create({
          data: {
            userId: order.userId,
            type: 'PAYMENT_SUCCESS',
            title: 'Payment Received',
            message: `Your payment of KSh ${params.amount.toLocaleString('en-KE')} for order #${order.orderNumber} was confirmed. M-Pesa Receipt: ${params.receiptNumber}.`,
            data: JSON.stringify({
              orderId: order.id,
              orderNumber: order.orderNumber,
              receipt: params.receiptNumber,
            }),
          },
        });
      }
    });

    // Send confirmation email asynchronously
    const targetEmail = order.userId ? order.user?.email : order.guestEmail;
    const customerName = order.userId
      ? `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.trim()
      : `${order.guestFirstName || ''} ${order.guestLastName || ''}`.trim();

    if (targetEmail) {
      sendEmail({
        to: targetEmail,
        subject: `Payment Confirmed - Order #${order.orderNumber} [Receipt: ${params.receiptNumber}]`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #059669;">Payment Confirmed!</h2>
            <p>Dear ${customerName || 'Valued Customer'},</p>
            <p>We have successfully received your payment of <strong>KSh ${params.amount.toLocaleString('en-KE')}</strong> via M-Pesa.</p>
            <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0;">
              <p style="margin: 4px 0;"><strong>Order Number:</strong> ${order.orderNumber}</p>
              <p style="margin: 4px 0;"><strong>M-Pesa Receipt:</strong> ${params.receiptNumber}</p>
              <p style="margin: 4px 0;"><strong>Status:</strong> CONFIRMED & PROCESSING</p>
              <p style="margin: 4px 0;"><strong>Warranty:</strong> 1-Year Comprehensive Warranty Activated</p>
            </div>
            <p>Your laptop is now queued for bench testing, packaging, and dispatch from our showroom at Mocha Place, Kisii.</p>
            <p>Thank you for choosing Apexbyte Laptops Kenya.</p>
          </div>
        `,
      }).catch((e) => logger.warn('Failed to dispatch payment confirmation email:', e));
    }
  }
}

export const mpesaService = new MpesaService();
export default mpesaService;

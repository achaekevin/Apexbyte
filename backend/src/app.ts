import path from 'path';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import passport from 'passport';
import { errorHandler, notFound } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import { botProtection } from './middleware/botProtection';
import { payloadGuard, payloadErrorHandler } from './middleware/payloadGuard';
import { sanitizeInput } from './middleware/sanitize';
import { responseTrimmer } from './middleware/responseTrimmer';
import logger from './config/logger';

// Import passport configuration
import './config/passport';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import brandRoutes from './routes/brand.routes';
import categoryRoutes from './routes/category.routes';
import cartRoutes from './routes/cart.routes';
import wishlistRoutes from './routes/wishlist.routes';
import orderRoutes from './routes/order.routes';
import paymentRoutes from './routes/payment.routes';
import reviewRoutes from './routes/review.routes';
import couponRoutes from './routes/coupon.routes';
import inventoryRoutes from './routes/inventory.routes';
import analyticsRoutes from './routes/analytics.routes';
import blogRoutes from './routes/blog.routes';
import notificationRoutes from './routes/notification.routes';
import adminRoutes from './routes/admin.routes';
import searchRoutes from './routes/search.routes';
import supportRoutes from './routes/support.routes';

const app: Application = express();

// Security headers with Helmet
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
}));

// CORS configuration
const corsOptions = {
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Strict body parsing limits to prevent DoS & memory exhaustion
app.use(express.json({ limit: '500kb' }));
app.use(express.urlencoded({ extended: true, limit: '100kb' }));

// Immediate body-parser error handler (catches malformed JSON and 413 oversized payloads)
app.use(payloadErrorHandler);

// Prevent deep nesting and excessive keys in JSON payloads
app.use(payloadGuard);

// Universal input sanitization across req.body, req.query, req.params (XSS, prototype pollution, null bytes)
app.use(sanitizeInput);

// Global response trimmer (deep-scrubs passwords, tokens, internal secrets from all JSON responses)
app.use(responseTrimmer);

// Serve uploaded media statically
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Cookie parser
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(
    morgan('combined', {
      stream: {
        write: (message: string) => logger.info(message.trim()),
      },
    })
  );
}

// Passport initialization
app.use(passport.initialize());

// Bot protection (blocks scrapers, malicious scanners, missing User-Agents on mutations, and honeypot traps)
app.use('/api', botProtection);

// Global rate limiting
app.use('/api', apiLimiter);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/support', supportRoutes);

// 404 handler
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;

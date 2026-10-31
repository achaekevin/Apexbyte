import path from 'path';
import fs from 'fs';
import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import passport from 'passport';
import { errorHandler, notFound } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
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
import warrantyRoutes from './routes/warranty.routes';
import returnRoutes from './routes/return.routes';

const app: Application = express();

// Trust reverse proxy (essential for rate limiting & secure cookie / HTTPS detection behind proxies)
app.set('trust proxy', 1);

// Attach traceable Request ID to every incoming request
app.use(requestIdMiddleware);

// Force HTTPS in production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    req.headers['x-forwarded-proto'] &&
    req.headers['x-forwarded-proto'] !== 'https'
  ) {
    return res.redirect(301, `https://${req.headers.host}${req.url}`);
  }
  next();
});

// Advanced Security Headers with Helmet
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    crossOriginOpenerPolicy: { policy: 'same-origin' },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        baseUri: ["'self'"],
        fontSrc: ["'self'", 'https:', 'data:'],
        formAction: ["'self'"],
        frameAncestors: ["'none'"],
        imgSrc: ["'self'", 'data:', 'https:', 'blob:'],
        objectSrc: ["'none'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https:'],
        upgradeInsecureRequests: process.env.NODE_ENV === 'production' ? [] : null,
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    noSniff: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    xssFilter: true,
    hidePoweredBy: true,
  })
);

// Additional security headers (Permissions-Policy)
app.use((_req, res, next) => {
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');
  res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
  next();
});

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:4000',
  'http://127.0.0.1:4000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
]
  .filter(Boolean)
  .flatMap((url) => (url as string).split(',').map((u) => u.trim()));

const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (
      allowedOrigins.includes(origin) ||
      (process.env.NODE_ENV !== 'production' &&
        (/^https?:\/\/localhost(:\d+)?$/.test(origin) || /^https?:\/\/127\.0\.0\.1(:\d+)?$/.test(origin)))
    ) {
      return callback(null, true);
    }
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
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

// Logging with Request ID correlation
morgan.token('req-id', (req: any) => req.id || '-');
if (process.env.NODE_ENV === 'development') {
  app.use(morgan(':method :url :status :response-time ms - [:req-id]'));
} else {
  app.use(
    morgan(
      ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - req_id=:req-id',
      {
        stream: {
          write: (message: string) => logger.info(message.trim()),
        },
      }
    )
  );
}

// Passport initialization
app.use(passport.initialize());

// Bot protection (blocks scrapers, malicious scanners, missing User-Agents on mutations, and honeypot traps)
app.use('/api', botProtection);

// Global rate limiting across all endpoints
app.use(apiLimiter);

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
app.use('/api/warranties', warrantyRoutes);
app.use('/api/returns', returnRoutes);

// Locate frontend dist directory across dev/prod environments
const candidateDists = [
  path.resolve(process.cwd(), '../frontend/dist'),
  path.resolve(process.cwd(), 'frontend/dist'),
  path.resolve(__dirname, '../../frontend/dist'),
  path.resolve(__dirname, '../../../frontend/dist'),
];
const frontendDist = candidateDists.find((dir) => fs.existsSync(dir));

if (frontendDist) {
  logger.info(`🌐 Serving frontend static files from: ${frontendDist}`);
  app.use(express.static(frontendDist));

  // Client-side routing fallback (SPA index.html) for all non-API and non-upload GET requests
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  logger.warn('⚠️ Frontend dist directory not found. Run "npm run build:frontend" to serve the website.');
}

// 404 handler (handles unmatched /api routes and unhandled methods)
app.use(notFound);

// Error handler
app.use(errorHandler);

export default app;

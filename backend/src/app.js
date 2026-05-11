const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
// express-mongo-sanitize is incompatible with Express 5 (req.query is read-only).
// Using a lightweight custom sanitizer for req.body and req.params instead.
const sanitize = (obj) => {
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else if (typeof obj[key] === 'object') {
        sanitize(obj[key]);
      }
    }
  }
  return obj;
};
const mongoSanitizeMiddleware = (req, res, next) => {
  if (req.body) sanitize(req.body);
  if (req.params) sanitize(req.params);
  next();
};
const compression = require('compression');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const swaggerSpec = require('./config/swagger');
const errorHandler = require('./common/middleware/error.middleware');
const logger = require('./common/utils/logger');

// Route imports
const authRoutes = require('./modules/auth/auth.routes');
const userRoutes = require('./modules/user/user.routes');
const taskRoutes = require('./modules/task/task.routes');

const app = express();

// ──────────────────────────────────────
// Security middleware
// ──────────────────────────────────────
app.use(helmet());
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
}));
app.use(compression()); // Gzip responses

// Rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // stricter for auth endpoints
  message: { success: false, message: 'Too many auth attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(generalLimiter);

// ──────────────────────────────────────
// Body parsing & sanitization
// ──────────────────────────────────────
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ limit: '10kb', extended: false }));
app.use(mongoSanitizeMiddleware); // Prevent NoSQL injection

// ──────────────────────────────────────
// Request logging (strip sensitive fields)
// ──────────────────────────────────────
const SENSITIVE_FIELDS = ['password', 'refreshToken', 'token'];

app.use((req, res, next) => {
  const safeBody = { ...req.body };
  SENSITIVE_FIELDS.forEach((f) => { if (safeBody[f]) safeBody[f] = '***'; });

  logger.info(`${req.method} ${req.originalUrl}`, {
    ip: req.ip,
    body: Object.keys(safeBody).length ? safeBody : undefined,
  });
  next();
});

// ──────────────────────────────────────
// Root Route & API Documentation
// ──────────────────────────────────────
app.get('/', (req, res) => {
  res.redirect('/api-docs');
});

const swaggerUiOptions = {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Task Manager API Docs',
  customCssUrl: 'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js'
  ]
};

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, swaggerUiOptions));

// ──────────────────────────────────────
// API Routes (versioned)
// ──────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/tasks', taskRoutes);

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ──────────────────────────────────────
// 404 handler
// ──────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found.`,
  });
});

// ──────────────────────────────────────
// Global error handler (must be last)
// ──────────────────────────────────────
app.use(errorHandler);

module.exports = app;

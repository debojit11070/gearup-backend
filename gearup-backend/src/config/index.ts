export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 5000,
  baseUrl: process.env.BASE_URL || 'http://localhost:5000',
  jwtSecret: process.env.JWT_SECRET || 'change-me-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  adminEmail: process.env.ADMIN_EMAIL || 'admin@gearup.com',
  adminPassword: process.env.ADMIN_PASSWORD || 'Admin@12345',
  adminName: process.env.ADMIN_NAME || 'GearUp Admin',
};

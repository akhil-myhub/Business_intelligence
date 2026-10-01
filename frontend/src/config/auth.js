// Auth configuration. Reads process.env directly (no other imports) so it is safe in the proxy/edge runtime.
//
// Development gets convenient demo defaults. Production is fail-closed: unless SESSION_SECRET,
// DEMO_USER_EMAIL and DEMO_USER_PASSWORD are all provided, sign-in is disabled (HTTP 503) rather than
// falling back to a guessable secret. The single demo user is the stand-in for the real identity
// provider that the backend will supply.
const isProd = process.env.NODE_ENV === 'production';

const DEV = { secret: 'dev-only-secret-change-me-0123456789abcdef', email: 'demo@businessai.app', password: 'Business@2026' };

export const authConfig = {
  secret: process.env.SESSION_SECRET || (isProd ? '' : DEV.secret),
  email: process.env.DEMO_USER_EMAIL || (isProd ? '' : DEV.email),
  password: process.env.DEMO_USER_PASSWORD || (isProd ? '' : DEV.password),
  showHint: !isProd || process.env.SHOW_DEMO_HINT === '1'
};

export const authConfigured = () => authConfig.secret.length >= 32 && Boolean(authConfig.email) && Boolean(authConfig.password);

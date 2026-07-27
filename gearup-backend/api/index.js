// Vercel serverless entrypoint - re-exports the compiled Express app.
// Build step: tsc compiles src/server.ts -> dist/server.js (which boots the app).
import app from '../dist/server';

export default app;

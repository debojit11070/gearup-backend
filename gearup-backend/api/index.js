// Vercel serverless entrypoint.
// The project is built with `npm run build` -> tsc -> dist/server.js
// We require the built CJS bundle and forward every request to the Express app.
const { createApp } = require('../dist/app');

const app = createApp();

module.exports = app;
module.exports.default = app;

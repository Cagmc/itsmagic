const appName = process.env["APP_NAME"] || "itsmagic";

const target =
  process.env[`services__${appName}be__https__0`] ||
  process.env[`services__${appName}be__http__0`];

module.exports = {
  "/api": {
    target: target,
    secure: false,
    changeOrigin: true,
    // No pathRewrite: backend endpoints include the '/api' prefix already
  },
};

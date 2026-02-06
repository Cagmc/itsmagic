const target =
  process.env["services__itsmagicbe__https__0"] ||
  process.env["services__itsmagicbe__http__0"];

module.exports = {
  "/api": {
    target: target,
    secure: false,
    changeOrigin: true,
    // No pathRewrite: backend endpoints include the '/api' prefix already
  },
};

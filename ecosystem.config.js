module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps : [
    {
      name      : "Djarvis Backend",
      script    : "server/server.js",
      env_production : {
        NODE_ENV: "production"
      }
    },
  ]
}

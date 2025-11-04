const logger=(req, res, next) => {
  const log = {
    endpoint: req.originalUrl,
    method: req.method,
    time: new Date().toISOString(),
    ip: req.ip
  };
  console.log(`Endpoint:${log.endpoint} Method:${log.method} Time:${log.time} Ip:${log.ip}`); // You can also save this to a file or database
  next();
};

module.exports = logger;
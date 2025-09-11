const logger=(req, res, next) => {
  const log = {
    endpoint: req.originalUrl,
    method: req.method,
    time: new Date().toISOString(),
    ip: req.ip
  };
  console.log(log); // You can also save this to a file or database
  next();
};

module.exports = logger;
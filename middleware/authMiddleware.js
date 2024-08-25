// Middleware to pass through without checking for Authorization header
const verifyToken = (req, res, next) => {
    // The middleware does nothing and simply calls next()
    next();
};

module.exports = { verifyToken };

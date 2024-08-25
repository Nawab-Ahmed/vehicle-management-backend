const jwt = require('jsonwebtoken');

const roleMiddleware = (requiredRole) => {
    return (req, res, next) => {
        const token = req.headers['authorization'];
        if (!token) {
            return res.status(403).json({ message: 'No token provided' });
        }

        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(500).json({ message: 'Failed to authenticate token' });
            }

            if (decoded.role !== requiredRole) {
                return res.status(403).json({ message: 'Insufficient permissions' });
            }

            req.userId = decoded.id;
            next();
        });
    };
};

module.exports = roleMiddleware;

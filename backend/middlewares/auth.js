const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization'];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token.split(" ")[1], process.env.JWT_SECRET, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized!' });
        req.user = decoded; // { id, role }
        next();
    });
};

const isManajemen = (req, res, next) => {
    if (req.user.role === 'manajemen') {
        next();
        return;
    }
    res.status(403).json({ message: 'Require Manajemen Role!' });
};

const isKasir = (req, res, next) => {
    if (req.user.role === 'kasir') {
        next();
        return;
    }
    res.status(403).json({ message: 'Require Kasir Role!' });
};

module.exports = {
    verifyToken,
    isManajemen,
    isKasir
};

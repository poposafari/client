const jwt = require('jsonwebtoken');
require("dotenv").config();

function verifyToken(req, res, next) {
    const token = req.cookies['Authorization'];

    if (!token){
        return res.redirect('/account/signin');
    }
    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.result = { auth: true, userId: decoded.username };
        next();
    } catch (error) {
        
        res.status(401).json({ error: 'Invalid token' });
    }
};

exports.verifyToken = verifyToken;
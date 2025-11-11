const jwt = require('jsonwebtoken');
const SECRET = 'mysecretkey'; // Normally use env variable

const generateToken = (user) => {
    // Payload: minimal info
    const payload = { id: user.id, email: user.email };
    return jwt.sign(payload, SECRET, { expiresIn: '1h' });
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, SECRET);
    } catch (err) {
        return null;
    }
};

module.exports = { generateToken, verifyToken };

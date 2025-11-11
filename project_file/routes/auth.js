const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { readUsers, addUser } = require('../utils/csvUtils');
const { generateToken, verifyToken } = require('../utils/auth');

router.use(express.json());

// Registration
router.post('/register', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).send('Email & password required');

    const users = await readUsers();
    if (users.find(u => u.email === email)) return res.status(400).send('User exists');

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = { id: Date.now().toString(), email, password: hashedPassword };
    await addUser(newUser);

    res.send('Registration successful');
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const users = await readUsers();
    const user = users.find(u => u.email === email);
    if (!user) return res.status(400).send('Invalid credentials');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).send('Invalid credentials');

    const token = generateToken(user);
    res.cookie('token', token, { httpOnly: true });
    res.send('Login successful');
});

// Protected route
router.get('/profile', (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.status(401).send('Not authorized');

    const payload = verifyToken(token);
    if (!payload) return res.status(401).send('Invalid token');

    res.send(`Welcome ${payload.email}`);
});

module.exports = router;

const express = require('express');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

const app = express();
app.use(cookieParser());
app.use('/auth', authRoutes);

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

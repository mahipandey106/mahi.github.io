const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const bcrypt = require('bcryptjs');

const User = require('./models/user');
const Todo = require('./models/todo');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 86400000 } // 1 day
}));

// Serve static files from public/
app.use(express.static('public'));

// MongoDB Atlas connection
mongoose.connect("mongodb://127.0.0.1:27017/todoApp")
  .then(() => console.log("DB connected"))
  .catch(err => console.log(err));


//register
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  const existing = await User.findOne({ username });
  if (existing) return res.json({ success: false, message: "Username taken" });

  const hashed = await bcrypt.hash(password, 10);

  await User.create({ username, password: hashed });

  res.json({ success: true });
});

//login
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.json({ success: false, message: "Invalid credentials" });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.json({ success: false, message: "Invalid credentials" });

  // Save user ID to session
  req.session.userId = user._id;

  res.json({ success: true });
});

//middleware to protect todo routes 
function requireLogin(req, res, next) {
  if (!req.session.userId) return res.status(401).json({ message: "Not logged in" });
  next();
}

//get all todos
app.get('/api/todos', requireLogin, async (req, res) => {
  const todos = await Todo.find({ userId: req.session.userId });
  res.json(todos);
});

//add todo
app.post('/api/todos', requireLogin, async (req, res) => {
  const todo = await Todo.create({
    userId: req.session.userId,
    text: req.body.text,
    done: false
  });
  res.json(todo);
});

//toggle done
app.post('/api/todos/toggle', requireLogin, async (req, res) => {
  const { id } = req.body;
  const todo = await Todo.findOne({ _id: id, userId: req.session.userId });

  todo.done = !todo.done;
  await todo.save();

  res.json(todo);
});

//delete todo
app.post('/api/todos/delete', requireLogin, async (req, res) => {
  const { id } = req.body;
  await Todo.deleteOne({ _id: id, userId: req.session.userId });
  res.json({ success: true });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});

const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// Enable CORS (Allow frontend to access backend)
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from frontend
  credentials: true, // Allow cookies & authorization headers
};
app.use(cors(corsOptions));

// Secret key for JWT (store in .env in production)
const JWT_SECRET = 'your-secret-key';

// Registration Endpoint
app.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name },
    });

    return res.status(201).json({ message: 'User created', userId: user.id });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ error: 'Registration failed', details: error.message });
  }
});

// Login Endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user)
      return res.status(401).json({ error: 'Invalid email or password' });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: '1h',
    });

    return res.json({ token });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ error: 'Login failed', details: error.message });
  }
});

// Protected Profile Route
app.get('/profile', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader)
      return res.status(401).json({ error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) return res.status(404).json({ error: 'User not found' });

    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ error: 'Invalid token', details: error.message });
  }
});

// Start Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});

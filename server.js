const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
app.use(express.json());

// In production, store this secret in an environment variable
const JWT_SECRET = 'your-secret-key';

// Simple test route to verify server is working
app.get('/test', (req, res) => {
  console.log('Test route hit!');
  res.send('Test route works!');
});

// Registration endpoint
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

// Login endpoint
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

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

// Protected profile endpoint
app.get('/profile', async (req, res) => {
  try {
    console.log('Profile endpoint hit!');
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ error: 'Invalid token', details: error.message });
  }
});

// Create a new report endpoint
app.post('/reports', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const {
      url,
      overallScore,
      mobileScore,
      pageSpeedScore,
      seoDetails,
      recommendations,
    } = req.body;

    const newReport = await prisma.report.create({
      data: {
        url,
        overallScore,
        mobileScore,
        pageSpeedScore,
        seoDetails,
        recommendations,
        userId: decoded.userId,
      },
    });

    return res.status(201).json({ report: newReport });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ error: 'Failed to create report', details: error.message });
  }
});

// Retrieve all reports for the logged-in user
app.get('/reports', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    const userReports = await prisma.report.findMany({
      where: { userId: decoded.userId },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ reports: userReports });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ error: 'Failed to retrieve reports', details: error.message });
  }
});

// Retrieve a specific report by ID
app.get('/reports/:id', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const reportId = parseInt(req.params.id, 10);

    const report = await prisma.report.findFirst({
      where: {
        id: reportId,
        userId: decoded.userId,
      },
    });

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    return res.json({ report });
  } catch (error) {
    console.error(error);
    return res
      .status(400)
      .json({ error: 'Failed to retrieve report', details: error.message });
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

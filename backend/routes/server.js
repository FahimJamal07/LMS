require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const net = require('net');
const { execSync } = require('child_process');
const os = require('os');

const db = require('../config/db');
const authRoutes = require('./auth');
const leaveRoutes = require('./leave');
const adminRoutes = require('./admin');
const notificationRoutes = require('./notifications');
const errorHandler = require('../middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.CLIENT_URL || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
  }),
);
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

// Function to check if port is in use and kill the process if it is
async function ensurePortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.log(`⚠️  Port ${port} is in use, attempting to free it...`);
        
        try {
          if (os.platform() === 'win32') {
            // Windows: Use netstat to find PID and taskkill to terminate
            const output = execSync(`netstat -ano | findstr :${port}`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] });
            const lines = output.split('\n').filter(l => l.trim());
            const pids = new Set();
            
            lines.forEach(line => {
              const parts = line.trim().split(/\s+/);
              if (parts.length > 0) {
                const pid = parts[parts.length - 1];
                if (pid && !isNaN(parseInt(pid))) {
                  pids.add(pid);
                }
              }
            });
            
            console.log(`Found PIDs using port ${port}: ${Array.from(pids).join(', ')}`);
            
            pids.forEach(pid => {
              try {
                execSync(`taskkill /PID ${pid} /F`, { stdio: 'pipe' });
                console.log(`✅ Killed process ${pid}`);
              } catch (e) {
                console.error(`Could not kill PID ${pid}: ${e.message}`);
              }
            });
          } else {
            // Unix/Linux/Mac: Use lsof
            const output = execSync(`lsof -i :${port}`, { encoding: 'utf-8' });
            const lines = output.split('\n');
            if (lines.length > 1) {
              const pid = lines[1].split(/\s+/)[1];
              execSync(`kill -9 ${pid}`, { stdio: 'ignore' });
              console.log(`✅ Killed process ${pid}`);
            }
          }
          
          // Wait a bit longer for the port to fully close
          setTimeout(() => resolve(), 1500);
        } catch (e) {
          console.error('Error cleaning port:', e.message);
          // Even if we can't kill it, continue after a delay
          setTimeout(() => resolve(), 1500);
        }
      } else {
        resolve();
      }
    });
    
    server.once('listening', () => {
      server.close();
      resolve();
    });
    
    server.listen(port);
  });
}

async function startServer() {
  try {
    // Ensure port is available before initializing DB
    await ensurePortAvailable(PORT);
    
    await db.init();

    const server = app.listen(PORT, () => {
      console.log(`🚀 LMS Backend running on http://localhost:${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is still in use after cleanup. Retrying...`);
        setTimeout(() => {
          server.listen(PORT);
        }, 2000);
      } else {
        throw err;
      }
    });

    // Graceful shutdown on signals
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down gracefully...');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

startServer();

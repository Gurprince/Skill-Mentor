// server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration - simplified
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Route loading function
const loadRoute = (app, routePath, basePath) => {
  try {
    console.log(`🔄 Attempting to load route: ${routePath}`);
    const router = require(routePath);
    
    // Wrap the router in a try-catch to catch route definition errors
    const wrappedRouter = express.Router();
    try {
      wrappedRouter.use(router);
    } catch (routeError) {
      console.error(`❌ Error in route definition (${routePath}):`, routeError);
      throw routeError;
    }
    
    app.use(basePath, wrappedRouter);
    console.log(`✅ Successfully loaded route: ${basePath} -> ${routePath}`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to load route ${routePath}:`, err);
    console.error('Error stack:', err.stack);
    return false;
  }
};

// Load routes one by one with error handling
const loadAllRoutes = (app) => {
  const routes = [
    { path: './auth-service/routes/authRoutes', basePath: '/api/auth' },
    { path: './user-service/routes/userRoutes', basePath: '/api/user' },
    { path: './roadmap-service/routes/roadmapRoutes', basePath: '/api/roadmap' },
    { path: './task-service/routes/submissionRoutes', basePath: '/api/submission' },
    { path: './task-service/routes/taskRoutes', basePath: '/api/task' },
    { path: './task-service/routes/resultRoutes', basePath: '/api' }
  ];

  // Load routes one at a time to isolate errors
  let allRoutesLoaded = true;
  for (const route of routes) {
    console.log(`\n--- Loading route: ${route.path} ---`);
    const success = loadRoute(app, route.path, route.basePath);
    if (!success) {
      console.error(`❌ Critical: Failed to load route ${route.path}. Stopping server.`);
      allRoutesLoaded = false;
      break;
    }
  }

  if (!allRoutesLoaded) {
    console.error('\n❌ Failed to load all routes. Please check the errors above.');
    process.exit(1);
  }

  console.log('\n✅ All routes loaded successfully!');
};

// Load all routes
loadAllRoutes(app);

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

// Create HTTP server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, async () => {
  try {
    await connectDB();
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 http://localhost:${PORT}`);
  } catch (err) {
    console.error('❌ Failed to start server:', err.message);
    process.exit(1);
  }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Close server & exit process
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});

// Handle SIGTERM for graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
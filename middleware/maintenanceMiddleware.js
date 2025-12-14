import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import AdminSetting from '../models/AdminSetting.js';

const maintenanceMiddleware = asyncHandler(async (req, res, next) => {
  // Allow access to essential routes regardless of maintenance mode
  const allowedRoutes = [
    '/api/users/login',
    '/api/admin/settings'
  ];
  if (allowedRoutes.some(route => req.originalUrl.startsWith(route))) {
    return next();
  }

  const settings = await AdminSetting.getSettings();
  const maintenanceSettings = settings.value || {};

  if (maintenanceSettings.isMaintenanceMode) {
    let token;
    let isAdmin = false;

    // Check for admin token to bypass maintenance mode
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      try {
        token = req.headers.authorization.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('role');
        if (user && user.role === 'admin') {
          isAdmin = true;
        }
      } catch (error) {
        // Invalid token, treat as non-admin
        isAdmin = false;
      }
    }

    if (isAdmin) {
      // Admin users can bypass maintenance mode
      return next();
    } else {
      // Block non-admin users
      return res.status(503).json({
        isMaintenanceMode: true,
        title: maintenanceSettings.maintenanceTitle || 'Site Under Maintenance',
        message: maintenanceSettings.maintenanceMessage || 'We are currently performing maintenance. Please check back soon.',
      });
    }
  }

  // Maintenance mode is off, proceed
  next();
});

export default maintenanceMiddleware;


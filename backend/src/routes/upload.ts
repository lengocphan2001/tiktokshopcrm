import express from 'express';
import { uploadAvatar, handleUploadError } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Upload avatar endpoint
router.post('/avatar', authenticateToken, handleUploadError, uploadAvatar, (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Return the file path
    const filePath = `/uploads/avatars/${req.file.filename}`;
    
    res.status(200).json({
      success: true,
      message: 'Avatar uploaded successfully',
      data: {
        filename: req.file.filename,
        path: filePath,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router; 
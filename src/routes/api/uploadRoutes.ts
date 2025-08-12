import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { UploadController } from '../../controllers/UploadController';
import { authenticateToken } from '../../middleware/auth';

const router = Router();
const uploadController = new UploadController();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const fileFilter = (
  req: any,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  // Allow images only
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB default
  },
  fileFilter: fileFilter,
});

// Single file upload
router.post(
  '/single',
  authenticateToken,
  upload.single('file'),
  uploadController.uploadSingle.bind(uploadController)
);

// Multiple files upload
router.post(
  '/multiple',
  authenticateToken,
  upload.array('files', 5), // Maximum 5 files
  uploadController.uploadMultiple.bind(uploadController)
);

// Get uploaded file
router.get('/file/:filename', uploadController.getFile.bind(uploadController));

// Delete uploaded file
router.delete(
  '/file/:filename',
  authenticateToken,
  uploadController.deleteFile.bind(uploadController)
);

export default router;

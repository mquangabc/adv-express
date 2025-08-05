import { Request, Response } from "express";
import path from "path";
import fs from "fs";
import { AuthenticatedRequest } from "../types";

export class UploadController {
  async uploadSingle(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const file = req.file;

      if (!file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
        return;
      }

      res.json({
        success: true,
        message: "File uploaded successfully",
        data: {
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: `/uploads/${file.filename}`,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to upload file",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async uploadMultiple(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const files = req.files as Express.Multer.File[];

      if (!files || files.length === 0) {
        res.status(400).json({
          success: false,
          message: "No files uploaded",
        });
        return;
      }

      const uploadedFiles = files.map((file) => ({
        filename: file.filename,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: `/uploads/${file.filename}`,
      }));

      res.json({
        success: true,
        message: `${files.length} files uploaded successfully`,
        data: {
          files: uploadedFiles,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to upload files",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async getFile(req: Request, res: Response): Promise<void> {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), "uploads", filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: "File not found",
        });
        return;
      }

      // Send file
      res.sendFile(filePath);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to retrieve file",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async deleteFile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const filename = req.params.filename;
      const filePath = path.join(process.cwd(), "uploads", filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        res.status(404).json({
          success: false,
          message: "File not found",
        });
        return;
      }

      // Delete file
      fs.unlinkSync(filePath);

      res.json({
        success: true,
        message: "File deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete file",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
}

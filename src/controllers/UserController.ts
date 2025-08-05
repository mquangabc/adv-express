import { Response } from "express";
import { UserModel } from "../models/User";
import { AuthenticatedRequest, UserUpdateInput } from "../types";

export class UserController {
  async getUsers(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await UserModel.findAll(page, limit);

      res.json({
        success: true,
        data: {
          users: result.users.map((user) => UserModel.toSafeUser(user)),
          pagination: {
            page,
            limit,
            total: result.total,
            totalPages: Math.ceil(result.total / limit),
          },
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch users",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      const user = await UserModel.findById(userId);
      if (!user) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const safeUser = UserModel.toSafeUser(user);
      res.json({
        success: true,
        data: { user: safeUser },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch user",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async updateUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);
      const updateData: UserUpdateInput = req.body;

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      // Check if user can update this profile
      if (req.user?.id !== userId) {
        res.status(403).json({
          success: false,
          message: "You can only update your own profile",
        });
        return;
      }

      // Check if email/username already exists (if updating)
      if (updateData.email) {
        const existingUser = await UserModel.findByEmail(updateData.email);
        if (existingUser && existingUser.id !== userId) {
          res.status(409).json({
            success: false,
            message: "Email already exists",
          });
          return;
        }
      }

      if (updateData.username) {
        const existingUser = await UserModel.findByUsername(
          updateData.username
        );
        if (existingUser && existingUser.id !== userId) {
          res.status(409).json({
            success: false,
            message: "Username already exists",
          });
          return;
        }
      }

      const updatedUser = await UserModel.update(userId, updateData);
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const safeUser = UserModel.toSafeUser(updatedUser);
      res.json({
        success: true,
        message: "User updated successfully",
        data: { user: safeUser },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update user",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async deleteUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      // Check if user can delete this profile
      if (req.user?.id !== userId) {
        res.status(403).json({
          success: false,
          message: "You can only delete your own profile",
        });
        return;
      }

      const deleted = await UserModel.delete(userId);
      if (!deleted) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to delete user",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async uploadAvatar(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({
          success: false,
          message: "Invalid user ID",
        });
        return;
      }

      // Check if user can update this profile
      if (req.user?.id !== userId) {
        res.status(403).json({
          success: false,
          message: "You can only update your own avatar",
        });
        return;
      }

      const file = req.file;
      if (!file) {
        res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
        return;
      }

      const avatarPath = `/uploads/${file.filename}`;
      const updatedUser = await UserModel.update(userId, {
        avatar: avatarPath,
      });

      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: "User not found",
        });
        return;
      }

      const safeUser = UserModel.toSafeUser(updatedUser);
      res.json({
        success: true,
        message: "Avatar uploaded successfully",
        data: { user: safeUser },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to upload avatar",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }
}

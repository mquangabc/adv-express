import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserModel } from "../models/User";
import {
  AuthenticatedRequest,
  LoginInput,
  UserCreateInput,
  JWTPayload,
} from "../types";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const userData: UserCreateInput = req.body;

      // Check if user already exists
      const existingUserByEmail = await UserModel.findByEmail(userData.email);
      if (existingUserByEmail) {
        res.status(409).json({
          success: false,
          message: "User with this email already exists",
        });
        return;
      }

      const existingUserByUsername = await UserModel.findByUsername(
        userData.username
      );
      if (existingUserByUsername) {
        res.status(409).json({
          success: false,
          message: "User with this username already exists",
        });
        return;
      }

      // Create new user
      const user = await UserModel.create(userData);
      const safeUser = UserModel.toSafeUser(user);

      // Create JWT token
      const token = this.generateToken(user);

      // Set session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      res.status(201).json({
        success: true,
        message: "User registered successfully",
        data: {
          user: safeUser,
          token,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to register user",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password }: LoginInput = req.body;

      // Find user
      const user = await UserModel.findByEmail(email);
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Validate password
      const isValidPassword = await UserModel.validatePassword(user, password);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
        return;
      }

      // Generate token
      const token = this.generateToken(user);
      const safeUser = UserModel.toSafeUser(user);

      // Set session
      req.session.user = {
        id: user.id,
        username: user.username,
        email: user.email,
      };

      // Set cookie
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      });

      res.json({
        success: true,
        message: "Login successful",
        data: {
          user: safeUser,
          token,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to login",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    try {
      // Destroy session
      req.session.destroy((err) => {
        if (err) {
          res.status(500).json({
            success: false,
            message: "Failed to logout",
          });
          return;
        }

        // Clear cookie
        res.clearCookie("auth_token");
        res.json({
          success: true,
          message: "Logout successful",
        });
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to logout",
        error: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        res.status(401).json({
          success: false,
          message: "No token provided",
        });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid token",
        });
        return;
      }

      const newToken = this.generateToken(user);

      res.json({
        success: true,
        message: "Token refreshed successfully",
        data: {
          token: newToken,
        },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  }

  async getCurrentUser(
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> {
    try {
      const authHeader = req.headers["authorization"];
      const token = authHeader && authHeader.split(" ")[1];

      if (!token) {
        // Check session
        if (req.session?.user) {
          const user = await UserModel.findById(req.session.user.id);
          if (user) {
            const safeUser = UserModel.toSafeUser(user);
            res.json({
              success: true,
              data: { user: safeUser },
            });
            return;
          }
        }

        res.status(401).json({
          success: false,
          message: "Not authenticated",
        });
        return;
      }

      const jwtSecret = process.env.JWT_SECRET || "your-secret-key";
      const decoded = jwt.verify(token, jwtSecret) as JWTPayload;

      const user = await UserModel.findById(decoded.userId);
      if (!user) {
        res.status(401).json({
          success: false,
          message: "Invalid token",
        });
        return;
      }

      const safeUser = UserModel.toSafeUser(user);
      res.json({
        success: true,
        data: { user: safeUser },
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }
  }

  private generateToken(user: any): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      username: user.username,
    };

    const jwtSecret = process.env.JWT_SECRET || "your-secret-key";

    const options: SignOptions = {
      expiresIn: "7d",
    };

    return jwt.sign(payload, jwtSecret, options);
  }
}

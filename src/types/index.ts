import { Request } from "express";

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserCreateInput {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface UserUpdateInput {
  username?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface JWTPayload {
  userId: number;
  email: string;
  username: string;
}

export interface AuthenticatedRequest extends Request {
  user?: User;
}

declare module "express-session" {
  interface SessionData {
    user: {
      id: number;
      username: string;
      email: string;
      firstName?: string;
      lastName?: string;
      avatar?: string;
    };
  }
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

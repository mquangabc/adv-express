import joi from "joi";
import { Request, Response, NextFunction } from "express";

export const validateSchema = (schema: joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error } = schema.validate(req.body);

    if (error) {
      res.status(400).json({
        success: false,
        message: "Validation error",
        details: error.details.map((detail) => ({
          field: detail.path.join("."),
          message: detail.message,
        })),
      });
      return;
    }

    next();
  };
};

export const userRegistrationSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).required(),
  email: joi.string().email().required(),
  password: joi.string().min(6).max(128).required(),
  firstName: joi.string().min(2).max(50).optional(),
  lastName: joi.string().min(2).max(50).optional(),
});

export const userLoginSchema = joi.object({
  email: joi.string().email().required(),
  password: joi.string().min(6).max(128).required(),
});

export const userUpdateSchema = joi.object({
  username: joi.string().alphanum().min(3).max(30).optional(),
  email: joi.string().email().optional(),
  firstName: joi.string().min(2).max(50).optional(),
  lastName: joi.string().min(2).max(50).optional(),
});

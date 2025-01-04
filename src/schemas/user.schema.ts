import Joi from "joi";

export const userSignupSchema = Joi.object({
  firstName: Joi.string().min(1).required().trim(),
  lastName: Joi.string().min(1).required().trim(),
  email: Joi.string().email().required().trim(),
  username: Joi.string().min(1).required().trim(),
  password: Joi.string().min(8).required().trim(),
  dob: Joi.date().required(),
  schoolName: Joi.string().min(1).required().trim(),
  schoolDepartment: Joi.string().min(1).required().trim(),
});

export const userUpdateSchema = Joi.object({
  firstName: Joi.string().min(1).required(),
  lastName: Joi.string().min(1).required(),
  email: Joi.string().email().required(),
  username: Joi.string().min(1).required(),
  dob: Joi.date().required(),
  bio: Joi.string().min(1).required(),
  schoolName: Joi.string().min(1).required(),
  schoolDepartment: Joi.string().min(1).required(),
});

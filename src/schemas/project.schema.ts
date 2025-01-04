import Joi from "joi";

export const projectCreationSchema = Joi.object({
  name: Joi.string().min(1).required().trim(),
  description: Joi.string().min(1).required().trim(),
  technologies: Joi.string().min(1).required().trim(),
  link: Joi.string().min(1).uri().required().trim(),
  githubRepo: Joi.string().min(1).uri().required().trim(),
});

export const projectUpdateSchema = Joi.object({
  name: Joi.string().min(1).required().trim(),
  description: Joi.string().min(1).required().trim(),
  technologies: Joi.string().min(1).required().trim(),
  link: Joi.string().min(1).required().trim(),
  githubRepo: Joi.string().min(1).required().trim(),
});

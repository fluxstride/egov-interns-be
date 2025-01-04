import { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import validation from "../../middlewares/validation.middleware";
import asyncWrap from "../../utils/asyncWrapper";
import { Op } from "sequelize";
import HttpException from "../../utils/http.exception";
import type User from "../../db/models/user";
import type { UserAttributes } from "../../db/models/user";
import { db } from "../../db/models";
import "dotenv/config";
import { userSignupSchema } from "../../schemas/user.schema";

type SignUpData = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  dob: Date;
  schoolName: string;
  schoolDepartment: string;
};

export type CreatedUserAttributes = Omit<UserAttributes, "password">;

export class AuthController {
  router: Router;

  constructor() {
    this.router = Router();
    this.initRoutes();
  }

  initRoutes() {
    this.router.post("/auth/signup", validation(userSignupSchema), this.signup);
    this.router.post("/auth/login", this.login);
  }

  private signup = asyncWrap(
    async (req: Request<any, any, SignUpData>, res: Response) => {
      let userData = req.body;

      const existingUsers: User[] = await db.user.findAll({
        where: {
          [Op.or]: {
            username: userData.username,
            email: userData.email,
          },
        },
      });

      if (existingUsers.length) {
        const exitstingFields: string[] = [];

        existingUsers.forEach((user) => {
          if (user.username === userData.username.toLowerCase()) {
            exitstingFields.push("username");
          }
          if (user.email === userData.email.toLowerCase()) {
            exitstingFields.push("email");
          }
        });

        const message = exitstingFields.join(" and ");

        throw new HttpException(
          409,
          `User with the provided ${message} already exists`,
        );
      }

      let createdUser = await db.user.create({
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        username: userData.username.toLocaleLowerCase().trim(),
        dob: userData.dob,
        schoolName: userData.schoolName,
        schoolDepartment: userData.schoolDepartment,
        password: userData.password,
      });

      const payload = {
        uid: createdUser.id,
      };

      const secretKey = process.env.SECRETKEY as string;
      const token = jwt.sign(payload, secretKey, {
        expiresIn: "30m",
      });

      const { password, ...user } = createdUser.dataValues;

      return res.status(201).json({
        success: true,
        user,
        token,
      });
    },
  );

  private login = asyncWrap(async (req: Request, res: Response) => {
    let loginData = req.body;

    const existingUser: User = await db.user.findOne({
      where: { username: loginData.username },
    });

    if (!existingUser) {
      throw new HttpException(401, "Invalid login credentials");
    }

    const validPassword = existingUser.verifyPassword(loginData.password);

    if (!validPassword) {
      throw new HttpException(401, "Invalid login credentials");
    }

    const uid = existingUser?.id;
    const payload = {
      uid: uid,
    };

    const secretKey = process.env.SECRETKEY as string;
    const token = jwt.sign(payload, secretKey, {
      expiresIn: "1d",
    });

    const { password, ...user } = existingUser.dataValues;

    res.status(200).json({
      success: true,
      user,
      token,
    });
  });
}

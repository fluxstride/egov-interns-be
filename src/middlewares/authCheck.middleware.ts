import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import HttpException from "../utils/http.exception";
import asyncWrap from "../utils/asyncWrapper";

export interface AuthenticatedRequest extends Request {
  uid?: string;
}

export const authCheck = asyncWrap(
  (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split("Bearer ")[1];
    if (!token) {
      throw new HttpException(401, "Unauthorized ");
    }

    const secretKey = process.env.SECRETKEY as string;
    const payload = jwt.verify(token, secretKey) as {
      uid: string;
    };
    req.uid = payload.uid;
    next();
  },
);

import express, { Application, Request, Response } from "express";
import { Controller } from "./interfaces/controllerInterface";
import cookieParser from "cookie-parser";
import cors from "cors";
import pageNotFoundMiddleware from "./middlewares/404.middleware";
import errorMiddleware from "./middlewares/error.middleware";

export class App {
  public express: Application;
  private controllers: Controller[];
  private port: number;

  constructor(controllers: Controller[], port: number) {
    this.express = express();
    this.port = port;
    this.controllers = controllers;

    this.initiatializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initiatializeMiddlewares() {
    this.express.use(cors());
    this.express.use(express.json());
    this.express.use(cookieParser());
  }

  private initializeRoutes() {
    this.express.get("/", (_req: Request, res: Response) => {
      res.json({
        message: "welcome to the e-gov intern API",
      });
    });

    this.express.get("/api", (_req: Request, res: Response) => {
      res.redirect("/");
    });

    this.controllers.forEach((controller) => {
      this.express.use("/api", controller.router);
    });
  }

  private initializeErrorHandling(): void {
    // catch 404 and forward to error handler
    this.express.use(pageNotFoundMiddleware);

    // error handler
    this.express.use(errorMiddleware);
  }

  public listen() {
    this.express.listen(this.port, () => {
      console.log(`app listening on port ${this.port}`);
    });
  }
}

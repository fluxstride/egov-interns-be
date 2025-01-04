import dotenv from "dotenv";
import { App } from "./app";
import { AuthController } from "./resources/auth/auth.controler";
import { ProjectController } from "./resources/projects/project.controller";
import { ProfileController } from "./resources/profile/profile.controller";

dotenv.config();

const PORT = Number(process.env.PORT || 5000);

const app = new App(
  [new AuthController(), new ProfileController(), new ProjectController()],
  PORT,
);

app.listen();

export default app.express;

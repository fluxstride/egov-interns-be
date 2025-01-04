import { Request, Response, Router } from "express";
import asyncWrap from "../../utils/asyncWrapper";
import HttpException from "../../utils/http.exception";
import validation from "../../middlewares/validation.middleware";
import {
  projectCreationSchema,
  projectUpdateSchema,
} from "../../schemas/project.schema";
import {
  authCheck,
  AuthenticatedRequest,
} from "../../middlewares/authCheck.middleware";
import { db } from "../../db/models";
import Project from "../../db/models/project";

type ProjectCreationData = {
  name: string;
  description: string;
  technologies: string;
  link: string;
  githubRepo: string;
};

type ProjectUpdateData = {
  name: string;
  description: string;
  technologies: string;
  link: string;
  githubRepo: string;
};

export class ProjectController {
  router: Router;

  constructor() {
    this.router = Router();

    this.router.use(authCheck);

    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/users/:userId/projects",
      validation(projectCreationSchema),
      this.createProject,
    );
    this.router.get("/users/:userId/projects", this.getProjects);
    this.router.get("/users/:userId/projects/:projectId", this.getProjectById);
    this.router.patch(
      "/users/:userId/projects/:projectId",
      validation(projectUpdateSchema),
      this.updateProject,
    );
    this.router.delete(
      "/users/:userId/projects/:projectId",
      this.deleteProject,
    );
  }

  private createProject = asyncWrap(async (req: Request, res: Response) => {
    const projectData: ProjectCreationData = req.body;
    const userId = req.params.userId;

    const createdProject: Project = await db.project.create({
      name: projectData.name,
      description: projectData.description,
      technologies: projectData.technologies,
      link: projectData.link,
      githubRepo: projectData.githubRepo,
      userId,
    });

    return res.status(201).json({
      success: true,
      data: createdProject,
    });
  });

  private getProjects = asyncWrap(async (req: Request, res: Response) => {
    const userId = req.params.userId;

    const project: Project[] = await db.project.findAll({
      where: {
        userId,
      },
      order: [["createdAt", "DESC"]],
    });

    return res
      .status(200)
      .json({ success: true, data: project, totalProjects: project.length });
  });

  private getProjectById = asyncWrap(async (req: Request, res: Response) => {
    const id = req.params.projectId;
    const userId = req.params.userId;

    const project: Project = await db.project.findOne({
      where: { id, userId },
    });

    if (!project) {
      throw new HttpException(404, "Project does not exist");
    }

    return res.status(200).json({ success: true, data: project });
  });

  public deleteProject = asyncWrap(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = req.params.projectId;
      const userId = req.params.userId;

      const project: Project = await db.project.findOne({
        where: { id, userId },
      });

      if (!project) {
        throw new HttpException(404, "Project does not exist");
      }

      await project.destroy();

      res.status(200).json({
        success: true,
        message: "Project has been deleted",
      });
    },
  );

  public updateProject = asyncWrap(
    async (req: Request<any, any, ProjectUpdateData>, res: Response) => {
      const id = req.params.projectId;
      const userId = req.params.userId;
      const updateData = req.body;

      const project: Project = await db.project.findOne({
        where: { id, userId },
      });

      if (!project) {
        throw new HttpException(404, "Project does not exist");
      }

      project.name = updateData.name;
      project.description = updateData.description;
      project.technologies = updateData.technologies;
      project.link = updateData.link;
      project.githubRepo = updateData.githubRepo;

      await project.save();

      return res.status(200).json({
        success: true,
        data: project,
      });
    },
  );
}

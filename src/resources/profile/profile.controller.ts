import { Router, Request, Response } from "express";
import {
  authCheck,
  AuthenticatedRequest,
} from "../../middlewares/authCheck.middleware";
import asyncWrap from "../../utils/asyncWrapper";
import { db } from "../../db/models";
import HttpException from "../../utils/http.exception";
import validation from "../../middlewares/validation.middleware";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import { userUpdateSchema } from "../../schemas/user.schema";
import User, { UserAttributes } from "../../db/models/user";
import path from "path";

export type Profile = Omit<UserAttributes, "password">;

type ProfileUpdateData = {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  bio: string;
  dob: Date;
  schoolName: string;
  schoolDepartment: string;
};

const supabase = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_ANON_KEY as string,
);

export class ProfileController {
  router: Router;

  constructor() {
    this.router = Router();
    this.router.use(authCheck);
    this.initRoutes();
  }

  initRoutes() {
    const storage = multer.memoryStorage();
    const upload = multer({ storage });

    this.router.get("/profile/me", this.getProfile);

    this.router.patch(
      "/profile/:userId",
      authCheck,
      validation(userUpdateSchema),
      this.updateProfile,
    );

    this.router.delete("/profile/:id", this.deleteProfile);

    this.router.patch(
      "/profile/me/image",
      authCheck,
      upload.single("profileImage"),
      this.uploadProfileImage,
    );

    this.router.get("/profile/:username", this.getProfileByUsername);
  }

  private getProfile = asyncWrap(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = req.uid;

      const profile: Profile = await db.user.findOne({
        where: { id },
        attributes: { exclude: ["password"] },
      });

      if (!profile) {
        throw new HttpException(404, "User does not exist");
      }

      return res.status(200).json({ success: true, profile });
    },
  );

  public async deleteProfile(req: AuthenticatedRequest, res: Response) {
    const userId = req.params.id;
    await db.user.destroy({
      where: {
        id: userId,
      },
    });

    res.status(200).json({
      message: "user has been deleted",
    });
  }

  public updateProfile = asyncWrap(
    async (req: Request<any, any, ProfileUpdateData>, res: Response) => {
      const userId = req.params.userId;
      const updateData = req.body;

      const user: User = await db.user.findByPk(userId);

      if (!user) {
        throw new HttpException(404, "User does not exist");
      }

      user.bio = updateData.bio;
      user.username = updateData.username;
      user.firstName = updateData.firstName;
      user.lastName = updateData.lastName;
      user.email = updateData.email;
      user.dob = updateData.dob;
      user.schoolName = updateData.schoolName;
      user.schoolDepartment = updateData.schoolDepartment;

      await user.save();

      const updatedProfile: Profile = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        username: user.username,
        dob: user.dob,
        schoolName: user.schoolName,
        schoolDepartment: user.schoolDepartment,
        linkedInLink: user.linkedInLink,
        githubLink: user.githubLink,
        profileImage: user.profileImage,
        bio: user.bio,
      };

      return res.status(200).json({
        success: true,
        profile: updatedProfile,
      });
    },
  );

  uploadProfileImage = asyncWrap(
    async (req: AuthenticatedRequest, res: Response) => {
      const file = req.file;
      if (!file) {
        throw new HttpException(
          400,
          `Kindly attach a image file to this request`,
        );
      }

      const userId = req.uid;
      const user = await db.user.findByPk(userId);
      if (!user) {
        throw new HttpException(404, `User with id ${req.uid} does not exist`);
      }

      const bucketName = process.env.PROFILE_IMAGES_BUCKET as string;

      const filePath = `${userId}-v-${new Date().getTime()}${path.extname(
        file.originalname,
      )}`;

      console.log(filePath);

      /**
       * Check for existing profile image and delete if exists
       */
      const profileImagesBucket = (
        await supabase.storage.from(bucketName).list()
      ).data;

      const exisitingImage = profileImagesBucket?.find((image) =>
        image.name.includes(user.id.toString()),
      );

      if (exisitingImage) {
        await supabase.storage.from(bucketName).remove([exisitingImage.name]);
      }

      /**
       * Upload profile image
       */
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file?.buffer!, {
          contentType: "image/*",
          upsert: true,
        });

      if (error) {
        throw new HttpException(500, error.message);
      }

      /**
       * Save profile image link to user profile
       */
      const imageUrl = `${process.env
        .SUPABASE_URL!}/storage/v1/object/public/${bucketName}/${data?.path}`;

      user.profileImage = imageUrl;

      await user.save();

      res.status(200).json({
        success: "true",
        message: "Image upload successful",
        imageUrl,
      });
    },
  );

  getProfileByUsername = asyncWrap(
    async (req: Request<any, any, ProfileUpdateData>, res: Response) => {
      const username = req.params.username;

      const existingUser: User = await db.user.findOne({ where: { username } });

      if (!existingUser) {
        throw new HttpException(404, "User does not exist");
      }

      const profile: Profile = {
        id: existingUser.id,
        firstName: existingUser.firstName,
        lastName: existingUser.lastName,
        email: existingUser.email,
        username: existingUser.username,
        dob: existingUser.dob,
        schoolName: existingUser.schoolName,
        schoolDepartment: existingUser.schoolDepartment,
        linkedInLink: existingUser.linkedInLink,
        githubLink: existingUser.githubLink,
        profileImage: existingUser.profileImage,
        bio: existingUser.bio,
      };

      return res.status(200).json({
        success: true,
        profile,
      });
    },
  );
}

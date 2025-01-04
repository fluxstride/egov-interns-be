import bcrypt from "bcrypt";
import { Model, Optional, DataTypes, Sequelize } from "sequelize";

export interface UserAttributes {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
  dob: Date;
  schoolName: string;
  schoolDepartment: string;
  linkedInLink?: string;
  githubLink?: string;
  profileImage?: string;
  bio?: string;
  verifyPassword?(plainTextPassword: string): boolean;
}

export interface UserCreationAttributes
  extends Optional<
    UserAttributes,
    "id" | "bio" | "profileImage" | "linkedInLink" | "githubLink"
  > {}

class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  boolean: any;
  public id!: string;
  public firstName!: string;
  public lastName!: string;
  public email!: string;
  public username!: string;
  public password!: string;
  public dob!: Date;
  public schoolName!: string;
  public schoolDepartment!: string;
  public linkedInLink?: string;
  public githubLink?: string;
  public profileImage?: string;
  public bio?: string;

  public static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        firstName: {
          type: new DataTypes.TEXT(),
          allowNull: false,
        },
        lastName: {
          type: new DataTypes.TEXT(),
          allowNull: false,
        },
        email: {
          type: new DataTypes.TEXT(),
          allowNull: false,
          validate: {
            isEmail: true,
          },
          unique: true,
          set(this: User, val: string) {
            this.setDataValue("email", val.toLowerCase());
          },
        },
        username: {
          type: new DataTypes.TEXT(),
          allowNull: false,
          unique: true,
          set(this: User, val: string) {
            this.setDataValue("username", val.toLowerCase());
          },
        },
        password: {
          type: new DataTypes.TEXT(),
          allowNull: false,
          set(val: string) {
            const hashedPassword = bcrypt.hashSync(val, 10);
            this.setDataValue("password", hashedPassword);
          },
        },
        dob: {
          type: DataTypes.DATE,
          allowNull: false,
        },
        schoolName: {
          type: new DataTypes.TEXT(),
          allowNull: false,
        },
        schoolDepartment: {
          type: new DataTypes.TEXT(),
          allowNull: false,
        },
        linkedInLink: {
          type: new DataTypes.TEXT(),
          allowNull: true,
        },
        githubLink: {
          type: new DataTypes.TEXT(),
          allowNull: true,
        },
        profileImage: {
          type: new DataTypes.STRING(1024),
          allowNull: true,
        },
        bio: {
          type: new DataTypes.STRING(1024),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: "user",
        tableName: "user",
        underscored: true,
        timestamps: true,
      },
    );
  }

  public static associate(sequelize: Sequelize) {
    this.hasMany(sequelize.models.project, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  }

  verifyPassword(plainTextPassword: string) {
    return bcrypt.compareSync(plainTextPassword, this.password);
  }
}

export default User;

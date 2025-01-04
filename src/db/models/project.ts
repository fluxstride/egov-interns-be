import { Model, Optional, DataTypes, Sequelize } from "sequelize";

interface ProjectAttributes {
  id: string;
  name: string;
  description: string;
  technologies: string;
  link?: string;
  githubRepo?: string;
  userId: string;
}

interface ProjectCreationAttributes extends Optional<ProjectAttributes, "id"> {}

class Project
  extends Model<ProjectAttributes, ProjectCreationAttributes>
  implements ProjectAttributes
{
  public id!: string;
  public name!: string;
  public description!: string;
  public technologies!: string;
  public link?: string;
  public githubRepo?: string;
  public userId!: string;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  public static initialize(sequelize: Sequelize) {
    this.init(
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
          allowNull: false,
        },
        name: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        description: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        technologies: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        link: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        githubRepo: {
          type: DataTypes.TEXT,
          allowNull: true,
        },
        userId: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "user",
            key: "id",
          },
        },
      },
      {
        sequelize,
        modelName: "project",
        tableName: "project",
        underscored: true,
        timestamps: true,
      },
    );
  }

  public static associate(sequelize: Sequelize) {
    this.belongsTo(sequelize.models.user, {
      foreignKey: "userId",
      onDelete: "CASCADE",
    });
  }
}

export default Project;

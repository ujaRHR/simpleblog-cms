import { sequelize } from "../config/db.ts";
import { DataTypes, Model } from "sequelize";

type PostAttributes = {
  id?: string;
  title: string;
  slug: string;
  authorId: string;
  tags: string[];
  content: string;
  htmlContent?: string;
  published: boolean;
};

class Post extends Model<PostAttributes> {
  declare id: string;
  declare title: string;
  declare slug: string;
  declare authorId: string;
  declare tags: string[];
  declare content: string;
  declare htmlContent: string;
  declare published: boolean;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      unique: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    slug: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false
    },
    authorId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "users",
        key: "id"
      },
      onDelete: "CASCADE"
    },
    tags: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    htmlContent: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    published: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: "Post",
    tableName: "posts",
    timestamps: true,
    underscored: true
  }
);

export default Post;

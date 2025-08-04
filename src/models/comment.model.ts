import { sequelize } from "../config/db.ts";
import { DataTypes, Model } from "sequelize";

type CommentAttributes = {
  id?: string;
  content: string;
  authorId: string;
  postId: string;
  parentId?: string | null;
};

class Comment extends Model<CommentAttributes> {
  declare id: string;
  declare content: string;
  declare authorId: string;
  declare postId: string;
  declare parentId: string | null;
}

Comment.init(
  {
    id: {
      type: DataTypes.UUID,
      unique: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    content: {
      type: DataTypes.STRING(999),
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
    postId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "posts",
        key: "id"
      },
      onDelete: "CASCADE"
    },
    parentId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: "comments",
        key: "id"
      },
      onDelete: "CASCADE"
    }
  },
  {
    sequelize,
    modelName: "Comment",
    tableName: "comments",
    timestamps: true,
    underscored: true
  }
);

export default Comment;

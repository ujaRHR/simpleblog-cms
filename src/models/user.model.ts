import { sequelize } from "../config/db.ts";
import { DataTypes, Model } from "sequelize";

type UserAttributes = {
  id?: string;
  fullname: string;
  email: string;
  username: string;
  password: string;
  role?: "admin" | "user";
  isVerified?: boolean;
  emailVerifyToken?: string | null;
  lastLogin?: Date;
  passwordResetToken?: string | null;
  passwordResetExpires?: Date | null;
};

class User extends Model<UserAttributes> {
  declare id: string;
  declare fullname: string;
  declare email: string;
  declare username: string;
  declare password: string;
  declare role: "admin" | "user";
  declare isVerified: boolean;
  declare emailVerifyToken: string | null;
  declare lastLogin: Date;
  declare passwordResetToken: string | null;
  declare passwordResetExpires: Date | null;
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      unique: true,
      primaryKey: true,
      defaultValue: DataTypes.UUIDV4
    },
    fullname: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    email: {
      type: DataTypes.STRING(100),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true,
        notEmpty: true
      }
    },
    username: {
      type: DataTypes.STRING(30),
      allowNull: false,
      unique: true,
      validate: {
        notEmpty: true,
        is: /^[a-zA-Z0-9](?!.*[_.]{2})[a-zA-Z0-9._]{1,28}[a-zA-Z0-9]$/i
      }
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
      allowNull: false
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    },
    emailVerifyToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    lastLogin: {
      type: DataTypes.DATE,
      defaultValue: () => new Date()
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true
  }
);

export default User;

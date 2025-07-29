import Router from "@koa/router";
import User from "../models/user.model.ts";
import { hashPassword, comparePassword } from "../utils/hash.ts";
import { issueJWT } from "../utils/jwt.ts";

const auth = new Router();

interface registerBody {
  fullname: string;
  email: string;
  username: string;
  password: string;
}

interface loginBody {
  email: string;
  password: string;
}

auth.post("/register", async (ctx) => {
  try {
    const body = ctx.request.body as registerBody;

    if (body) {
      const { fullname, email, username, password } = body;

      if (!fullname || !email || !username || !password) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: "Missing required fields!"
        };
      } else {
        if (password.length < 8) {
          ctx.status = 400;
          ctx.body = {
            success: false,
            message: "Password must be at least 8 characters long."
          };
          return;
        }

        const hashedPassword: string = await hashPassword(password);
        const user = await User.create({
          fullname,
          email,
          username,
          password: hashedPassword
        });

        if (user) {
          ctx.status = 201;
          ctx.body = {
            success: true,
            message: "User created successfully.",
            user: { fullname, email, username }
          };
        } else {
          ctx.status = 500;
          ctx.body = {
            success: false,
            message: "Failed to create a new user."
          };
        }
      }
    } else {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Request body is missing."
      };
    }
  } catch (error: any) {
    const isUnique = error.name === "SequelizeUniqueConstraintError";
    const isValidation = error.name === "SequelizeValidationError";

    ctx.status = isUnique ? 409 : isValidation ? 400 : 500;
    ctx.body = {
      success: false,
      message: isUnique
        ? "An user already exist with this username or email"
        : isValidation
        ? "Invalid username or email validation"
        : "Something went wrong!"
    };
  }
});

auth.post("/login", async (ctx) => {
  try {
    const body = ctx.request.body as loginBody;

    if (body) {
      const { email, password } = body;

      if (!email || !password) {
        ctx.status = 400;
        ctx.body = {
          success: false,
          message: "Missing required fields!"
        };
        return;
      } else {
        const existingUser = await User.findOne({
          where: {
            email: email
          }
        });

        if (!existingUser) {
          ctx.status = 404;
          ctx.body = {
            success: false,
            message: "An user doesn't exist with this email!"
          };
          return;
        }

        const user = existingUser.dataValues;

        if (await comparePassword(password, user.password)) {
          ctx.status = 200;
          ctx.body = {
            success: true,
            message: "User logged in successfully.",
            token: await issueJWT({
              id: user.id,
              fullname: user.fullname,
              email: user.email,
              username: user.username
            })
          };
        } else {
          ctx.status = 400;
          ctx.body = {
            success: false,
            message: "Password doesn't match, try again"
          };
        }
      }
    } else {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Request body is missing."
      };
    }
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong!"
    };
  }
});

export default auth;

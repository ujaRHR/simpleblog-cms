import User from "../models/user.model.ts";
import { hashPassword, comparePassword, resetToken } from "../utils/hash.ts";
import { issueJWT } from "../utils/jwt.ts";
import {
  sendEmail,
  forgotEmailTemplate,
  verifyEmailTemplate
} from "../utils/mailer.ts";
import crypto from "node:crypto";
import { Op } from "sequelize";

type bodyAttributes = {
  id?: string;
  fullname?: string;
  email?: string;
  username?: string;
  password?: string;
};

type ResetPasswordBody = {
  token: string;
  newPassword: string;
};

// scaffolding the controllers in 'auth' object
export const auth: Record<string, any> = {};

auth.register = async (ctx: any) => {
  try {
    const { fullname, email, username, password } = ctx.request
      .body as bodyAttributes;

    if (!fullname || !email || !username || !password) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Missing required fields!"
      };
      return;
    }

    if (password.length < 8) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Password must be at least 8 characters long."
      };
      return;
    }

    const hashedPassword = await hashPassword(password);

    const { rawToken, hashedToken } = resetToken();
    const protocol = ctx.request.protocol;
    const host = ctx.request.header.host;
    const origin = `${protocol}://${host}`;

    await User.create({
      fullname,
      email,
      username,
      password: hashedPassword,
      emailVerifyToken: hashedToken
    });

    ctx.status = 201;
    ctx.body = {
      success: true,
      message: "User created successfully, kindly verify your email.",
      user: { fullname, email, username }
    };

    sendEmail(
      email,
      "Verify your email",
      verifyEmailTemplate(origin, rawToken)
    );
  } catch (error: any) {
    const isUnique = error.name === "SequelizeUniqueConstraintError";
    const isValidation = error.name === "SequelizeValidationError";

    ctx.status = isUnique ? 409 : isValidation ? 400 : 500;
    ctx.body = {
      success: false,
      message: isUnique
        ? "A user already exists with this username or email."
        : isValidation
        ? "Invalid username or email format."
        : "Something went wrong!"
    };
  }
};

auth.verifyEmail = async (ctx: any) => {
  try {
    const token = Array.isArray(ctx.request.query.token)
      ? ctx.request.query.token[0]
      : ctx.request.query.token;

    if (!token) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Token is missing!"
      };
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        emailVerifyToken: hashedToken
      }
    });

    if (!user) {
      ctx.status = 400;
      ctx.body = { success: false, message: "Invalid token or expired." };
      return;
    }

    user.isVerified = true;
    user.emailVerifyToken = null;

    await user.save();

    ctx.body = {
      success: true,
      message: "Email verified successfully."
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong!"
    };
  }
};

auth.login = async (ctx: any) => {
  try {
    const { email, password } = ctx.request.body as bodyAttributes;

    if (!email || !password) {
      ctx.status = 400;
      ctx.body = { success: false, message: "Missing required fields!" };
      return;
    }

    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "User doesn't exist with this email!"
      };
      return;
    }

    const user = existingUser.dataValues;

    const passwordMatch = await comparePassword(password, user.password);
    if (!passwordMatch) {
      ctx.status = 400;
      ctx.body = { success: false, message: "Wrong password, try again." };
      return;
    }

    const token = await issueJWT({
      id: user.id,
      fullname: user.fullname,
      email: user.email,
      username: user.username
    });

    ctx.body = {
      success: true,
      message: "User logged in successfully.",
      token
    };
  } catch (error) {
    ctx.status = 500;
    ctx.body = { success: false, message: "Something went wrong!" };
  }
};

auth.me = async (ctx: any) => {
  try {
    const existingUser = await User.findByPk(ctx.state.user.id);

    if (!existingUser) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "User not found."
      };
      return;
    }

    const user = existingUser?.dataValues;

    ctx.body = {
      success: true,
      message: "User info retrieved.",
      user: {
        fullname: user.fullname,
        email: user.email,
        username: user.username,
        role: user.role,
        status: user.isVerified ? "verified" : "not-verified",
        lastLogin: user.lastLogin
      }
    };
  } catch {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong!"
    };
  }
};

auth.forgotPassword = async (ctx: any) => {
  try {
    const body = ctx.request.body as bodyAttributes;
    const email = body?.email;

    if (!email) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Missing required email field!"
      };
      return;
    }
    const existingUser = await User.findOne({ where: { email } });

    if (!existingUser) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "No user found with this email."
      };
      return;
    }

    const { rawToken, hashedToken } = resetToken();
    const protocol = ctx.request.protocol;
    const host = ctx.request.header.host;
    const origin = `${protocol}://${host}`;

    await User.update(
      {
        passwordResetToken: hashedToken,
        passwordResetExpires: new Date(Date.now() + 15 * 60 * 1000)
      },
      { where: { email } }
    );
    ctx.body = {
      success: true,
      message: "A password reset link has been sent to your email."
    };

    sendEmail(email, "Reset Password", forgotEmailTemplate(origin, rawToken));
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong!"
    };
  }
};

auth.resetPassword = async (ctx: any) => {
  try {
    const { token, newPassword } = ctx.request.body as ResetPasswordBody;

    if (!token || !newPassword) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Missing required fields!"
      };
      return;
    }

    if (newPassword.length < 8) {
      ctx.status = 400;
      ctx.body = {
        success: false,
        message: "Password must be at least 8 characters long."
      };
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: {
          [Op.gt]: new Date()
        }
      }
    });

    if (!user) {
      ctx.status = 404;
      ctx.body = {
        success: false,
        message: "Invalid or expired token."
      };
      return;
    }

    user.password = await hashPassword(newPassword);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;

    await user.save();

    ctx.body = {
      success: true,
      message: "Password reset has been successful."
    };
  } catch (error: any) {
    ctx.status = 500;
    ctx.body = {
      success: false,
      message: "Something went wrong!"
    };
  }
};

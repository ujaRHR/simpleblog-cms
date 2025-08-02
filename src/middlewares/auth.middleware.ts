import { verifyJWT } from "../utils/jwt.ts";
import User from "../models/user.model.ts";

type JWTPayload = {
  id?: string;
  fullname?: string;
  email?: string;
  role?: string;
  iat?: number;
  exp?: number;
};

export const authMiddleware = async (ctx: any, next: any) => {
  try {
    const authHeader = ctx.request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: "Authorization header missing or malformed."
      };
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = (await verifyJWT(token)) as JWTPayload;

    const user = await User.findByPk(decoded.id);

    if (!user) {
      ctx.status = 401;
      ctx.body = {
        success: false,
        message: "User not found."
      };
      return;
    }

    if (!user.isVerified) {
      ctx.status = 403;
      ctx.body = {
        success: false,
        message: "Please verify your email to continue."
      };
      return;
    }

    ctx.state.user = user;
    await next();
  } catch {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: "Invalid or expired token."
    };
  }
};

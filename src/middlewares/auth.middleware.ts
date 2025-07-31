import { verifyJWT } from "../utils/jwt.ts";

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

    const token = authHeader?.split(" ")[1];
    ctx.state.user = await verifyJWT(token);
    await next();
  } catch {
    ctx.status = 401;
    ctx.body = {
      success: false,
      message: "Invalid or expired token."
    };
  }
};

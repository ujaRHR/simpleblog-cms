import Router from "@koa/router";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { auth } from "../controllers/auth.controller.ts";

export const authRouterr = new Router();

// specific paths for /auth/.... route
authRouterr.post("/register", auth.register);
authRouterr.get("/verify-email", auth.verifyEmail);
authRouterr.post("/login", auth.login);
authRouterr.get("/me", authMiddleware, auth.register);
authRouterr.post("/forgot-password", auth.forgotPassword);
authRouterr.post("/reset-password", auth.resetPassword);

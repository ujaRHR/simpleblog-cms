import Router from "@koa/router";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { comment } from "../controllers/comment.controller.ts";

export const commentRouter = new Router();

// specific paths for /comments/.... route
commentRouter.post("/", authMiddleware, comment.create);
commentRouter.get("/:username/:slug", comment.getByPostSlug);
commentRouter.delete("/:id", authMiddleware, comment.delete);

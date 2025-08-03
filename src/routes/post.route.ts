import Router from "@koa/router";
import { authMiddleware } from "../middlewares/auth.middleware.ts";
import { post } from "../controllers/post.controller.ts";

export const postRouter = new Router();

// specific paths for /post/.... route
postRouter.post("/", authMiddleware, post.create);
postRouter.get("/", authMiddleware, post.all);
postRouter.get("/filter", post.filtered);
postRouter.patch("/:slug", authMiddleware, post.update);
postRouter.delete("/:id", authMiddleware, post.delete);
postRouter.get("/:username/:slug", post.getBySlug);
postRouter.get("/:username", post.getByUsername);

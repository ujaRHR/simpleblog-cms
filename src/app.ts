import Koa from "koa";
import bodyparser from "koa-bodyparser";
import Router from "@koa/router";
import { authRouter } from "./routes/auth.route.ts";
import { postRouter } from "./routes/post.route.ts";

const PORT = process.env.PORT || 3000;
const PROJECT_NAME = process.env.PROJECT_NAME || "Server";

const app = new Koa();
const router = new Router();
app.use(bodyparser());

// Routing prefix setup
router.use("/api/auth", authRouter.routes(), authRouter.allowedMethods());
router.use("/api/posts", postRouter.routes(), postRouter.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`${PROJECT_NAME} is listening to port ${PORT}`);
});

import Koa from "koa";
import bodyparser from "koa-bodyparser";
import Router from "@koa/router";
import { authRouterr } from "./routes/auth.route.ts";

const PORT = process.env.PORT || 3000;
const PROJECT_NAME = process.env.PROJECT_NAME || "Server";

const app = new Koa();
const router = new Router();
app.use(bodyparser());

// Routing prefix setup
router.use("/auth", authRouterr.routes(), authRouterr.allowedMethods());
// router.use("/auth", authRouterr.routes(), authRouterr.allowedMethods());
// router.use("/auth", authRouterr.routes(), authRouterr.allowedMethods());
// router.use("/auth", authRouterr.routes(), authRouterr.allowedMethods());

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(PORT, () => {
  console.log(`${PROJECT_NAME} is listening to port ${PORT}`);
});

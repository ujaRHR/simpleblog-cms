import Koa from "koa";
import Router from "@koa/router";

const port = process.env.PORT || 3000;

const app = new Koa();
const router = new Router();

router.get("/welcome", async (ctx) => {
  ctx.body = {
    message: "Say hello to Koa.js"
  };
});

app.use(router.routes());
app.use(router.allowedMethods());

app.listen(port, () => {
  console.log("Server is listening to port:", port);
});

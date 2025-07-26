import Koa from "koa";
import type { Context } from "koa";

const port = process.env.PORT || 3000;

const app = new Koa();

app.use(async (ctx: Context) => {
  ctx.body = "hello";
  ctx.body = "Initial SimpleBlog CMS with Koa.js";
});

app.listen(port, () => {
  console.log("Server is listening to port:", port);
});

const path = require('path');
const Koa = require('koa');
const app = new Koa();

app.use(require('koa-static')(path.join(__dirname, 'public')));
app.use(require('koa-bodyparser')());

const Router = require('koa-router');
const router = new Router();

let clients = {};
let timerId;

router.get('/subscribe', async (ctx, next) => {
  clients[ctx.originalUrl] = ctx;

  await new Promise((resolve) => {
    timerId = setInterval(()=> {
      if (Object.keys(clients).length === 0) {
        resolve();
      }
    }, 500);
  });

  ctx.req.on('aborted', () => {
    clients.splice(clients.indexOf(ctx), 1),
    clearInterval(timerId);
  });

  next();
});

router.post('/publish', async (ctx, next) => {
  const {message} = ctx.request.body;
  ctx.response.status = 200;
  if (message !== '') {
    Object.values(clients).forEach((clientCtx) => {
      clientCtx.body = message;
    });

    clients = {};
  } else next();
});

app.use(router.routes());

module.exports = app;

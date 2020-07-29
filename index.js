const Telegraf = require('telegraf');
const { Application, Router } = require('@cfworker/web');
const crft = require('cfworker-response-for-telegraf');

const bot = new Telegraf(TG_BOT_TOKEN);

// Your code here

const router = new Router();

router.post(SECRET_PATH, async ({ req, res }) => {
  await bot.handleUpdate(await req.body.json(), crft(res));
  res.status = 200;
});

new Application().use(router.middleware).listen();

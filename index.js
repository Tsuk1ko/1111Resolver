const { Telegraf } = require('telegraf');
const { Application, Router } = require('@cfworker/web');
const createTelegrafMiddware = require('cfworker-middware-telegraf');
const resolver = require('./src/resolver');

const bot = new Telegraf(TG_BOT_TOKEN);

bot.on('text', async ctx => {
  const text = ctx.message.text;
  if (text.startsWith('/')) return;
  ctx.replyWithMarkdown(await resolver(text));
});

const router = new Router();
router.post(SECRET_PATH, createTelegrafMiddware(bot));
new Application().use(router.middleware).listen();

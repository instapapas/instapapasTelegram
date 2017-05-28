const TelegramBot = require("node-telegram-bot-api");
const bot = new TelegramBot(process.env.API_KEY, {
  polling: true
});
//const socket = require("socket.io-client").connect("http://localhost:3000");
const socket = require("socket.io-client").connect("https://instapapas.herokuapp.com");

bot.onText(/(\/help|\/start)/, (msg, match) => {
  bot.sendMessage(msg.chat.id, "This bot is for interacting with instapapas. If you want to search a picture of instapapas, you have to write /search and then the name of the picture you want to search in the same message. If you write it in different messages, the bot will not search anything. If you want you can use it inline too.");
});

bot.onText(/\/search (.+)/, (msg, match) => {
  const name = match[1];
  socket.emit("search", name, fb => {
    for (var i in fb) {
      bot.sendPhoto(msg.chat.id, fb[i].url, {
        caption: fb[i].name
      });
    }
    if (fb.length === 0) bot.sendMessage(msg.chat.id, "No photos with that name available");
  });
});

bot.on("inline_query", msg => {
  var results = [];
  socket.emit("search", msg.query, fb => {
    for (var i in fb) {
      const img = fb[i];
      results.push({
        "id": msg.id + i,
        "type": "photo",
        "caption": img.name,
        "photo_url": img.url,
        "thumb_url": img.url
      });
    }
    bot.answerInlineQuery(msg.id, results);
  });
});

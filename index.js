const TelegramBot = require('node-telegram-bot-api');
const bot = new TelegramBot(process.env.API_KEY, {
  polling: true
});
//const socket = require('socket.io-client').connect("http://localhost:3000");
const socket = require('socket.io-client').connect("https://instapapas.herokuapp.com");
const fs = require("fs");

bot.onText(/\/search (.+)/, (msg, match) => {
  const name = match[1];

  socket.emit("search", name, fb => {
    for (var i in fb) {
      const img = fb[i];
      const startIndex = img.image.indexOf("/") + 1;
      const fileName = "tmp." + img.image.substr(startIndex, img.image.indexOf(";") - startIndex);
      fs.writeFile(fileName, img.image.substr(img.image.indexOf(",") + 1), "base64", err => {
        if (err) throw err;
        bot.sendPhoto(msg.chat.id, fileName, {
          caption: img.name
        });
        fs.unlink(fileName, err => {
          if (err) throw err;
        });
      });
    }
    if (fb.length === 0) bot.sendMessage(msg.chat.id, "No photos with that name available");
  });
});

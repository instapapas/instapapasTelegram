const TeleBot = require("telebot");
const bot = new TeleBot(process.env.API_KEY);
const socket = require('socket.io-client').connect("https://instapapas.herokuapp.com");
const fs = require("fs");

bot.on("/search", msg => {
  bot.sendMessage(msg.chat.id, "Loading...");
  const name = msg.text.substr(msg.entities[0].length + 1);

  socket.emit("search", name, fb => {
    for (var i in fb) {
      const img = fb[i];
      const startIndex = img.indexOf("/") + 1;
      const fileName = "tmp." + img.substr(startIndex, img.indexOf(";") - startIndex);
      fs.writeFile(fileName, img.substr(img.indexOf(",") + 1), "base64", err => {
        if (err) throw err;
        bot.sendPhoto(msg.chat.id, fileName, {
          caption: name
        });
        fs.unlink(fileName, err => {});
      });
    }
    if (fb.length === 0) {
      bot.sendMessage(msg.chat.id, "No photos with that name available");
    }
  });
});

bot.connect();

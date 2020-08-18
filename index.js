const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
	if (msg.content === "ping") {
		console.log(msg.author.id);
		msg.reply("pong");
	}
});

const Secrets = require("./secrets.js");

client.login(Secrets.bot_token);

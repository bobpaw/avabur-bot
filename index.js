const Secrets = require("./secrets.js");

const Discord = require("discord.js");
const client = new Discord.Client();
const fs = require("fs");
const mysql = require("mysql");
const sql_pool = mysql.createPool({
	connectionLimit: 5,
	host: "localhost",
	user: "avabur-bot",
	password: Secrets.sql_pass,
	database: "avabur"
});

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", msg => {
	if (msg.author.id !== client.user.id) console.log(msg.author.id);
	if (msg.content === "!ping") {
		msg.reply("pong");
	}
	if (msg.content === "Everyone An event is starting soon!" && msg.author.bot) {
		console.log("Received Event starting message");
		sql_pool.query("insert into events (time) values (current_timestamp())", function (err, _unused) {
			if (err) throw err;
			console.log("Logged current time in events table");
		});
	}
});

client.login(Secrets.bot_token);

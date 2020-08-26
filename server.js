"use strict";
const Secrets = require("./secrets.js");

const {promisify} = require("util");

const Discord = require("discord.js");
const client = new Discord.Client();

const mysql = require("mysql");
const sql_pool = mysql.createPool({
	connectionLimit: 5,
	host: "localhost",
	user: "avabur-bot",
	password: Secrets.sql_pass,
	database: "avabur"
});
sql_pool.query = promisify(sql_pool.query);

const getVersion = require("./lib/get-version.js");
const commands = require("./lib/commands.js");

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

async function handle_message (msg) {
	if (msg.content === "Everyone An event is starting soon!" && msg.author.bot) {
		console.log("Received Event starting message");
		await sql_pool.query("insert into events (time) values (current_timestamp())");
		console.log("Logged current time in events table");
	}
	let reply = "";
	if (/^![a-zA-Z]+/.test(msg.content)) {
		switch (msg.content.match(/^![a-zA-Z]+/)[0]) {
		case "!ping":
			reply = "pong";
			break;
		case "!luck":
			console.log("Calculating current luck.");
			try {
				let result = await sql_pool.query("select unix_timestamp(time) from events;");
				result = result.map(x => x["unix_timestamp(time)"]);
				let changes = result.map((x, i, a) => (i > 0 ? x - a[i - 1] : 0));
				changes.shift();
				let avg = changes.reduce((total, x) => total + x, 0) / changes.length;
				let time_since_last = Date.now() / 1000 - result[result.length - 1];
				reply = `Event luck is at ${(time_since_last / avg * 100).toFixed(2)}%.`;
			} catch (e) {
				console.error(e.message);
				reply = "Error calculating luck";
			}
			break;
		case "!market":
			console.log("Getting market currency values.");
			reply = await commands.market(msg.content.replace(/^!market ?/, ""));
			break;
		case "!source":
			reply = "avabur-bot by extrafox45#9230 https://github.com/bobpaw/avabur-bot";
			break;
		case "!math": case "!calc": case "!calculate":
			reply = await commands.calculate(msg.content.replace(/^!math ?|!calc(?:ulate)? ?/, ""));
			break;
		case "!version":
			try {
				reply = await getVersion();
			} catch (e) {
				console.log("Error getting version: %s", e.message);
				reply = "Error getting version.";
			}
			break;
		case "!help": case "!commands": default:
			reply = "!luck, !market, !ping, !source, !version, !help, !commands, !math, !calc, !calculate";
		}
	}
	return reply;
}

const command_messages = {};

client.on("message", async (msg) => {
	if (msg.author.id === client.user.id) return; // Don't process own messages
	console.log(`${msg.author.tag} (${msg.author.username}) - ${msg.author.id}`);
	let reply_text = await handle_message(msg);
	if (typeof reply_text !== "undefined" && reply_text !== "") {
		try {
			command_messages[msg.id] = await msg.reply(reply_text);
		} catch (e) {
			console.error("Error replying to message: %s", e.message);
		}
	}
});

client.on("messageUpdate", async (old, new_msg) => {
	if (new_msg.author.id === client.user.id) return;
	if (old.id in command_messages) {
		command_messages[new_msg.id] = await command_messages[old.id].edit(
			`<@${command_messages[old.id].mentions.users.first().id}>, ` + await handle_message(new_msg));
	} else {
		command_messages[new_msg.id] = await new_msg.reply(await handle_message(new_msg));
	}
});

client.login(Secrets.bot_token);

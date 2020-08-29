"use strict";
const Secrets = require("./secrets");

const Discord = require("discord.js");
const client = new Discord.Client();

const { handle_message } = require("./lib/commands.js");

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

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
	let reply_text = await handle_message(new_msg);
	try {
		if (typeof reply_text !== "undefined" && reply_text !== "") {
			if (old.id in command_messages) {
				command_messages[new_msg.id] = await command_messages[old.id].edit(`<@${command_messages[old.id].mentions.users.first().id}>, ${reply_text}`);
			} else {
				command_messages[new_msg.id] = await new_msg.reply(reply_text);
			}
		} else if (old.id in command_messages) {
			console.log("Deleting message ${command_messages[old.id].id}");
			command_messages[old.id].delete();
		}
	} catch (e) {
		console.error("Error editing/deleting/replying to message: %s", e.message);
	}
});

client.login(Secrets.bot_token);

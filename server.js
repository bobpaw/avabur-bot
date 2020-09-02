"use strict";

const argv = require("yargs").options({
	l: {
		alias: ["log-level", "loglevel"],
		description: "set log level",
		string: true,
		choices: ["trace", "debug", "info", "warn", "error"],
		default: "warn"
	}
}).help().version().argv;

const log = require("loglevel");
const chalk = require("chalk");
const prefix = require("loglevel-plugin-prefix");
prefix.reg(log);

prefix.apply(log, {
	format: (level, name, timestamp) => {
		const colors = {
			trace: chalk.magenta,
			debug: chalk.blue,
			info: chalk.white,
			warn: chalk.yellow,
			error: chalk.red
		};
		return `${chalk.gray(timestamp)} ${colors[level.toLowerCase()](level)}${name === "root" ? "" : chalk.green(name)}:`;
	}
});

log.setDefaultLevel(argv.loglevel); // i.e. allow Sinon or anything else to override programmatically.
log.info(`Log level is ${argv.logLevel}`);

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
	console.log(`Processing message from ${msg.author.tag} (${msg.author.username})`);
	let reply_text = await handle_message(msg);
	if (typeof reply_text !== "undefined" && reply_text !== "") {
		try {
			command_messages[msg.id] = await msg.reply(reply_text);
			console.log(`Message id of our reply: ${command_messages[msg.id].id}`);
		} catch (e) {
			console.error("Error replying to message: %s", e.message);
		}
	}
});

client.on("messageUpdate", async (old, new_msg) => {
	if (new_msg.author.id === client.user.id) return;
	console.log(`Old message id: ${old.id}\nNew message id: ${new_msg.id}`);
	let reply_text = await handle_message(new_msg);
	try {
		if (typeof reply_text !== "undefined" && reply_text !== "") {
			if (old.id in command_messages) {
				command_messages[new_msg.id] = await command_messages[old.id].edit(`<@${command_messages[old.id].mentions.users.first().id}>, ${reply_text}`);
				console.log(`Message id of our edit: ${command_messages[new_msg.id].id}`);
			} else {
				command_messages[new_msg.id] = await new_msg.reply(reply_text);
				console.log(`Message id of our reply: ${command_messages[new_msg.id].id}`);
			}
		} else if (old.id in command_messages) {
			console.log(`Deleting message ${command_messages[old.id].id}`);
			command_messages[old.id].delete();
			delete command_messages[old.id];
		}
	} catch (e) {
		console.error("Error editing/deleting/replying to message: %s", e.message);
	}
});

client.login(Secrets.bot_token).catch(e => {
	console.error("Discord.js failed to login. Error: %s", e.message);
	process.exit(1);
});

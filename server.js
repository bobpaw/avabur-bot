"use strict";
const Secrets = require("./secrets.js");

const {promisify} = require("util");

const basic_math = require("mathjs");
const math = basic_math.create(basic_math.all);
math.import({
	"import": function () { throw new Error("Function import is disabled"); },
	"createUnit": function () { throw new Error("Function createUnit is disabled"); },
	"simplify": function () { throw new Error("Function simplify is disabled"); },
	"derivative": function () { throw new Error("Function derivative is disabled"); }
}, { override: true });

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
const get_currency_prices = require("./lib/get-currency-prices.js");
const handle_market = require("./lib/commands/market.js");
const {add_commas, remove_commas} = require("./lib/util.js");

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});


async function handle_message (msg) {
	if (msg.content === "Everyone An event is starting soon!" && msg.author.bot) {
		console.log("Received Event starting message");
		sql_pool.query("insert into events (time) values (current_timestamp())", function (err) {
			if (err) throw err;
			console.log("Logged current time in events table");
		});
		return;
	}
	let reply = "I'm not sure what you want.";
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
			reply = await handle_market(msg.content.replace(/^!market ?/, ""));
			break;
		case "!source":
			reply = "avabur-bot by extrafox45#9230 https://github.com/bobpaw/avabur-bot";
			break;
		case "!math": case "!calc": case "!calculate":
			try {
				let currency_prices = await get_currency_prices();
				let scope = {
					units: function (curr, n) {
						if (!(curr in currency_prices)) throw new Error("Invalid currency");
						let price = 0;
						const listings = currency_prices[curr];
						while (n > listings[0].amount) {
							price += listings[0].amount * listings[0].price;
							n -= listings[0].amount;
							listings.shift();
						}
						if (n > 0) {
							price += listings[0].price * n;
						}
						return price;
					},
					cry: "Crystal", plat: "Platinum", food: "Food",
					wood: "Wood", iron: "Iron", stone: "Stone",
					mat: "Crafting Material", frag: "Gem Fragment",
					c: "Crystal", p: "Platinum", f: "Food", w: "Wood",
					i: "Iron", s: "Stone", cr: "Crafting Material",
					g: "Gem Fragment"
				};
				let expand_numeric_literals = function (number) {
					let final_number = number.replace(/\b(\d+(?:\.\d+)?)[Tt]/g, "($1 * 1000000000000)")
						.replace(/\b(\d+(?:\.\d+)?)[Bb]/g, "($1 * 1000000000)")
						.replace(/\b(\d+(?:\.\d+)?)[Mm]/g, "($1 * 1000000)")
						.replace(/\b(\d+(?:\.\d+)?)[Kk]/g, "($1 * 1000)");
					return final_number;
				};
				let expression = remove_commas(expand_numeric_literals(msg.content.replace(/^!(?:math|calc(?:ulate)?) /, "")).replace(/evaluate|parse/, ""));
				console.log(`Calculating expression: ${expression}`);
				try {
					reply = add_commas(await math.evaluate(expression, scope));
					console.log(`Expression evaluated to ${reply}`);
				} catch (e) {
					console.error("math.evaluate error: %s", e.message);
					reply = `Error evaluating ${msg.content} expression \`${msg.content.replace(/^!(?:math|calc(?:ulate)?) /, "")}\` -> \`${expression}\``;
				}
			} catch (e) {
				if (e.name === "AbortError") {
					console.log("Fetch aborted while trying to get currency prices");
					reply = "Fetch aborted while trying to get currency prices";
				} else if (e.name === "FetchError") {
					console.log("Error getting currency prices: %s", e.message);
					reply = "Error fetching currency prices.";
				} else {
					// Yikes, not sure what this is.
					throw e;
				}
				break;
			}
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
	if (reply_text) {
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

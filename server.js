"use strict";
const Secrets = require("./secrets.js");

const fetch = require("node-fetch");

const Git = require("simple-git")();
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

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

async function getVersion () {
	let branch = await Git.branch();
	let cur_tag = await Git.raw(["describe", "--exact-match", "--tags", "HEAD"]).catch(e => {
		if (!/fatal: no tag exactly matches/.test(e.message)) throw e;
	});
	if (cur_tag && !cur_tag.failed && /v\d\.\d\.\d(?:-[^ ]+)?/.test(cur_tag)) {
		console.log(`Providing version ${cur_tag}`);
		return cur_tag;
	} else if (branch["current"] === "experimental") {
		let commit_hash = await Git.revparse(["--short", "HEAD"]);
		console.log(`Providing current commit hash ${commit_hash}`);
		return commit_hash;
	} else {
		console.log(`Providing current branchname ${branch["current"]}`);
		return branch["current"];
	}
}

async function get_currency_prices () {
	let prices = await fetch("https://www.avabur.com/api/market/currency").then(res => res.json());
	return prices;
}

function add_commas (number) {
	// https://stackoverflow.com/a/2901298/3413725
	return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

async function handle_message (msg) {
	if (msg.content === "Everyone An event is starting soon!" && msg.author.bot) {
		console.log("Received Event starting message");
		sql_pool.query("insert into events (time) values (current_timestamp())", function (err) {
			if (err) throw err;
			console.log("Logged current time in events table");
		});
		return;
	}
	if (/^![a-zA-Z]+/.test(msg.content)) {
		switch (msg.content.match(/^![a-zA-Z]+/)[0]) {
		case "!ping":
			return "pong";
		case "!luck":
			console.log("Calculating current luck.");
			sql_pool.query("select unix_timestamp(time) from events;", function (err, result) {
				if (err) throw err;
				result = result.map(x => x["unix_timestamp(time)"]);
				let changes = result.map((x, i, a) => (i > 0 ? x - a[i - 1] : 0));
				changes.shift();
				let avg = changes.reduce((total, x) => total + x, 0) / changes.length;
				let time_since_last = Date.now() / 1000 - result[result.length - 1];
				return `Event luck is at ${(time_since_last / avg * 100).toFixed(2)}%.`;
			});
			break;
		case "!market": {
			console.log("Getting market currency values.");
			let tags = msg.content.split(" ");
			let currencies = [];
			// let ingredients = [];
			for (const tag of tags) {
				if (tag === "!market") continue;
				switch (tag.toLowerCase()) {
				case "crystals": case "crystal": case "cry": case "c":
					currencies.push("Crystal");
					break;
				case "platinum": case "plats": case "plat": case "p":
					currencies.push("Platinum");
					break;
				case "food": case "f":
					currencies.push("Food");
					break;
				case "wood": case "w":
					currencies.push("Wood");
					break;
				case "stone": case "s":
					currencies.push("Stone");
					break;
				case "iron": case "i":
					currencies.push("Iron");
					break;
				case "crafting_materials": case "crafting": case "materials": case "mats": case "m":
					currencies.push("Crafting Material");
					break;
				case "gem_fragments": case "gem": case "gems": case "frags": case "frag": case "g":
					currencies.push("Gem Fragment");
					break;
				default:
					// Gives a slightly better error
					currencies.push(tag);
				} // switch(tag)
			} // for (tag of tags)
			try {
				const currency_prices = await get_currency_prices();
				let reply = "";
				for (const currency of currencies) {
					if (currency in currency_prices) {
						reply += `${currency}: ${add_commas(currency_prices[currency][0].price)}, `;
					} else {
						reply += `Nobody is selling ${currency}, `;
					}
				}
				return reply.replace(/, $/, "");
			} catch(e) {
				console.log("Error getting currency prices: %s", e.message);
				return "Error getting currency prices.";
			}
		} // case "!market"
		case "!source":
			return "avabur-bot by extrafox45#9230 https://github.com/bobpaw/avabur-bot";
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
				let expression = expand_numeric_literals(msg.content.replace(/^!(?:math|calc(?:ulate)?) /, "").replace(/(?<!\.\d*)(?<=\d+),(?=(\d{3})+(?!\d))/g, "").replace(/evaluate|parse/, ""));
				console.log(`Calculating expression: ${expression}`);
				let re = "";
				try {
					re = add_commas(await math.evaluate(expression, scope));
					console.log(`Expression evaluated to ${re}`);
				} catch (e) {
					console.error("math.evaluate error: %s", e.message);
					re = `Error evaluating ${msg.content} expression \`${msg.content.replace(/^!(?:math|calc(?:ulate)?) /, "")}\` -> \`${expression}\``;
				}
				return re;
			} catch (e) {
				console.error("Error getting currency values: %s", e);
				return "Error getting currency values;";
			}
		case "!version":
			try {
				let val = await getVersion();
				return val;
			} catch (e) {
				console.log("Error getting version: %s", e.message);
				return "Error getting version.";
			}
		case "!help": case "!commands": default:
			return "!luck, !market, !ping, !source, !version, !help, !commands, !math, !calc, !calculate";
		}
	}
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

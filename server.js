const Secrets = require("./secrets.js");
const package_info = require("./package.json");

const https = require("https");
const fs = require("fs");

const Git = require("simple-git")();
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
	try {
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
			return branch["current"]
		}
	} catch (e) {
		throw e;
	}
}

client.on("message", msg => {
	if (msg.author.id !== client.user.id) {
		console.log(`${msg.author.tag} (${msg.author.username}) - ${msg.author.id}`);
	}
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
	if (msg.content === "!luck") {
		console.log("Calculating current luck." );
		sql_pool.query("select unix_timestamp(time) from events;", function (err, result) {
			if (err) throw err;
			result = result.map(x => x["unix_timestamp(time)"]);
			let changes = result.map((x, i, a) => (i > 0 ? x - a[i - 1]: 0));
			changes.shift();
			let avg = changes.reduce((total, x) => total + x, 0) / changes.length;
			let time_since_last = Date.now() / 1000 - result[result.length - 1];
			msg.reply(`Event luck is at ${(time_since_last / avg * 100).toFixed(2)}%.`);
		});
	}
	if (/^!market/.test(msg.content)) {
		console.log("Getting market currency values.");
		let tags = msg.content.split(" ");
		let currencies = []
		let ingredients = []
		for (const tag of tags) {
			switch (tag.toLowerCase()) {
			case "crystals":
			case "crystal":
			case "cry":
			case "c":
				currencies.push("Crystal");
				break;
			case "platinum":
			case "plats":
			case "plat":
			case "p":
				currencies.push("Platinum");
				break;
			case "food":
			case "f":
				currencies.push("Food");
				break;
			case "wood":
			case "w":
				currencies.push("Wood");
				break;
			case "stone":
			case "s":
				currencies.push("Stone");
				break;
			case "iron":
			case "i":
				currencies.push("Iron");
				break;
			case "crafting_materials":
			case "mats":
			case "crafting":
			case "materials":
			case "m":
				currencies.push("Crafting Material");
				break;
			case "gem_fragments":
			case "gem":
			case "gems":
			case "frags":
			case "frag":
			case "f":
			case "g":
				currencies.push("Gem Fragment");
				break;
			default:
				"Do nothing";
			} // switch(tag)
		} // for (tag of tags)
		https.get("https://www.avabur.com/api/market/currency", response => {
			const {statusCode} = response;
			const contentType = response.headers["content-type"];

			let error;
			if (statusCode !== 200) {
				error = new Error(`Request failed. Status Code: ${statusCode}`);
			} else if (!/^application\/json/.test(contentType)) {
				error = new Error(`Invalid content-type. Expected application/json but received ${contentType}`);
			}
			if (error) {
				console.error(error.message);
				response.resume();
				return;
			}

			response.setEncoding("utf8");
			let responseText = "";
			response.on("data", chunk => { responseText += chunk; });
			response.on("end", function () {
				try {
					const currency_prices = JSON.parse(responseText);
					let reply = ""
					for (const currency of currencies) {
						if (currency in currency_prices) {
							// https://stackoverflow.com/a/2901298/3413725
							reply += `${currency}: ${currency_prices[currency][0].price.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",")}, `;
						} else {
							reply += `Nobody is selling ${currency}, `;
						}
					}
					msg.reply(reply.replace(/, $/, ""));
				} catch (e) {
					console.error(e.message);
				}
			});
		}).on("error", (e) => {
			console.error(`Got error: ${e.message}`);
		});
	}
	if (msg.content === "!source") {
		msg.reply("avabur-bot by extrafox45#9230 https://github.com/bobpaw/avabur-bot");
	}
	if (msg.content === "!version") {
		getVersion().then(val => {msg.reply(val);});
	}
	if (msg.content === "!help" || msg.content === "!commands") {
		msg.reply("!luck, !market, !ping, !source, !version, !help, !commands");
	}
});

client.login(Secrets.bot_token);

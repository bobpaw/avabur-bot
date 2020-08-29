const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const proxyquire = require("proxyquire");
const sinon = require("sinon");

const market_response = {
	"Crystal": [
		{ price: 17950000, amount: 536, seller: "trgKai" },
		{ price: 18175000, amount: 12, seller: "pok" },
		{ price: 18179998, amount: 76, seller: "michaelts" },
		{ price: 18179999, amount: 37, seller: "zDexxa" },
		{ price: 18180000, amount: 70, seller: "ArchangelMichael" },
		{ price: 18200000, amount: 26, seller: "KONG" },
		{ price: 18300000, amount: 803, seller: "hooptie" },
		{ price: 18400000, amount: 109, seller: "troveel" },
		{ price: 18497999, amount: 26, seller: "GutsTheSwordsman" },
		{ price: 18499999, amount: 42, seller: "Juvator" }
	],
	"Platinum": [
		{ price: 8947, amount: 3389, seller: "hohmono" },
		{ price: 8948, amount: 10000, seller: "NameHere" },
		{ price: 8949, amount: 11670, seller: "Niq" },
		{ price: 8950, amount: 100000, seller: "Bidoas" },
		{ price: 8983, amount: 79999, seller: "vxmordor" },
		{ price: 8984, amount: 18924, seller: "monk" },
		{ price: 8985, amount: 12472, seller: "Imakemop" },
		{ price: 8986, amount: 78255, seller: "Sponzig" },
		{ price: 8987, amount: 98844, seller: "Mansku" },
		{ price: 8990, amount: 211000, seller: "WooliMammoth" }
	],
	"Food": [
		{ price: 54, amount: 133525797, seller: "Teerick" },
		{ price: 55, amount: 83563340, seller: "SinX" },
		{ price: 58, amount: 100101206, seller: "Thelimevodka" },
		{ price: 62, amount: 9979000, seller: "Bilagaana" },
		{ price: 64, amount: 28495390, seller: "Zassa" },
		{ price: 65, amount: 9444445, seller: "iznobest" },
		{ price: 79, amount: 21622816, seller: "Zassa" },
		{ price: 81, amount: 10000000, seller: "desgohtdinixo" },
		{ price: 10000000, amount: 100, seller: "Toskha" }
	],
	"Wood": [
		{ price: 40, amount: 251692445, seller: "Kudon" },
		{ price: 42, amount: 100000000, seller: "zorpinox" },
		{ price: 43, amount: 25034327, seller: "Artie" },
		{ price: 44, amount: 264802239, seller: "Kudon" },
		{ price: 45, amount: 250000000, seller: "Kudon" },
		{ price: 53, amount: 44358127, seller: "zotmuts" },
		{ price: 56, amount: 8000000, seller: "KittyKat" },
		{ price: 59, amount: 333666999, seller: "Matvanbeer" },
		{ price: 60, amount: 150000000, seller: "Moist" },
		{ price: 68, amount: 10000000, seller: "desgohtdinixo" }
	],
	"Iron": [
		{ price: 52, amount: 28703384, seller: "Grunstadt" },
		{ price: 54, amount: 253673795, seller: "boxsalesman" },
		{ price: 59, amount: 4460808, seller: "namfeod" },
		{ price: 68, amount: 10000000, seller: "desgohtdinixo" },
		{ price: 98, amount: 98984654, seller: "ikkes" },
		{ price: 99, amount: 180000000, seller: "dragonminja" },
		{ price: 100, amount: 100000000, seller: "Nauki" },
		{ price: 1000000, amount: 100, seller: "Toskha" }
	],
	"Stone": [
		{ price: 57, amount: 9990000, seller: "pubsta" },
		{ price: 58, amount: 8994000, seller: "atacca" },
		{ price: 59, amount: 7639600, seller: "McYeet" },
		{ price: 60, amount: 15000000, seller: "onedoesnothaveaname" },
		{ price: 60, amount: 141000, seller: "Annasparta" },
		{ price: 60, amount: 249000, seller: "hsvasia" },
		{ price: 60, amount: 88639, seller: "petrpervii" },
		{ price: 60, amount: 234400, seller: "avaartifact" },
		{ price: 61, amount: 7000000, seller: "pubsta" },
		{ price: 62, amount: 50458882, seller: "Teamocil" }
	],
	"Crafting Material": [
		{ price: 4080, amount: 312310, seller: "Revolc" },
		{ price: 4089, amount: 102174, seller: "sexysquid" },
		{ price: 4099, amount: 10000, seller: "Toskha" },
		{ price: 4100, amount: 90087, seller: "Spyder" },
		{ price: 4498, amount: 500, seller: "HaChaCha" },
		{ price: 4499, amount: 70000, seller: "Astrocto" },
		{ price: 4500, amount: 2000000, seller: "jallaland" },
		{ price: 4580, amount: 10279, seller: "Jase" },
		{ price: 4600, amount: 56898, seller: "Lisko" },
		{ price: 4780, amount: 347900, seller: "BudShots" }
	],
	"Gem Fragment": [
		{ price: 449, amount: 17721, seller: "hohmono" },
		{ price: 450, amount: 50709, seller: "sexysquid" },
		{ price: 450, amount: 90000, seller: "Enyo" },
		{ price: 500, amount: 471290, seller: "redegl" },
		{ price: 670, amount: 96259, seller: "Revolc" },
		{ price: 675, amount: 1100000, seller: "kata" },
		{ price: 696, amount: 1000000, seller: "PisoMojado" },
		{ price: 699, amount: 10000, seller: "Toskha" },
		{ price: 705, amount: 425000, seller: "Jamie" },
		{ price: 720, amount: 500000, seller: "KONG" }
	]
};

describe("commands.js", function () {
	let console_stub, log_stub;
	before(function () {
		console_stub = sinon.stub(console, "error");
		log_stub = sinon.stub(console, "log");
	});
	afterEach(function () {
		console_stub.resetHistory();
		log_stub.resetHistory();
	});
	after(function () {
		console.error.restore();
		console.log.restore();
	});
	describe("market()", function () {
		const commands = proxyquire("../lib/commands", {
			"./get-currency-prices": async () => await market_response
		});
		it("should return 17,950,000", async function () {
			await expect(commands.market("crystals")).to.eventually.equal("Crystal: 17,950,000");
		});
		it("should return 8,947", async function () {
			await expect(commands.market("platinum")).to.eventually.equal("Platinum: 8,947");
		});
		it("should return 54", async function () {
			await expect(commands.market("food")).to.eventually.equal("Food: 54");
		});
		it("should return 40", async function () {
			await expect(commands.market("wood")).to.eventually.equal("Wood: 40");
		});
		it("should return 52", async function () {
			await expect(commands.market("iron")).to.eventually.equal("Iron: 52");
		});
		it("should return 57", async function () {
			await expect(commands.market("stone")).to.eventually.equal("Stone: 57");
		});
		it("should return 4,080", async function () {
			await expect(commands.market("crafting_materials")).to.eventually.equal("Crafting Material: 4,080");
		});
		it("should return 4,080", async function () {
			await expect(commands.market("m")).to.eventually.equal("Crafting Material: 4,080");
		});
		it("should return 449", async function () {
			await expect(commands.market("gem_fragments")).to.eventually.equal("Gem Fragment: 449");
		});
		it("should return all the same stuff for all capital strings", async function () {
			await expect(commands.market("CRYSTALS")).to.eventually.equal("Crystal: 17,950,000");
			await expect(commands.market("PLATINUM")).to.eventually.equal("Platinum: 8,947");
			await expect(commands.market("FOOD")).to.eventually.equal("Food: 54");
			await expect(commands.market("WOOD")).to.eventually.equal("Wood: 40");
			await expect(commands.market("IRON")).to.eventually.equal("Iron: 52");
			await expect(commands.market("STONE")).to.eventually.equal("Stone: 57");
			await expect(commands.market("CRAFTING_MATERIALS")).to.eventually.equal("Crafting Material: 4,080");
			await expect(commands.market("M")).to.eventually.equal("Crafting Material: 4,080");
			await expect(commands.market("GEM_FRAGMENTS")).to.eventually.equal("Gem Fragment: 449");
		});
		it("should return 'Nobody is selling Glimmer'", async function () {
			await expect(commands.market("Glimmer")).to.eventually.equal("Nobody is selling Glimmer");
		});
		describe("should respond to errors named:", function () {
			let throw_stub = sinon.stub();
			let throw_commands;
			beforeEach(function () {
				throw_commands = proxyquire("../lib/commands", {
					"./get-currency-prices": async () => { await throw_stub(); }
				});
			});
			afterEach(function () {
				throw_stub = sinon.stub();
			});
			it("AbortError by returning 'Fetch aborted while trying to get currency prices.'", async function () {
				throw_stub.throws("AbortError", "Zesty testy");
				await expect(throw_commands.market("frag")).to.eventually.equal("Fetch aborted while trying to get currency prices.");
				expect(console_stub.calledOnceWith("Fetch aborted while trying to get currency prices.")).to.be.true;
			});
			it("FetchError by returning 'Error fetching currency prices'", async function () {
				throw_stub.throws("FetchError", "Zesty testy");
				await expect(throw_commands.market("frag")).to.eventually.equal("Error fetching currency prices.");
				expect(console_stub.calledOnceWith("Error getting currency prices: %s", "Zesty testy")).to.be.true;
			});
			it("something else by throwing it", async function () {
				throw_stub.throws(new TypeError("Zesty testy"));
				await expect(throw_commands.market("frag")).to.be.rejectedWith(TypeError, "Zesty testy");
			});
		});
	});
	describe("calculate()", function () {
		const commands = proxyquire("../lib/commands", {
			"./get-currency-prices": async () => await market_response
		});
		it("should return ''", async function () {
			await expect(commands.calculate()).to.eventually.equal("");
		});
		it("should return 4,000", async function () {
			await expect(commands.calculate("4000")).to.eventually.equal("4,000");
		});
		it("should return 16", async function () {
			await expect(commands.calculate("4 * 4")).to.eventually.equal("16");
		});
		it("should return 0", async function () {
			await expect(commands.calculate("units(cry, 0)")).to.eventually.equal("0");
		});
		it("should return 10,784,659,896", async function () {
			await expect(commands.calculate("units(cry, 600)")).to.eventually.equal("10,784,659,896");
		});
		it("should return 'Error evaluating units('glimmer', 1) expression `units('glimmer', 1)` -> `units('glimmer', 1)`'", async function () {
			await expect(commands.calculate("units('glimmer', 1)")).to.eventually.equal("Error evaluating units('glimmer', 1) expression `units('glimmer', 1)` -> `units('glimmer', 1)`");
			expect(console_stub.calledOnceWith("math.evaluate error: %s", "Invalid currency")).to.be.true;
		});
		it("should return 5,000", async function () {
			await expect(commands.calculate("max_units(plat, 44,736,700)")).to.eventually.equal("5,000");
		});
		it("should return 'Error evaluating max_units('glimmer', 1) expression `max_units('glimmer', 1)` -> `max_units('glimmer', 1)`'", async function () {
			await expect(commands.calculate("max_units('glimmer', 1)")).to.eventually.equal("Error evaluating max_units('glimmer', 1) expression `max_units('glimmer', 1)` -> `max_units('glimmer', 1)`");
			expect(console_stub.calledOnceWith("math.evaluate error: %s", "Invalid currency")).to.be.true;
		});
		it("should return 0", async function () {
			await expect(commands.calculate("max_units(cry, 0)")).to.eventually.equal("0");
		});
		describe("should throw ReferenceError", function () {
			it("when import is called", async function () {
				await expect(commands.calculate("import(42)")).to.eventually.equal("Error evaluating import(42) expression `import(42)` -> `import(42)`");
				expect(console_stub.calledOnceWith("math.evaluate error: %s", "Function import is disabled")).to.be.true;
			});
			it("when createUnit is called", async function () {
				await expect(commands.calculate("createUnit(42)")).to.eventually.equal("Error evaluating createUnit(42) expression `createUnit(42)` -> `createUnit(42)`");
				expect(console_stub.calledOnceWith("math.evaluate error: %s", "Function createUnit is disabled")).to.be.true;
			});
			it("when simplify is called", async function () {
				await expect(commands.calculate("simplify(42)")).to.eventually.equal("Error evaluating simplify(42) expression `simplify(42)` -> `simplify(42)`");
				expect(console_stub.calledOnceWith("math.evaluate error: %s", "Function simplify is disabled")).to.be.true;
			});
			it("when derivative is called", async function () {
				await expect(commands.calculate("derivative(42)")).to.eventually.equal("Error evaluating derivative(42) expression `derivative(42)` -> `derivative(42)`");
				expect(console_stub.calledOnceWith("math.evaluate error: %s", "Function derivative is disabled")).to.be.true;
			});
		});
		describe("should respond to errors named:", function () {
			let throw_stub = sinon.stub();
			let throw_commands;
			beforeEach(function () {
				throw_commands = proxyquire("../lib/commands", {
					"./get-currency-prices": async () => { await throw_stub(); }
				});
			});
			afterEach(function () {
				throw_stub = sinon.stub();
			});
			it("AbortError by returning 'Fetch aborted while trying to get currency prices.'", async function () {
				throw_stub.throws("AbortError", "Zesty testy");
				await expect(throw_commands.calculate("units(frag, 1)")).to.eventually.equal("Fetch aborted while trying to get currency prices.");
				expect(console_stub.calledOnceWith("Fetch aborted while trying to get currency prices.")).to.be.true;
			});
			it("FetchError by returning 'Error fetching currency prices'", async function () {
				throw_stub.throws("FetchError", "Zesty testy");
				await expect(throw_commands.calculate("units(frag, 1)")).to.eventually.equal("Error fetching currency prices.");
				expect(console_stub.calledOnceWith("Error getting currency prices: %s", "Zesty testy")).to.be.true;
			});
			it("something else by throwing it", async function () {
				throw_stub.throws(new TypeError("Zesty testy"));
				await expect(throw_commands.calculate("units(frag, 1)")).to.be.rejectedWith(TypeError, "Zesty testy");
			});
		});
	});
	describe("handle_commands()", function () {
		const sql_pool = { query: sinon.stub().resolves("") };
		const commands = proxyquire("../lib/commands", {
			"./get-version.js": () => Promise.resolve("Zestiest version available."),
			"./get-currency-prices.js": () => Promise.resolve({
				Crystal: [
					{ price: 17950000, amount: 536, seller: "trgKai" },
					{ price: 18175000, amount: 12, seller: "pok" }
				]
			}),
			"mysql": {
				createPool: () => sql_pool
			},
			"util": {
				promisify: (x) => x
			}
		});
		let message = (text) => new Object({
			id: 7,
			author: { id: 13, tag: "Wumpus#0000", username: "Wumpus", bot: false },
			content: text,
			reply: sinon.stub()
		});
		it("should reply nothing", async function () {
			await expect(commands.handle_message(message("jerry"))).to.eventually.equal("");
		});
		it("should query MySQL server", async function () {
			this.timeout(20);
			let sql_message = message("Everyone An event is starting soon!");
			sql_message.author.bot = true;
			await expect(commands.handle_message(sql_message)).to.eventually.equal("");
			expect(sql_pool.query.calledOnceWithExactly("insert into events (time) values (current_timestamp())"), "SQL Pool.query not called with `insert into events(time) values(current_timestamp())'").to.be.true;
			expect(log_stub.calledWithExactly("Received Event starting message"), "Received Event message not logged.").to.be.true;
			expect(log_stub.calledWithExactly("Logged current time in events table"), "Successfully insert'd message not logged").to.be.true;
			sql_pool.query.reset();
		});
		it("should return luck", async function () {
			this.timeout(20);
			let response = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
			let date_stub = sinon.stub(Date, "now").returns(105 * 1000);
			sql_pool.query.returns(response.map(x => { return {"unix_timestamp(time)": x}; }));
			await expect(commands.handle_message(message("!luck"))).to.eventually.equal("Event luck is at 50.00%.");
			expect(log_stub.calledWithExactly("Calculating current luck.")).to.be.true;
			date_stub.restore();
		});
		it("should ignore breaks of more than 6 hours", async function () {
			this.timeout(20);
			let response = [0, 10, 20, 30, 40, 50000, 50010, 50020, 50030, 50040, 50050];
			let date_stub = sinon.stub(Date, "now").returns(50055 * 1000);
			sql_pool.query.returns(response.map(x => { return { "unix_timestamp(time)": x }; }));
			await expect(commands.handle_message(message("!luck"))).to.eventually.equal("Event luck is at 50.00%.");
			expect(log_stub.calledWithExactly("Calculating current luck.")).to.be.true;
			date_stub.restore();
		});
		it("should return error getting luck", async function () {
			sql_pool.query.rejects(new Error("Zesty testy"));
			await expect(commands.handle_message(message("!luck"))).to.eventually.equal("Error calculating luck");
			expect(console_stub.calledOnceWithExactly("Zesty testy")).to.be.true;
		});
		it("should reply with help string", async function () {
			await expect(commands.handle_message(message("!help"))).to.eventually.equal("!luck, !market, !ping, !source, !version, !help, !commands, !math, !calc, !calculate");
		});
		it("should reply with pong", async function () {
			await expect(commands.handle_message(message("!ping"))).to.eventually.equal("pong");
		});
		it("should reply with source info", async function () {
			await expect(commands.handle_message(message("!source"))).to.eventually.equal("avabur-bot by extrafox45#9230 https://github.com/bobpaw/avabur-bot");
		});
		it("should do some math", async function () {
			await expect(commands.handle_message(message("!calc 40 * 32"))).to.eventually.equal("1,280");
		});
		it("should return version", async function () {
			await expect(commands.handle_message(message("!version"))).to.eventually.equal("Zestiest version available.");
		});
		it("should return 'error getting version'", async function () {
			let throw_commands = proxyquire("../lib/commands", {
				"./get-version.js": () => Promise.reject(new Error("Gung ho!"))
			});
			await expect(throw_commands.handle_message(message("!version"))).to.eventually.equal("Error getting version.");
			expect(log_stub.calledOnceWithExactly("Error getting version: %s", "Gung ho!")).to.be.true;
		});
		it("should return crystal market value", async function () {
			await expect(commands.handle_message(message("!market cry"))).to.eventually.equal("Crystal: 17,950,000");
		});
		it("should return nobody is selling", async function () {
			await expect(commands.handle_message(message("!market glimmer"))).to.eventually.equal("Nobody is selling glimmer");
		});
	});
});

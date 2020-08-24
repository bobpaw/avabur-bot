const { describe, it } = require("mocha");
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const proxyquire = require("proxyquire");
const sinon = require("sinon");

const market_response = {
	Crystal: [
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
	Platinum: [
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
	Food: [
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
	Wood: [
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
	Iron: [
		{ price: 52, amount: 28703384, seller: "Grunstadt" },
		{ price: 54, amount: 253673795, seller: "boxsalesman" },
		{ price: 59, amount: 4460808, seller: "namfeod" },
		{ price: 68, amount: 10000000, seller: "desgohtdinixo" },
		{ price: 98, amount: 98984654, seller: "ikkes" },
		{ price: 99, amount: 180000000, seller: "dragonminja" },
		{ price: 100, amount: 100000000, seller: "Nauki" },
		{ price: 1000000, amount: 100, seller: "Toskha" }
	],
	Stone: [
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
	let console_stub = sinon.stub(console, "error");
	afterEach(function () {
		console_stub.resetHistory();
	});
	after(function () {
		console_stub.restore();
	});
	describe("market()", function () {
		const commands = proxyquire("../lib/commands", {
			"./get-currency-prices": async () => await market_response
		});
		it("should return 17,950,000", async function () {
			expect(await commands.market("cry")).to.equal("Crystal: 17,950,000");
		});
		it("should return 8,947", async function () {
			expect(await commands.market("plat")).to.equal("Platinum: 8,947");
		});
		it("should return 54", async function () {
			expect(await commands.market("food")).to.equal("Food: 54");
		})
		it("should return 40", async function () {
			expect(await commands.market("wood")).to.equal("Wood: 40");
		})
		it("should return 52", async function () {
			expect(await commands.market("iron")).to.equal("Iron: 52");
		})
		it("should return 57", async function () {
			expect(await commands.market("stone")).to.equal("Stone: 57");
		})
		it("should return 4,080", async function () {
			expect(await commands.market("mats")).to.equal("Crafting Material: 4,080");
		})
		it("should return 449", async function () {
			expect(await commands.market("frag")).to.equal("Gem Fragment: 449");
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
			})
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
			})
		});
	});
});

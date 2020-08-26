const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const Discord = require("discord.js");
const client = new Discord.Client();
let login_stub = sinon.stub(client, "login");
client.user = {
	id: 1,
	user: {id: 2, tag: "avabur-bot#0000", username: "avabur-bot", bot: true }
};

const sql_pool = {
	query: sinon.stub().returns(Promise.resolve(""))
};

describe("server.js", function () {
	proxyquire("../server.js", {
		"discord.js": {
			Client: function () {
				return client;
			}
		},
		"mysql": {
			createPool: function () {
				return sql_pool;
			}
		},
		"./secrets": {
			bot_token: "token",
			sql_pass: "password"
		},
		"util": {
			promisify: sinon.stub().withArgs(sql_pool.query).returns(Promise.resolve(sql_pool.query))
		}
	});

	let fakeMessage;
	let log_stub, error_stub;
	before(function () {
		fakeMessage = {
			id: 7,
			author: { id: 13, tag: "Wumpus#0000", username: "Wumpus", bot: false },
			content: "",
			reply: sinon.stub()
		};
		log_stub = sinon.stub(console, "log");
		error_stub = sinon.stub(console, "error");
	});
	beforeEach(function () {
		fakeMessage.content = "";
	});
	afterEach(function () {
		fakeMessage.reply.reset();
		log_stub.reset();
		error_stub.reset();
	});
	after(function () {
		client.destroy();
		console.log.restore();
		console.error.restore();
	});
	it("should reply nothing", function (done) {
		this.timeout(20);
		fakeMessage.content = "jerry";
		client.once("message", function () { done(); });
		client.emit("message", fakeMessage);
		expect(fakeMessage.reply.called).to.be.false;
	});
	it("should error when reply throws", function (done) {
		this.timeout(20);
		fakeMessage.content = "!help";
		fakeMessage.reply.throws("Error", "Zesty testy");
		client.once("message", function () { done(); });
		client.emit("message", fakeMessage);
		expect(error_stub.calledOnceWithExactly("Error replying to message: %s", "Zesty testy")).to.be.true;
	});
	it("should have only called login once", function (done) {
		client.once("ready", function () { done(); });
		client.emit("ready");
		expect(login_stub.calledOnce).to.be.true;
		expect(log_stub.calledOnceWithExactly("Logged in as avabur-bot#0000!"));
	});
	it("should query MySQL server", function (done) {
		let sql_message = { ...fakeMessage };
		sql_message.content = "Everyone An event is starting soon!";
		sql_message.author.bot = true;
		client.once("message", function () { done(); });
		client.emit("message", sql_message);
		expect(sql_pool.query.calledOnceWithExactly("insert into events(time) values(current_timestamp())"));
		expect(log_stub.calledWithExactly("Received Event starting message")).to.be.true;
		expect(log_stub.calledWithExactly("Logged current time in events table")).to.be.true;
		sql_pool.query.reset();
	});
	it("should reply with help string", function (done) {
		this.timeout(20);
		fakeMessage.content = "!help";
		client.once("message", function () { done(); });
		client.emit("message", fakeMessage);
		expect(fakeMessage.reply.calledOnceWithExactly("!luck, !market, !ping, !source, !version, !help, !commands, !math, !calc, !calculate"));
	});
	it("should reply with pong", function (done) {
		this.timeout(20);
		fakeMessage.content = "!ping";
		client.once("message", function () { done(); });
		client.emit("message", fakeMessage);
		expect(fakeMessage.reply.calledOnceWithExactly("pong"));
	});
});
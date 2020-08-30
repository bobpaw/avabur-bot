const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const Discord = require("discord.js");
const client = new Discord.Client();
let login_stub = sinon.stub(client, "login").resolves("bot_token");
client.user = { id: 1, tag: "avabur-bot#0000", username: "avabur-bot", bot: true };
let messageStub = sinon.stub();
client.on("message", messageStub);

describe("server.js", function () {
	proxyquire("../server.js", {
		"discord.js": {
			Client: function () {
				return client;
			}
		},
		"./secrets": {
			bot_token: "token",
			sql_pass: "password"
		},
		"./lib/commands": {
			"handle_command": () => { "Response"; },
			"@noCallThru": true
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
	let sendMessage = (self, done, text) => {
		let msgObject = fakeMessage;
		self.timeout(20);
		switch (typeof text) {
		case "string":
			msgObject.content = text;
			break;
		case "object":
			msgObject = text;
		}
		client.once("message", function () { done(); });
		client.emit("message", msgObject);
	};
	it("should error when reply throws", function (done) {
		fakeMessage.reply.throws("Error", "Zesty testy");
		sendMessage(this, done);
		expect(error_stub.calledOnceWithExactly("Error replying to message: %s", "Zesty testy")).to.be.true;
	});
	it("should have only called login once", function (done) {
		client.once("ready", function () { done(); });
		client.emit("ready");
		expect(login_stub.calledOnce).to.be.true;
		expect(log_stub.calledOnceWithExactly("Logged in as avabur-bot#0000!"));
	});
});

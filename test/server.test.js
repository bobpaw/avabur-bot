const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const expect = chai.expect;
const sinon = require("sinon");
const proxyquire = require("proxyquire");

const event_handlers = {};
let login_stub = sinon.stub().resolves("bot_token");

describe("server.js", function () {
	proxyquire("../server.js", {
		"discord.js": {
			Client: function () {
				this.login = login_stub;
				this.user = { id: 1, tag: "avabur-bot#0000", username: "avabur-bot", bot: true };
				this.on = function (event, handler) {
					if (!(event in event_handlers)) event_handlers[event] = [];
					event_handlers[event].push(handler);
				};
			}
		},
		"./secrets": {
			bot_token: "token",
			sql_pass: "password"
		},
		"./lib/commands": {
			"handle_message": () => "Response",
			"@noCallThru": true
		}
	});

	let fakeMessage = {
		id: 7,
		author: { id: 13, tag: "Wumpus#0000", username: "Wumpus", bot: false },
		content: "",
		reply: sinon.stub()
	};
	let log_stub, error_stub;
	before(function () {
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
		console.log.restore();
		console.error.restore();
	});
	it("should error when reply throws", async function () {
		fakeMessage.reply.rejects(new Error("Zesty testy"));
		
		// Call all message handlers
		for (let handler of event_handlers["message"]) {
			await handler(fakeMessage);
		}
		expect(error_stub.calledOnceWithExactly("Error replying to message: %s", "Zesty testy")).to.be.true;
	});
	it("should have only called login once", function () {
		expect(event_handlers["ready"].length).to.equal(1);
		event_handlers["ready"][0]();
		expect(login_stub.calledOnce).to.be.true;
		expect(log_stub.calledOnceWithExactly("Logged in as avabur-bot#0000!"));
	});
	it("should exit on login failure", function () {
		let exit_stub = sinon.stub(process, "exit");

		// FIXME: Remove what is unnecessary and use this as a template for recreating the above proxyuire call that's probably wrong.
		proxyquire("../server.js", {
			"discord.js": {
				Client: function () {
					this.on = sinon.stub();
					this.login = () => Promise.reject(new Error("Zesty testy")).finally(function () {
						expect(error_stub.calledOnceWithExactly("Discord.js failed to login. Error: %s", "Zesty testy"), "console.error not called").to.be.true;
						expect(exit_stub.calledWithExactly(1), "process.exit not called").to.be.true;
						exit_stub.restore();
					});
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
	});
});

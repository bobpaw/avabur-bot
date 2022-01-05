import chai from "chai";
import chaiAsPromised from "chai-as-promised";
chai.use(chaiAsPromised);
const expect = chai.expect;

import sinon from "sinon";
import proxyquire from "proxyquire";

const event_handlers = {};
async function call_handlers (event, ...args) {
	for (let handler of event_handlers[event]) {
		await handler(...args);
	}
}
let login_stub = sinon.stub().resolves("bot_token");
let this_user = { id: 1, tag: "avabur-bot#0000", username: "avabur-bot", bot: true };
let response_stub = sinon.stub().resolves("Response");

describe("server.js", function () {
	proxyquire("../server.js", {
		"discord.js": {
			Client: function () {
				this.login = login_stub;
				this.user = this_user;
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
			"handle_message": response_stub,
			"@noCallThru": true
		}
	});

	let fakeMessage = {
		id: 7,
		author: { id: 13, tag: "Wumpus#0000", username: "Wumpus", bot: false },
		content: "",
		reply: sinon.stub()
	};
	let replyMessage = {
		id: 8,
		author: this_user,
		content: "",
		edit: sinon.stub(),
		reply: sinon.stub(),
		delete: sinon.stub(),
		mentions: {
			users: {
				first: () => fakeMessage.author
			}
		}
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
		replyMessage.edit.reset();
		replyMessage.reply.reset();
		replyMessage.delete.reset();
		log_stub.reset();
		error_stub.reset();
	});
	after(function () {
		console.log.restore();
		console.error.restore();
	});
	it("should only have one event handler per event", function () {
		expect(event_handlers["ready"].length, "More than one ready handler").to.equal(1);
		expect(event_handlers["message"].length, "More than one message handler").to.equal(1);
		expect(event_handlers["messageUpdate"].length, "More than one messageUpdate handler").to.equal(1);
	});
	it("should error when reply throws", async function () {
		fakeMessage.reply.rejects(new Error("Zesty testy"));
		
		await call_handlers("message", fakeMessage);
		expect(error_stub.calledOnceWithExactly("Error replying to message: %s", "Zesty testy")).to.be.true;
	});
	it("should return nothing and log reply id on success", async function () {
		fakeMessage.reply.resolves(replyMessage);

		// Call all message handlers
		await call_handlers("message", fakeMessage);
		expect(fakeMessage.reply.calledWith("Response"), "msg.reply not called with correct arguments").to.be.true;
		expect(log_stub.calledWithExactly(`Message id of our reply: ${replyMessage.id}`), "console.log not called").to.be.true;
	});
	it("should not try to process my own reply", async function () {
		await call_handlers("message", replyMessage);

		expect(fakeMessage.reply.notCalled).to.be.true;
		expect(log_stub.notCalled).to.be.true;
		expect(error_stub.notCalled).to.be.true;
	});
	it("should not reply to messages without response", async function () {
		// This test doesn't match most realities, since handle_message usually returns "" rather than undefined
		response_stub.resolves();
		await call_handlers("message", fakeMessage);

		expect(fakeMessage.reply.notCalled).to.be.true;
		expect(log_stub.calledOnce).to.be.true;
		expect(error_stub.notCalled).to.be.true;
	});
	it("should not reply to message where response is empty", async function () {
		response_stub.resolves("");
		await call_handlers("message", fakeMessage);

		expect(fakeMessage.reply.notCalled).to.be.true;
		expect(log_stub.calledOnce).to.be.true;
		expect(error_stub.notCalled).to.be.true;
	});
	it("should edit its response", async function () {
		let newMessage = { ...fakeMessage };
		response_stub.resolves("Updated response");
		replyMessage.edit.resolves(replyMessage);
		await call_handlers("messageUpdate", fakeMessage, newMessage);

		expect(replyMessage.edit.calledWithExactly("<@13>, Updated response"), "edit not called with correct arguments").to.be.true;
		expect(log_stub.calledWithExactly("Message id of our edit: 8"), "console.log not called").to.be.true;
	});
	it("should not try to process it's own update", async function () {
		await call_handlers("messageUpdate", replyMessage, replyMessage);

		expect(replyMessage.edit.notCalled).to.be.true;
		expect(replyMessage.reply.notCalled).to.be.true;
		expect(replyMessage.delete.notCalled).to.be.true;
		expect(log_stub.notCalled).to.be.true;
		expect(error_stub.notCalled).to.be.true;
	});
	it("should delete replies when the new response is empty", async function () {
		response_stub.resolves();
		await call_handlers("messageUpdate", fakeMessage, fakeMessage);

		expect(replyMessage.delete.calledOnce).to.be.true;
		expect(log_stub.calledWithExactly("Deleting message 8")).to.be.true;
	});
	it("should do nothing to message edits that are not now commands", async function () {
		response_stub.resolves();
		await call_handlers("messageUpdate", fakeMessage, fakeMessage);

		expect(replyMessage.edit.notCalled, "Edit was called").to.be.true;
		expect(replyMessage.reply.notCalled, "Reply was called").to.be.true;
		expect(replyMessage.delete.notCalled, "Delete was called").to.be.true;
		expect(log_stub.calledOnce, "console.log was called").to.be.true;
		expect(error_stub.notCalled, "console.error was called").to.be.true;
	});
	it("should reply to messages with a new response", async function () {
		response_stub.resolves("An interesting new response");
		fakeMessage.reply.resolves(replyMessage);
		await call_handlers("messageUpdate", fakeMessage, fakeMessage);

		expect(fakeMessage.reply.calledWithExactly("An interesting new response")).to.be.true;
		expect(log_stub.calledWithExactly("Message id of our reply: 8"), "Reply not called with correct argument").to.be.true;
	});
	it("should reply with error message on exceptions", async function () {
		replyMessage.delete.throws(new Error("Zesty testy"));
		response_stub.resolves();
		await call_handlers("messageUpdate", fakeMessage, fakeMessage);

		expect(error_stub.calledWithExactly("Error editing/deleting/replying to message: %s", "Zesty testy")).to.be.true;
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

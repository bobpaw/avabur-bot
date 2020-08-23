const { describe, it } = require("mocha");
const { expect } = require("chai");

const { add_commas, remove_commas } = require("../lib/util.js");

describe("util.js", function () {
	describe("add_commas()", function () {
		it("should add commas to integer", function () {
			expect(add_commas(1234)).equals("1,234");
		});
		it("should add commas to longer integers", function () {
			expect(add_commas(1234567)).equals("1,234,567");
		})
		it("should add commas to front of float", function () {
			expect(add_commas(1234.5)).equals("1,234.5");
		});
		it("should not add commas in decimal part of float", function () {
			expect(add_commas(1.2345)).equals("1.2345");
		});
		it("should not add commas to nothing", function () {
			expect(add_commas()).equals("");
		});
		it("should not add commas to text", function () {
			expect(add_commas("foobar")).equals("foobar");
		});
		it("should add commas to numbers with text", function () {
			expect(add_commas("hello 1234 there")).equals("hello 1,234 there");
		});
		it("should add commas to function call", function () {
			expect(add_commas("foo(1234)")).equals("foo(1,234)");
		});
		it("should add commas to comma", function () {
			expect(add_commas("Crystal: 1234567,")).equals("Crystal: 1,234,567,");
		});
	});
	describe("remove_commas()", function () {
		it("should remove commas from integer", function () {
			expect(remove_commas("1,234")).equals("1234");
		});
		it("should remove commas from longer integers", function () {
			expect(remove_commas("1,234,567")).equals("1234567");
		});
		it("should remove commas from front of float", function () {
			expect(remove_commas("1,234.5")).equals("1234.5");
		});
		it("should not remove standalone commas", function () {
			expect(remove_commas(",")).equals(",");
		});
		it("should not remove commas from nothing", function () {
			expect(remove_commas("")).equals("");
		})
		it("should not remove commas from text", function () {
			expect(remove_commas("foo,bar")).equals("foo,bar");
		});
		it("should remove commas from numbers with text", function () {
			expect(remove_commas("hello 1,234 there")).equals("hello 1234 there");
		});
		it("should remove commas from function call", function () {
			expect(remove_commas("foo(1,234)")).equals("foo(1234)");
		});
		it("should not remove commas from a function call where comma is in the first parameter", function () {
			expect(remove_commas("foo(1,234, 1)")).equals("foo(1234, 1)");
		});
		it("should not remove commas from a function call where comma is in the second parameter", function () {
			expect(remove_commas("foo(1, 1,234)")).equals("foo(1, 1234)");
		});
	});
});

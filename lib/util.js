"use strict";

exports.add_commas = function (number = "") {
	// https://stackoverflow.com/a/2901298/3413725
	return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

exports.remove_commas = function (number = "") {
	return number.replace(/(?<!\.\d*)(?<=\d+),(?=(\d{3})+(?!\d))/g, "");
};

exports.expand_numeric_literals = function (number) {
	let final_number = number.replace(/\b(\d+(?:\.\d+)?)[Kk]/g, "($1 * 1000)")
		.replace(/\b(\d+(?:\.\d+)?)[Mm]/g, "($1 * 1000000)")
		.replace(/\b(\d+(?:\.\d+)?)[Bb]/g, "($1 * 1000000000)")
		.replace(/\b(\d+(?:\.\d+)?)[Tt]/g, "($1 * 1000000000000)");
	return final_number;
};
"use strict";

exports.add_commas = function (number = "") {
	// https://stackoverflow.com/a/2901298/3413725
	return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
};

exports.remove_commas = function (number = "") {
	return number.replace(/(?<!\.\d*)(?<=\d+),(?=(\d{3})+(?!\d))/g, "");
};

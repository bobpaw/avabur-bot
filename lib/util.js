/**
 * @file Exposes utility functions for lib/ files.
 * @author Aiden Woodruff <aiden.woodruff@gmail.com>
 * @license MIT
 * @module lib/util
 * @package
 */

"use strict";

/**
 * Adds commas to a long number every three zeroes.
 * 
 * @example
 * // Returns 1,234,567
 * add_commas("1234567");
 * 
 * // Returns func(yes, 2345);
 * add_commas("func(yes, 2,345)");
 * 
 * @function
 * @param {string} [number=""] A long number to add commas to.
 * @returns {string} Returns a number with commas every three places.
 */
export function add_commas (number = "") {
	// https://stackoverflow.com/a/2901298/3413725
	return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * Removes commas from long numbers.
 * 
 * @example
 * // Returns 1234567
 * remove_commas("1,234,567");
 * 
 * // Returns func(1, 2345)
 * remove_comams("func(1, 2,345)");
 * 
 * @function
 * @param {string} [number=""] A long number to add commas to.
 * @returns {string} Returns a number with commas every three places.
 */
export function remove_commas (number = "") {
	return number.replace(/(?<!\.\d*)(?<=\d+),(?=(\d{3})+(?!\d))/g, "");
}


export function expand_numeric_literals (number) {
	let final_number = number.replace(/\b(\d+(?:\.\d+)?)[Kk]/g, "($1 * 1000)")
		.replace(/\b(\d+(?:\.\d+)?)[Mm]/g, "($1 * 1000000)")
		.replace(/\b(\d+(?:\.\d+)?)[Bb]/g, "($1 * 1000000000)")
		.replace(/\b(\d+(?:\.\d+)?)[Tt]/g, "($1 * 1000000000000)");
	return final_number;
}

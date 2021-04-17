"use strict";

const { makeDirs } = require("moleculer").Utils;
const path = require("path");
const fs = require("fs");
const qs = require("qs");

module.exports = {
	slug(text) {
		return text
			.toString()
			.toLowerCase()
			.replace(/\s+/g, "-") // Replace spaces with -
			.replace(/[^\w\-]+/g, "") // Remove all non-word chars
			.replace(/\-\-+/g, "-") // Replace multiple - with single -
			.replace(/^-+/, "") // Trim - from start of text
			.replace(/-+$/, ""); // Trim - from end of text
	},

	writeResult(folderName, filename, content) {
		const folder = path.join(__dirname, "results", folderName);
		makeDirs(folder);

		fs.writeFileSync(path.join(folder, filename), JSON.stringify(content, null, 2), "utf8");
	},

	saveMarkdown(filename, rows) {
		const content = rows.join("\n");
		fs.writeFileSync(filename, content, "utf8");
	},

	createChartURL(opts) {
		return `https://image-charts.com/chart?${qs.stringify(opts)}`;
	},

	numToStr(num, digits = 2) {
		return new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(num);
	},

	makeTableRow(cells) {
		return "| " + cells.join(" | ") + " |";
	}
};

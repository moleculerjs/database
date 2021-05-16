"use strict";

const fs = require("fs");
const path = require("path");
const globby = require("globby");
const humanize = require("tiny-human-time");
const { saveMarkdown, createChartURL, numToStr, makeTableRow } = require("./utils");

async function generateMarkdown(folderName) {
	const folder = path.join(__dirname, "results", folderName);
	const files = await globby(["*.json"], { cwd: folder });
	if (files.length == 0) return;

	console.log("Found files:", files);

	const results = files
		.map(filename => fs.readFileSync(path.join(folder, filename), "utf8"))
		.map(content => JSON.parse(content));

	const rows = ["<!-- THIS PAGE IS GENERATED. DO NOT EDIT MANUALLY! -->", ""];

	for (const result of results) {
		console.log("Process test:", result.name);

		rows.push(`# ${result.name}`);
		rows.push(`${result.description || {}}`);

		if (result.meta.adapters) {
			rows.push(
				"## Test configurations",
				"",
				"| Name | Adapter | Options |",
				"| ---- | ------- | ------- |"
			);
			for (const adapter of result.meta.adapters) {
				let options = JSON.stringify(adapter.options);
				if (options) {
					//options = options.replace(/\n/g, "<br>").replace(/ /g, "&nbsp;");
					options = "`" + options + "`";
				}
				rows.push(
					makeTableRow([adapter.name || adapter.type, adapter.type, options || "-"])
				);
			}
		}

		for (const suite of result.suites) {
			rows.push(`## ${suite.name}`);
			if (suite.meta && suite.meta.description) rows.push(suite.meta.description);
			rows.push("", "### Result");
			rows.push("");

			rows.push(
				"",
				"| Adapter config | Time | Diff | ops/sec |",
				"| -------------- | ----:| ----:| -------:|"
			);

			suite.tests.forEach(test => {
				rows.push(
					makeTableRow([
						test.name,
						humanize.short(test.stat.avg * 1000),
						numToStr(test.stat.percent) + "%",
						numToStr(test.stat.rps)
					])
				);
			});
			rows.push("");

			rows.push(
				"![chart](" +
					createChartURL({
						chs: "999x500",
						chtt: `${suite.name}|(ops/sec)`,
						chf: "b0,lg,90,03a9f4,0,3f51b5,1",
						chg: "0,50",
						chma: "0,0,10,10",
						cht: "bvs",
						chxt: "x,y",
						chxs: "0,333,10|1,333,10",

						chxl: "0:|" + suite.tests.map(s => s.name).join("|"),
						chd: "a:" + suite.tests.map(s => s.stat.rps).join(",")
					}) +
					")"
			);
			rows.push("");
		}
	}

	rows.push("--------------------");
	rows.push(`_Generated at ${new Date().toISOString()}_`);

	const filename = path.join(folder, "README.md");
	console.log("Write to file...");
	saveMarkdown(filename, rows);

	console.log("Done. Result:", filename);
}

module.exports = { generateMarkdown };

//generateMarkdown("common");

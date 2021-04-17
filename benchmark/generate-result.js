"use strict";

const fs = require("fs");
const path = require("path");
const qs = require("qs");
const globby = require("globby");
const humanize = require("tiny-human-time");

async function generateMarkdown(folder) {
	const rows = ["# Benchmark results", ""];

	const files = await globby(["bench_*.json"], { cwd: folder });
	if (files.length == 0) return;

	files.sort();

	const results = files
		.map(filename => fs.readFileSync(path.join(folder, filename), "utf8"))
		.map(content => JSON.parse(content));

	//console.dir(results, { depth: 3 });

	const suites = results[0].suites;

	for (const suite of suites) {
		const p = suite.name.split(" - ");
		const suiteName = p.length > 1 ? p[1] : p[0];
		rows.push(`## ${suiteName}`, "", "### Result");

		const resByAdapter = {};

		results.forEach(res => {
			const rs = res.suites.find(s => s.meta.type == suite.meta.type);
			if (rs) {
				let resItem = resByAdapter[res.meta.adapter];
				if (!resItem) {
					resItem = rs.tests[0].stat;
					resByAdapter[res.meta.adapter] = resItem;
				}
			}
		});

		console.log(suiteName, resByAdapter);

		const labels = Array.from(Object.keys(resByAdapter));
		const values = Array.from(Object.values(resByAdapter));

		rows.push("", "| Adapter config | Time | ops/sec |", "| -------------- | ----:| -------:|");
		labels.forEach((label, i) => {
			rows.push(
				`| ${label} | ${humanize.short(values[i].avg * 1000)} | ${Number(
					values[i].rps
				).toFixed(2)} |`
			);
		});
		rows.push("");

		rows.push(
			"![chart](" +
				createChartURL({
					chs: "800x450",
					chtt: `${suiteName}|(ops/sec)`,
					chf: "b0,lg,90,03a9f4,0,3f51b5,1",
					chg: "0,50",
					chl: "|||| 33% !|x2 ",
					chma: "0,0,10,10",
					cht: "bvs",
					chxt: "x,y",

					chxl: "0:|" + labels.join("|"),
					chd: "a:" + values.map(v => v.rps).join(",")
				}) +
				")"
		);
		rows.push("");
	}

	rows.push("--------------------");
	rows.push(`_Generated at ${new Date().toISOString()}_`);

	const filename = path.join(folder, "README.md");
	saveMarkdown(filename, rows);
}

function saveMarkdown(filename, rows) {
	const content = rows.join("\n");
	fs.writeFileSync(filename, content, "utf8");
}
/*
{
  chd: 'a:21226,9373,9773',
  chf: 'b0,lg,90,03a9f4,0,3f51b5,1',
  chg: '0,50',
  chl: '|||| 33% !|x2 ',
  chma: '0,0,10,10',
  chs: '800x450',
  cht: 'bvs',
  chtt: 'Entity creation|(ops/sec)',
  chxl: '0:|NeDB|MongoDB|Knex-SQLite',
  chxt: 'x,y'
}
*/

function createChartURL(opts) {
	return `https://image-charts.com/chart?${qs.stringify(opts)}`;
}

module.exports = { generateMarkdown };

generateMarkdown(path.join(__dirname, "results", "common"));

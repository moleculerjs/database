"use strict";

const BaseAdapter = require("../../src/adapters/base");

describe("Test BaseAdapter", () => {
	describe("Test checkClientLibVersion", () => {
		let adapter;

		beforeEach(() => {
			adapter = new BaseAdapter();
			adapter.logger = { warn: jest.fn() };
		});

		it("should return true if the installed version satisfies", () => {
			expect(adapter.checkClientLibVersion("jest", ">= 20.0.0")).toBe(true);
			expect(adapter.logger.warn).toBeCalledTimes(0);
		});

		it("should return false and warn if the installed version does not satisfy", () => {
			expect(adapter.checkClientLibVersion("jest", "< 1.0.0")).toBe(false);
			expect(adapter.logger.warn).toBeCalledTimes(1);
		});

		it("should return true and warn if the library version can not be resolved", () => {
			// e.g. bundled environments (esbuild, webpack, Cloudflare Workers)
			// where dynamic require is not available
			expect(adapter.checkClientLibVersion("surely-not-installed-lib", "^1.0.0")).toBe(
				true
			);
			expect(adapter.logger.warn).toBeCalledTimes(1);
		});
	});
});

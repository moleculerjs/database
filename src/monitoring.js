/*
/*
 * @moleculer/database
 * Copyright (c) 2021 MoleculerJS (https://github.com/moleculerjs/database)
 * MIT Licensed
 */

"use strict";

const { METRIC } = require("moleculer");
const C = require("./constants");

module.exports = function (mixinOpts) {
	return {
		/**
		 * Register Moleculer Transit Core metrics.
		 */
		_registerMoleculerMetrics() {
			this.broker.metrics.register({
				name: C.METRIC_ADAPTER_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ADAPTER_ACTIVE,
				type: METRIC.TYPE_GAUGE,
				labelNames: ["service"],
				rate: true
			});

			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_FIND_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_FIND_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});

			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_STREAM_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_STREAM_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});

			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_COUNT_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_COUNT_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});

			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_FINDONE_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_FINDONE_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});

			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_RESOLVE_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_RESOLVE_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});

			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_CREATEONE_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_CREATEONE_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_CREATEMANY_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_CREATEMANY_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});

			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_UPDATEONE_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_UPDATEONE_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_UPDATEMANY_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_UPDATEMANY_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});

			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_REPLACEONE_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_REPLACEONE_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});

			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_REMOVEONE_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_REMOVEONE_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_REMOVEMANY_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_REMOVEMANY_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});

			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_CLEAR_TOTAL,
				type: METRIC.TYPE_COUNTER,
				labelNames: ["service"],
				rate: true
			});
			this.broker.metrics.register({
				name: C.METRIC_ENTITIES_CLEAR_TIME,
				type: METRIC.TYPE_HISTOGRAM,
				labelNames: ["service"],
				quantiles: true,
				unit: METRIC.UNIT_MILLISECONDS
			});
		},

		_metricInc(name) {
			if (!this.broker.isMetricsEnabled()) return;
			return this.broker.metrics.increment(name, { service: this.fullName });
		},

		_metricDec(name) {
			if (!this.broker.isMetricsEnabled()) return;
			return this.broker.metrics.decrement(name, { service: this.fullName });
		},

		_metricTime(name) {
			if (!this.broker.isMetricsEnabled()) return () => {};
			return this.broker.metrics.timer(name, { service: this.fullName });
		},

		startSpan(ctx, name, tags = {}) {
			if (!this.broker.isTracingEnabled()) return {};
			const m = ctx ? ctx : this.broker.tracer;
			tags.service = this.fullName;
			tags.nodeID = this.broker.nodeID;

			const span = m.startSpan(name, { tags });
			return span;
		},

		finishSpan(ctx, span) {
			if (!this.broker.isTracingEnabled()) return {};
			if (ctx) return ctx.finishSpan(span);
			return span.finish();
		}
	};
};

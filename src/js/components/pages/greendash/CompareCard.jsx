/* eslint-disable react/jsx-props-no-spreading */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ButtonGroup } from "reactstrap";
import C from "../../../C";
import Misc from "../../../base/components/Misc";
import NewChartWidget from "../../../base/components/NewChartWidget";
import KStatus from "../../../base/data/KStatus";
import { getDataList, restId } from "../../../base/plumbing/Crud";
import DataStore from "../../../base/plumbing/DataStore";
import PromiseValue from "../../../base/promise-value";
import { getPeriodQuarter, isoDate, printPeriod, getPeriodFromUrlParams } from "../../../base/utils/date-utils";
import printer from "../../../base/utils/printer";
import { GreenCard, GreenCardAbout, ModeButton } from "./GreenDashUtils";
import { TONNES_THRESHOLD, dataColours } from "./dashUtils";
import { getUrlVars } from "../../../base/utils/miscutils";
import { BaseFilters, GreenBuckets, emissionsPerImpressions, getCarbon, getCompressedBreakdownWithCount, getSumColumn, isPer1000 } from "./emissionscalcTs";

/**
 *
 * @param {?String} unit kg|tons
 * @returns
 */
const baseOptions = (unit = "kg") => ({
	indexAxis: "y",
	scales: { x: { ticks: { callback: (v) => v + " " + unit, precision: 2 } } },
	plugins: {
		legend: { display: false },
		tooltip: { callbacks: { label: (ctx) => `${printer.prettyNumber(ctx.raw)} ${unit} CO2` } },
	},
});

/**
 *
 * @param {String[]} labels
 * @param {?String} unit kg|tons
 * @param {?Integer} nCharacters number of characters to show
 * @param {?String} suffix what to append if string is shortened
 * @returns {String} "Example" -> (3, "...") -> "Exa..."
 *
 * Shortens chart labels to size 'minLength', appending 'suffix' if shortened
 * On hovering, show entire label
 */
const minLengthLabelOptions = ({ labels, unit = "kg", nCharacters = 6, suffix = "..." }) => ({
	indexAxis: "y",
	scales: {
		x: { ticks: { callback: (v) => v + " " + unit, precision: 2 } },
		y: {
			ticks: {
				callback: function (t) {
					if (labels[t].length > nCharacters) return labels[t].substr(0, nCharacters) + suffix;
					else return labels[t];
				},
			},
		},
	},
	plugins: {
		legend: { display: false },
		tooltip: {
			callbacks: {
				label: (ctx) => `${printer.prettyNumber(ctx.raw)} ${unit} CO2`,
			},
		},
	},
	tooltips: {
		callbacks: {
			title: function (t, d) {
				return d.labels[t[0].index];
			},
		},
	},
});

const QuartersCard = ({ baseFilters }) => {
	// Set up base chart data object
	const chartProps = {
		data: {
			labels: ["", "", "", ""],
			datasets: [
				{
					data: [0, 0, 0, 0],
				},
			],
		},
		options: baseOptions(),
	};

	// TODO Can we use dataValue to avoid fetching again??
	// Construct four quarter periods, from the current quarter back
	const cursorDate = new Date();
	cursorDate.setHours(0, 0, 0, 0);
	const quarters = [];
	for (let i = 0; i < 4; i++) {
		quarters.unshift(getPeriodQuarter(cursorDate));
		cursorDate.setMonth(cursorDate.getMonth() - 3);
	}

	// Get total carbon for each quarter
	let pvsBuckets = quarters.map((quarter, i) =>
		getCarbon({
			...baseFilters,
			start: isoDate(quarter.start),
			end: isoDate(quarter.end),
			breakdown: 'total{"countco2":"sum"}',
		})
	);
	// add it into chartProps
	pvsBuckets.forEach((pvBuckets, i) => {
		if (!pvBuckets.value) return;

		// Set label to show quarter is loaded, even if result is empty
		let quarter = quarters[i];
		chartProps.data.labels[i] = printPeriod(quarter, true);

		let buckets = pvBuckets.value.sampling?.by_total.buckets || pvBuckets.value.by_total.buckets;
		if (!buckets || !buckets.length) {
			return; // no data for this quarter
		}
		// Are we in carbon-per-mille mode?
		if (isPer1000()) {
			buckets = emissionsPerImpressions(buckets);
		}

		// Display kg or tonnes?
		let thisCarbon = getSumColumn(buckets, "co2");
		chartProps.data.datasets[0].data[i] = thisCarbon;

		// Kg or tonnes? (using data-attr notation so we can dump all props into the chart without React complaining)
		if (chartProps["data-tonnes"]) {
			// There's already been at least one data point above the threshold: just scale down the latest one
			chartProps.data.datasets[0].data[i] /= 1000;
		} else if (thisCarbon > TONNES_THRESHOLD) {
			// This is the first data point above the threshold: Scale down all points & change tick labels from kg to tonnes
			chartProps.data.datasets[0].data = chartProps.data.datasets[0].data.map((d) => d / 1000);
			chartProps.options.scales.x.ticks.callback = (v) => `${v} t`;
			chartProps.options.plugins.tooltip.callbacks.label = (ctx) => `${printer.prettyNumber(ctx.raw)} tonnes CO2`;
			chartProps["data-tonnes"] = true;
		}
	});

	// Set Steps if data is too small
	let maxVal = 0;
	chartProps.data.datasets[0].data.forEach((val) => {
		if (val > maxVal) maxVal = val;
	});
	if (maxVal < 0.01) {
		chartProps.options.scales.x.ticks.precision = 4;
	}

	// Assign bar colours
	chartProps.data.datasets[0].backgroundColor = dataColours(chartProps.data.datasets[0].data);

	return <NewChartWidget type="bar" {...chartProps} />;
};

const CampaignCard = ({ baseFilters }) => {
	const pvChartData = getCarbon({
		...baseFilters,
		breakdown: ['campaign{"countco2":"sum"}'],
		name: "campaign-chartdata",
	});

	let dataValue = pvChartData.value?.sampling || pvChartData.value;

	let vbyx = {};
	let labels = [];
	let values = [];

	const per1000 = isPer1000();

	if (dataValue) {
		let buckets = dataValue.by_campaign.buckets;
		if (per1000) {
			buckets = emissionsPerImpressions(buckets);
		}

		let breakdownByX = {};
		buckets.forEach((row) => (breakdownByX[row.key] = { co2: row.co2, count: row.count }));

		vbyx = getCompressedBreakdownWithCount({ breakdownByX });

		// reformat ids we want to find names of into a bucket format (remove 'other' too)
		const idsToNames = Object.keys(vbyx).filter((key) => key != "Other");

		let pvCampaigns = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUB_OR_DRAFT, ids: idsToNames });

		if (pvCampaigns && PromiseValue.isa(pvCampaigns.value)) {
			// HACK unwrap nested PV
			pvCampaigns = pvCampaigns.value;
		}

		let mapping = [];
		if (pvCampaigns?.value) {
			let campaigns = pvCampaigns?.value.hits;
			// create object of just names & ids
			mapping = campaigns.reduce((acc, val) => [...acc, { name: val.name, id: val.id }], [{ name: "Other", id: "Other" }]);
		}
		// if error occured with names OR no campaigns were found...
		if (mapping.length != Object.keys(vbyx).length && !per1000) {
			// default to using IDs & Co2
			labels = Object.keys(vbyx);
			values = Object.values(vbyx);
		} else {
			// directly map 'name' to 'co2'
			let nameToCo2 = {};
			mapping.forEach((row) => (nameToCo2[row.name] = vbyx[row.id]));
			labels = Object.keys(nameToCo2);
			values = Object.values(nameToCo2);
		}
	}

	const chartProps = {
		data: {
			labels,
			datasets: [{ data: values }],
		},
		options: minLengthLabelOptions({ labels: labels, nCharacters: 8 }),
	};

	// Assign bar colours
	let colors = dataColours(chartProps.data.datasets[0].data);
	chartProps.data.datasets[0].backgroundColor = colors;

	return <NewChartWidget type="bar" {...chartProps} />;
};

/**
 * @param {Object} obj
 * @param {GreenBuckets} obj.buckets
 * @returns {JSX.Element}
 */
const BenchmarksCard = ({ formatBuckets, benchmarksData }) => {
	if (!isPer1000() || !formatBuckets || !formatBuckets.length || !benchmarksData) {
		return <Misc.Loading />;
	}

	// formatBuckets must be in per1000 mode
	formatBuckets = emissionsPerImpressions(formatBuckets);
	
	// Put benchmarksData in the same order as formatBuckets
	const benchmarksValues = formatBuckets.map((val) => benchmarksData[val.key]);

	// buckets to datasets
	const labels = formatBuckets.map((val) => capitalizeFirstLetter(val.key));
	const values = formatBuckets.map((val) => val.co2);

	const data = {
		labels: labels,
		datasets: [
			{
				label: "Your Emissions",
				data: values,
				backgroundColor: "rgba(135, 206, 250, 0.6)", // Light Blue
			},
			{
				label: "Benchmarks",
				data: benchmarksValues,
				backgroundColor: "rgba(112, 128, 144, 0.6)", // Slate Gray
			},
		],
	};

	const chartProps = {
		data: data,
		options: {
			indexAxis: "x",
			scales: { y: { ticks: { callback: (v) => v + " " + "kg", precision: 2 } } },
			plugins: {
				// legend: { display: false },
				tooltip: {
					callbacks: {
						label: (ctx) => `${printer.prettyNumber(ctx.raw)} kg CO2pm`,
						footer: (tooltipItems) => {
							if (tooltipItems[0].dataset.label === "Benchmarks") {
								return "Benchmarks update every month";
							}
							return null;
						},
					},
				},
			},
		},
	};

	return <NewChartWidget type="bar" {...chartProps} />;
};

/**
 * @param {string} str
 * @return {string}
 */
const capitalizeFirstLetter = (str) => {
	if (!str || typeof str !== "string") {
		return "";
	}
	const lower = str.toLowerCase();
	return lower.charAt(0).toUpperCase() + lower.slice(1);
};

/**
 * Get the map of impressions per Country. Filter out data that have less than 0.1% of total impressions.
 * Also filter out 'unset' country since their numbers don't make sense. 
 * @param {GreenBuckets | null} buckets
 * @param {Number | null} allCount
 * @returns {Object.<string, number> | null}
 */
const getCountryMapFiltered = (buckets, allCount, filterThreshold = 0.001) => {
	if (!buckets || !allCount) return null;

	const threshold = filterThreshold * allCount;

	const countryMap = buckets.reduce((acc, val) => {
		if (val.count < threshold) {
			return acc;
		}

		if (val.key === "unset") {
			return acc;
		}

		if (!Object.prototype.hasOwnProperty.call(acc, val.key)) {
			acc[val.key] = val.count;
		} else {
			acc[val.key] += val.count;
		}
		return acc;
	}, {});

	return countryMap;
};

/**
 * @param {Object} obj
 * @param {string} obj.mode
 * @param {GreenBuckets} obj.buckets
 * @param {BaseFilters} obj.props
 * @returns {JSX.Element}
 */
const SwitchCard = ({ mode, formatBuckets, props }) => {
	switch (mode) {
		case "quarter":
			return <QuartersCard {...props} />;
		case "campaign":
			return <CampaignCard {...props} />;
		case "benchmarks":
			return <BenchmarksCard formatBuckets={formatBuckets} benchmarksData={props?.benchmarksData} />;
		default:
			return <QuartersCard {...props} />;
	}
};

const CompareCard = ({ formatBuckets, ...props }) => {
	const [mode, setMode] = useState("quarter");
	const [benchmarksData, setBenchmarksData] = useState();

	const per1000 = isPer1000();

	const BenchmarksDataPv = useMemo(async () => {
		if (!per1000) return null;

		const countryData = await getCarbon({ ...props.baseFilters, breakdown: ['country{"count":"sum"}'] }).promise;

		/** A map of country and it's impressions count. Filtered out 'unset' & countries that have insufficient impressions. */
		const countryMap = getCountryMapFiltered(countryData.by_country?.buckets, countryData.allCount);

		const urlParams = getUrlVars();
		/** Benchmarks period. TODO: Upgrade to last quarter later */
		const period = getPeriodFromUrlParams({ ...urlParams, period: "last-month" });

		/** Average co2pm of the countries it ran on.
		 * @type {Object[]} */
		const countryCo2pm = await Promise.all(
			Object.keys(countryMap).map(async (countryCode) => {
				const formatData = await getCarbon({ q: `country:${countryCode}`, start: period.start.toISOString(), end: period.end.toISOString(), breakdown: ['format{"co2pm":"avg"}'] }).promise;
				const buckets = formatData?.by_format?.buckets;
				const bucketsMap = buckets.reduce((acc, val) => {
					acc.country = countryCode;
					acc[val.key] = val.co2pm;
					return acc;
				}, {});
				return bucketsMap;
			})
		);

		let filteredTotalImpressions = 0;

		/** Average co2pm converted to one Object for easy access
		 * @type {Object} */
		const countryCo2pmMap = countryCo2pm.reduce((acc, val) => {
			filteredTotalImpressions += countryMap[val.country];
			acc[val.country] = { ...val, count: countryMap[val.country] };
			delete acc[val.country].country;
			return acc;
		}, {});

		// Calcuated co2pm benchmarks for each foramts weighed by the proportion of the impressions of each country
		const benchmarksResult = Object.entries(countryCo2pmMap).reduce((acc, [country, value]) => {
			// eslint-disable-next-line no-undef
			const dataOfCountry = Object.entries({ ...value }).reduce((accFormat, [format, co2pm]) => {
				if (format !== "count") {
					accFormat[format] = co2pm * (value.count / filteredTotalImpressions);
				}
				return accFormat;
			}, {});
			Object.entries(dataOfCountry).forEach(([format, co2pm]) => {
				if (!Object.prototype.hasOwnProperty.call(acc, format)) {
					acc[format] = (acc[format] || 0) + co2pm;
				}
			});
			return acc;
		}, {});

		return benchmarksResult;
	}, [per1000]);

	useEffect(() => {
		// Pop out of benchmarks
		if (!per1000 && mode === "benchmarks") {
			setMode("quarter");
		}
	}, [mode, per1000]);

	useEffect(() => {
		BenchmarksDataPv.then((data) => {
			setBenchmarksData(data);
		});
	}, [BenchmarksDataPv]);

	// TODO don't offer campaign biew if we're focuding on one campaign
	const campaignModeDisabled = !!DataStore.getUrlValue("campaign");

	return (
		<GreenCard title="How do your ad emissions compare?" className="carbon-compare">
			<div className="d-flex justify-content-around mb-2">
				<ButtonGroup>
					<ModeButton name="quarter" mode={mode} setMode={setMode}>
						Quarter
					</ModeButton>
					<ModeButton name="campaign" mode={mode} setMode={setMode} disabled={campaignModeDisabled}>
						Campaign
					</ModeButton>
					{per1000 && <ModeButton name="benchmarks" mode={mode} setMode={setMode}>
						Benchmarks
					</ModeButton>}
				</ButtonGroup>
			</div>
			<SwitchCard mode={mode} formatBuckets={formatBuckets} props={{ ...props, benchmarksData }} />
			<GreenCardAbout>
				<p>Explanation of quarterly and per-campaign emissions comparisons</p>
			</GreenCardAbout>
		</GreenCard>
	);
};

export default CompareCard;

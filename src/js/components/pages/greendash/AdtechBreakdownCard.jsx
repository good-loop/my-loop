import React, { useEffect, useState } from "react";

import Misc from "../../../base/components/Misc";
import { yessy } from "../../../base/utils/miscutils";
import printer from "../../../base/utils/printer";
import NewChartWidget from "../../../base/components/NewChartWidget";
import { TONNES_THRESHOLD } from "./dashUtils";
import { getCarbon, emissionsPerImpressions, getSumColumn, isPer1000 } from "./emissionscalcTs";
// Doesn't need to be used, just imported so MiniCSSExtractPlugin finds the LESS
import "../../../../style/greendash-breakdown-card.less";
import { CO2e, NOEMISSIONS, GreenCard, GreenCardAbout } from "./GreenDashUtils";

const pieOptions = (totalCO2, minimumPercentLabeled) => ({
	layout: { autoPadding: true, padding: 5 },
	plugins: {
		legend: {
			position: (ctx) => (ctx.chart.width < 250 ? "left" : "top"),
			labels: { boxWidth: 20 },
		},
		tooltip: {
			callbacks: {
				label: (ctx) => ` ${printer.prettyNumber(ctx.dataset.data[ctx.dataIndex])} kg`,
				title: (ctx) => ctx[0].label,
			},
		},
		datalabels: {
			labels: {
				value: {
					color: "#fff",
					textStrokeColor: "#666",
					textStrokeWidth: 2,
					font: (ctx) => ({
						family: "Montserrat",
						weight: "bold",
						size: Math.round(Math.min(ctx.chart.chartArea.width, ctx.chart.chartArea.height) / 10),
					}),
					formatter: (value = 0) => {
						const percentage = Math.round((value * 100) / totalCO2);
						return percentage >= minimumPercentLabeled ? `${percentage}%` : "";
					},
				},
			},
		},
	},
});

/**
 *
 * @param {Object} p
 * @param {*} tags
 * @param {!Object} p.data {table: Object[][] }
 * @param {Number} minimumPercentLabeled the minimum percentage to include a data label for
 * @returns
 */
const TechSubcard = ({ data: osBuckets, minimumPercentLabeled = 1, chartType = "pie" }) => {
	if (!yessy(osBuckets)) return NOEMISSIONS;

	const [pieChartProps, setPieChartProps] = useState();
	const [barChartProps, setBarChartProps] = useState();

	useEffect(() => {
		let media = getSumColumn(osBuckets, "co2creative");
		let publisher = getSumColumn(osBuckets, "co2base");
		let dsp = getSumColumn(osBuckets, "co2supplypath");

		let totalCO2 = media + dsp + publisher;

		if (totalCO2 === 0) {
			setPieChartProps({ isEmpty: true });
			setBarChartProps({ isEmpty: true });
			return;
		}

		// Tonnes or kg?
		let unit = "kg";
		let unitShort = "kg";
		if (Math.max(media, publisher, dsp) > TONNES_THRESHOLD) {
			unit = "tonnes";
			unitShort = "t";
			totalCO2 = totalCO2 / 1000;
			media = media / 1000;
			publisher = publisher / 1000;
			dsp = dsp / 1000;
		}

		const chartData = {
			labels: ["Creative", "Publisher", "Supply path"],
			datasets: [
				{
					label: "Kg CO2",
					backgroundColor: ["#4A7B73", "#90AAAF", "#C7D5D7"],
					data: [media, publisher, dsp],
				},
			],
		};

		setPieChartProps(
			{
				data: chartData,
				options: pieOptions(totalCO2, minimumPercentLabeled),
			},
			[osBuckets]
		);

		setBarChartProps({
			data: chartData,
			options: {
				indexAxis: "y",
				plugins: {
					legend: { display: false },
					tooltip: { callbacks: { label: (ctx) => `${printer.prettyNumber(ctx.raw)} ${unit} CO2` } },
				},
				// scales: { x: { ticks: { callback: (v) => `${Math.round(v)} ${unitShort}` } } },
				scales: { x: { ticks: { callback: (v) => v + " " + unitShort, precision: 2 } } },
			},
		});
	}, [osBuckets]);

	if (!pieChartProps) return null;
	if (pieChartProps?.isEmpty) return NOEMISSIONS;

	return (
		<>
			<p>{CO2e} emissions due to...</p>
			{/* Options will clash between pie and bar, seperate the two chart would be easier to control */}
			{chartType === "pie" && <NewChartWidget type="pie" {...pieChartProps} datalabels legend />}
			{chartType === "bar" && <NewChartWidget type="bar" {...barChartProps} />}
			<small className="text-center">The Green Ad Tag per-impression overhead is measured, but too small to display in this chart.</small>
		</>
	);
};

/**
 *
 * @param {Object} p
 * @param {Object} p.dataValue pvChartData.value Which are split by breakdown: os, adid,
 */
const AdtechBreakdownCard = ({ baseFilters }) => {
	const [techData, setTechData] = useState();

	useEffect(async () => {
		const techValueResponse = await getCarbon({
			...baseFilters,
			breakdown: ['total{"emissions":"sum"}'],
		}).promise;
		const techValue = techValueResponse?.sampling || techValueResponse;
		let techDataTemp = techValue.by_total?.buckets;
		// Are we in carbon-per-mille mode?
		if (isPer1000()) {
			if (techDataTemp) techDataTemp = emissionsPerImpressions(techData);
		}
		setTechData(techDataTemp);
	}, []);

	return (
		<GreenCard title="What is the adtech breakdown of your emissions?" className="carbon-breakdown">
			{!techData ? (
				<Misc.Loading text="Fetching your data..." />
			) : (
				<>
					<TechSubcard data={techData} minimumPercentLabeled={10} chartType={isPer1000() ? "bar" : "pie"} />
					<GreenCardAbout>
						<p>Where do we get numbers for each slice from?</p>
						<p>How do we determine OS/device breakdowns?</p>
					</GreenCardAbout>
				</>
			)}
		</GreenCard>
	);
};

export default AdtechBreakdownCard;

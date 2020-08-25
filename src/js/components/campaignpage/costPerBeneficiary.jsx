/*
 * Copy/pasted from sogive NGO2.js and Project.js - find cost per beneficiary if it doesnt exist
*/

import _ from 'lodash';
import $ from 'jquery';
import {assMatch} from 'sjtest';
import Money from '../../base/data/Money';
import NGO from '../../base/data/NGO';
import { asNum } from '../../base/utils/miscutils';
import DataClass from '../../base/data/DataClass';

/**
 * See also Project.java
 */

let costPerBeneficiaryCalc = ({charity, project, output}) => {	
	// NB: asNum is paranoia
	let outputCount = asNum(output.number);
	if ( ! outputCount) return null;
	let projectCost = Project.getTotalCost(project);
	if ( ! projectCost) {
		console.warn("No project cost?!", project);
		return null;
	}
	// overheads?
	if ( ! Project.isOverall(project)) {
		let year = Project.year(project);
		const adjustment = NGO.getOverheadAdjustment({charity, year});
		let adjustedProjectCost = Money.mul(projectCost, adjustment);
		let v = Money.value(adjustedProjectCost);
		projectCost = adjustedProjectCost;		
	}
	Money.assIsa(projectCost);
	if ( ! $.isNumeric(outputCount)) {
		console.error("NGO.js - Not a number?! "+outputCount, "from", output);
		return 1/0; // NaN
	}
	assMatch(outputCount, Number, "NGO.js outputCount not a Number?! "+outputCount);
	let costPerOutput = new Money(projectCost);
	Money.setValue(costPerOutput, projectCost.value / outputCount);
	return costPerOutput;
};

NGO.getOverheadAdjustment = ({year, charity}) => {
	try {
		// get the overall for that year
		let overall = NGO.getOverall(charity, year);
		if ( ! overall) {
			return 1;
		}
		// get all the projects for that year
		let thatYearsProjects = charity.projects.filter(p => ! Project.isOverall(p) && Project.year(p) == year);
		// sum project costs, subtracting income
		let overallCosts = Project.getTotalCost(overall);
		// ?? how to handle project level inputs c.f. emails "Overheads calculation"
		let thatYearsProjectCosts = thatYearsProjects.map(Project.getCost);
		const totalProjectCost = Money.total(thatYearsProjectCosts);
		let adjustment = Money.divide(overallCosts, totalProjectCost);
		if ( ! isFinite(adjustment)) {
			return 1;
		}
		return adjustment;
	} catch(err) {
		console.warn("NGO.js costPerBen overheads adjustment failed ", err, charity, year);		
		return 1;
	}
};

class Project extends DataClass {

	inputs = [
		{"@type":"Money","name":"annualCosts","currency":"GBP"},
		{"@type":"Money","name":"fundraisingCosts","currency":"GBP"},
		{"@type":"Money","name":"tradingCosts","currency":"GBP"},
		{"@type":"Money","name":"incomeFromBeneficiaries","currency":"GBP"}
	];
	outputs = []; //default

	constructor(base) {
		super(base);
		Object.assign(this, base);
		// ensure year is the right type
		if (this.year) {
			this.year = parseInt(this.year);
		}
	}
}
DataClass.register(Project, "Project");
const This = Project;

Project.overall = 'overall';

Project.year = (ngo) => This.assIsa(ngo, Project.type) && ngo.year;

Project.isOverall = (project) => Project.assIsa(project) && project.name && project.name.toLowerCase() === Project.overall;

/**
 * 
 @return {Output[]} never null, can be empty
 */
Project.outputs = project => {
	Project.assIsa(project);	
	Project.safeList(project, 'outputs');
	return project.outputs;
};
/** 
 * @return {Money[]} never null, can be empty
 */
Project.inputs = project => {
	Project.checkIsa(project);
	Project.safeList(project, 'inputs');
	return project.inputs;
};

Project.getLatest = (projects) => {
	if ( ! projects) return null;
	const psorted = _.sortBy(projects, Project.year);
	return psorted[psorted.length - 1];
};

/**
 * Find the projectCosts or annualCosts input
 * @returns {Money}
 */
Project.getCost = (project) => {
	Project.assIsa(project);
	let inputs = Project.inputs(project);
	let costs = inputs.filter(input => input.name==='projectCosts' || input.name==='annualCosts');
	return costs[0]; // can be null
};

/**
 * Actually, this is "get the total cost minus certain categories, so its more like total costs covered by donations"
 * @param {!Project} project
 * @returns {!Money}
 */
Project.getTotalCost = (project) => {
	// total - but some inputs are actually negatives
	const inputs = Project.inputs(project);
	const currency = inputs.reduce((curr, input) => curr || input.currency, null);
	const value = inputs.reduce((total, input) => {	
		if (deductibleInputs.indexOf(input.name) !== -1) {
			// These count against the total
			// NB: Use abs in case an overly smart editor put them in as -ives
			return total - Math.abs(input.value || 0);
		}
		return total + (Money.value(input) || 0); // normal
	}, 0);
	return new Money({currency, value});
};

const deductibleInputs = ['incomeFromBeneficiaries', 'fundraisingCosts', 'tradingCosts'];

export default costPerBeneficiaryCalc;
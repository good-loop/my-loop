import React from 'react';
import Counter from '../../base/components/Counter';
import Money from '../../base/data/Money';
import costPerBeneficiaryCalc from './costPerBeneficiary';

function formatNumber(num) {
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const CharityQuote = ({charity, quote, donationValue}) => {
	
	let impact = "";
	let donationsMoney = new Money(donationValue);
	if (charity.simpleImpact) {
		let name = charity.simpleImpact.name;
		name = name.replace(/\(singular\: (.*)\)/g, "");
		let numOfImpact = formatNumber(Math.round(Money.divide(donationsMoney, charity.simpleImpact.costPerBeneficiary)));
		impact = numOfImpact + " " + name;
	} else {
		let project = null;
		console.log(charity.projects);
		if (charity.projects) {
			charity.projects.forEach (proj => {
				if (proj.isRep && proj.outputs) {
					if (proj.outputs.length > 0) {
						project = proj;
					}
				}
			});
		}
		if (project != null) {
			project.outputs.forEach (output => {
				let name = output.name;
				name = name.replace(/\(singular\: (.*)\)/g, "");
				if (output.costPerBeneficiary) {
					let numOfImpact = formatNumber(Math.round(Money.divide(donationsMoney, output.costPerBeneficiary)));
					impact = numOfImpact + " " + name;
				} else if (output.number) {
					let cpb = costPerBeneficiaryCalc({charity, project, output});
					let numOfImpact = formatNumber(Math.round(Money.divide(donationsMoney, cpb)));
					impact = numOfImpact + " " + name;
				}
			})
		}
	}

    return (
		quote || impact ?
			<div className="p-3">
				<div className={"charity-quote row" + (quote.img ? "" : " no-img")}>
					{quote.img ?
						<div className="charity-quote-img col-md-5 p-0">
							<img src={quote.img} className="w-100"/>
						</div>
					: null}
					<div className={"charity-quote-content" + (quote.img ? " col-md-7" : "")}>
						<div className="charity-quote-logo">
							<img src={charity.logo}/>
						</div>
						<div className="charity-quote-text">
							{donationValue ? <div className="w-100"><h2><Counter currencySymbol='&pound;' value={donationValue} /> raised</h2></div> : null}
							<b>{impact}</b>
							<p class="font-italic">
								{quote.quote}
							</p>
							<p>{quote.source}</p>
						</div>
					</div>
				</div>
			</div>
		: null
    );
}

export default CharityQuote;
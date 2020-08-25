import React from 'react';
import Counter from '../../base/components/Counter';
import Money from '../../base/data/Money';

/**
 * HACK hardcode some thank you messages.
 * 
 * TODO Have this as a field in the AdvertPage -> Charity editor or campaign page
 */
const tq = charity => {
	return {
		helenbamber: {quote:`"That is absolutely fantastic news, thank you so much! Congratulations everyone on a successful Spring/Summer Campaign! 
		The donation will go a huge way in supporting our clients to recover and rebuild their lives."`,
					source: "Sophie at Helen Bamber"},
		
		// TODO name
		"wwf-uk": {
			img: "/img/WWF_FeelGoodImage.png",
			quote:`"The money raised through the H&M campaign will support WWF UK's vital work, fighting for a world where people and nature can
thrive, and continue to support schools, teachers and pupils to
develop their knowledge and understanding of the environmental
challenges facing our planet."`,
			source: "Chiara Cadei, WWF"}
	}[charity['@id']] || "";
};

function formatNumber(num) {
	return num.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

const CharityQuote = ({charity, donationValue}) => {

	let quote = tq(charity);
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
					let numOfImpact = formatNumber(Math.round(Money.divide(donationsMoney, project.outputs[0].costPerBeneficiary)));
					impact = numOfImpact + " " + name;
				} else if (output.number) {
					impact = "Contributing to " + formatNumber(output.number) + " " + name;
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

export {CharityQuote, tq}
import React from 'react';
import Counter from '../../base/components/Counter';

const CharityQuote = ({charity, quote, donationValue}) => {

    return (
		quote || charity.impact ?
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
							<b>{charity.impact}</b>
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

import React from 'react';
import { Jumbotron, Container } from 'reactstrap';
import ACard from './ACard';
import Roles from '../../base/Roles';
import C from '../../C';
import DataStore from '../../base/plumbing/DataStore';
import Misc from '../../base/components/Misc';
import ActionMan from '../../plumbing/ActionMan';
import { SquareLogo } from '../Image';
import MDText from '../../base/components/MDText';
import Counter from '../../base/components/Counter';
import Money from '../../base/data/Money';
import WhiteCircle from '../WhiteCircle';
import DevLink from '../campaignpage/DevLink';
import CharityLogo from '../CharityLogo';
import { space } from '../../base/utils/miscutils';

/**
 * Logo + £s + summaryDescription
 * @param {?Number} i - e.g. 0 for "first in the list". Used for bg colour
 */
const CharityMiniCard = ({charity, NGOid, donationValue, i}) => {
	// HACK: prefer short description
	let desc = charity.summaryDescription || charity.description || '';
	// Cut descriptions down to 1 paragraph.
	let firstParagraph = (/^.+\n *\n/g).exec(desc);
	if (firstParagraph) {
		desc = firstParagraph[0];
	}
	
	return ( 
		<div className="col-md-4 charity-card mt-5 mt-md-0">
			<div className="flex-column">
				<WhiteCircle className="mb-5 w-50 mx-auto" circleCrop={charity.circleCrop}>
					<CharityLogo charity={charity}/>
				</WhiteCircle>
				{donationValue? <h4 className="text-left">
					<Counter currencySymbol="&pound;" value={donationValue} />&nbsp;raised
				</h4> : null}
				<div className="stub-divider"/>
				<div className="charity-description text-block" >
					<MDText source={desc} />
					<a href={charity.url} target="_blank" rel="noopener noreferrer">Go to charity website</a>
				</div>
				{NGOid? <DevLink href={'https://app.sogive.org/#simpleedit?charityId='+escape(NGOid)} target="_sogive">SoGive</DevLink> : null}
			</div>
		</div>
	);
};

export default CharityMiniCard;

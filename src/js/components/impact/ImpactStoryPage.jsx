
import React, { useEffect } from 'react';
import KStatus from '../../base/data/KStatus';
import List from '../../base/data/List';
import I18N from '../../base/i18n';
import PromiseValue from '../../base/promise-value';
import { getDataItem, getDataList, setWindowTitle } from '../../base/plumbing/Crud';
import C from '../../C';
import DataStore from '../../base/plumbing/DataStore';
import SearchQuery from '../../base/searchquery';
import { Button, Col, Container, InputGroup, Row } from 'reactstrap';
import PropControl from '../../base/components/PropControl';
import { Card } from '../../base/components/CardAccordion';
import BG from '../../base/components/BG';
import Misc from '../../MiscOverrides';
import { encURI, getLogo, space, uniq, yessy } from '../../base/utils/miscutils';
import Branding from '../../base/data/Branding';
import Impact from '../../base/data/Impact';
import Money from '../../base/data/Money';
import { OTHER_CONSENT } from '../../base/data/Claim';
import { fetchImpactItems, FilterBar, getImpactDebits, HeadlineDonationCard, ImpactFilters } from './ImpactOverviewPage';
import NGO from '../../base/data/NGO';
import LinkOut from '../../base/components/LinkOut';
import ServerIO from '../../plumbing/ServerIO';
import { getId, getType } from '../../base/data/DataClass';
import DynImg from '../../base/components/DynImg';
import { setNavProps } from '../../base/components/NavBar';
import PortalLink from '../../base/components/PortalLink';


const ImpactStoryPage = () => {
	/** @type {ImpactFilters} */
	let filters = DataStore.getValue('location','params');
	let status = filters.status;

	// fetch items
	let {focusItem, brand1, brand2, agency, charity, campaign} = fetchImpactItems(filters);

	setNavProps(focusItem);
	let windowTitle = space("Impact Page", focusItem && "for "+focusItem.name);
	setWindowTitle(windowTitle);
	
	let pvDebits = getImpactDebits({filters});
	let debits = pvDebits.value;
	// 1st description
	let impactdebit0 = debits && List.hits(debits)[0];

	return <Container>
		<FilterBar filters={filters} />
		<Row>
			<Col>
				<Card style={{background:"#3488AB"}}><HeadlineDonationCard brand={charity} charity={charity} filters={filters} impactdebit={impactdebit0} /></Card>
				<h4><C.A href={"/ihub?"+/* TODO a better breadcrumb */{Advertiser:"brand",Agency:"agency"}[getType(focusItem)]+"="+encURI(focusItem?.id)}>&lt; {focusItem?.name}</C.A></h4>
			</Col>
			<Col>
				<Card><StoryCard filters={filters} charity={charity} impactdebit={impactdebit0} /></Card>
			</Col>
		</Row>
		{/* <Card><ViewCountCard filters={filters} /></Card>
		<Card><LogoWallCard brand={brand} filters={filters} /></Card> */}
	</Container>;
};


/* ------- Data Functions --------- */

/* ------- End of Data Functions --------- */


/* ------- Components --------- */

const StoryCard = ({charity, filters, impactdebit}) => {
	if ( ! charity) charity={};
	let pvDebits = getImpactDebits({filters});
	let debits = pvDebits.value;
	let branding = Branding.get(charity) || {};
	// 1st description
	let desc = List.hits(debits)?.map(debit => debit.impact?.description).filter(x => x)[0];
	if ( ! desc) desc = NGO.anyDescription(charity);
	// image?
	let images = List.hits(debits)?.map(debit => debit.impact?.img).filter(x => x);
	if ( ! yessy(images)) {
		images = NGO.images(charity);
	}
	return <>
		<h3>{NGO.displayName(charity)}</h3>
		{impactdebit?.name && <h4>{impactdebit?.name}</h4>}
		<p><small>
			<PortalLink item={charity} /> | <PortalLink item={impactdebit} />
		</small></p>
		{yessy(images) && <DynImg image={images[0]} className="w-100" />}
		{desc}
		{impactdebit?.impact?.quote && 
			<div><blockquote>{impactdebit.impact.quote.text}</blockquote>
				<div>
					<Misc.Thumbnail item={impactdebit.impact.quote.author} />
					{impactdebit.impact.quote.author?.name}
				</div>
			</div>
		}
	</>;
};

export default ImpactStoryPage;

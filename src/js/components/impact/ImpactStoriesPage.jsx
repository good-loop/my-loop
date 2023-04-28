import React, { useEffect, useState, useRef } from 'react';
import { useTransition, animated, useSpring } from 'react-spring';
import PromiseValue from '../../base/promise-value';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { Card as CardCollapse } from '../../base/components/CardAccordion';
import TODO from '../../base/components/TODO';
import { Button, Col, Container, InputGroup, Row } from 'reactstrap';
import PropControl from '../../base/components/PropControl';
import Circle from '../../base/components/Circle';
import BG from '../../base/components/BG';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop, markPageLoaded } from './GLCards';
import NGO from '../../base/data/NGO';
import Money from '../../base/data/Money';
import CharityLogo from '../CharityLogo';
import C from '../../C';
import AdvertsCatalogue from '../campaignpage/AdvertsCatalogue';
import { getDataItem } from '../../base/plumbing/Crud';
import KStatus from '../../base/data/KStatus';
import Misc from '../../base/components/Misc';
import List from '../../base/data/List';
import Campaign from '../../base/data/Campaign';
import Advertiser from '../../base/data/Advertiser';
import { getImpressionsByCampaignByCountry } from './impactdata';
import printer from '../../base/utils/printer'
import { PlaceholderCard } from './ImpactPlaceholderCard';

/**
 * DEBUG OBJECTS
 */

import {TEST_CHARITY, TEST_CHARITY_OBJ, TEST_BRAND, TEST_BRAND_OBJ, TEST_CAMPAIGN, TEST_CAMPAIGN_OBJ} from './TestValues';
import { addAmountSuffixToNumber } from '../../base/utils/miscutils';
import { dataColours, getCountryFlag, getCountryName } from '../pages/greendash/dashUtils';
import { goto } from '../../base/plumbing/glrouter';


/**
 * 
 * @param {Object} p
 */
export const ImpactStoriesPage = ({pvBaseObjects, navToggleAnimation, totalString, brand, campaign, subBrands, charities, subCampaigns, impactDebits, mainLogo}) => {
	if (pvBaseObjects.resolved) console.log("base objs:", pvBaseObjects)
	// TODO refactor to break the code block below into shorter chunks so it's easier to see and edit
	// let mode = campaign ? 'campaign' : (mast)
	return (
	<>
		{pvBaseObjects.resolved && <> 
		<div className='iview-positioner pr-md-1'>
			<Container fluid className='iview-container'>
				<animated.div className='impact-navbar-flow' style={{width: navToggleAnimation.width, minWidth: navToggleAnimation.width}}></animated.div>
				<Container fluid className='stories-content'>
					<CardSeperator text={``} />
					<PlaceholderCard cardName={"splash"} />
					<CardSeperator text={"Here's What $Brand_Campaigns \nWith Good-Loop Have Achieved..."} />
					<PlaceholderCard cardName={"Total Raised + Impact Highlights"} />
					<CardSeperator text={"Campaign Spotlight: $Chosen_Campaign"} />
					<PlaceholderCard cardName={"Campaign Spotlight"} />
					<CardSeperator text={"$Brand's Impact With Good-Loop In Focus"} />
					<PlaceholderCard cardName={"Campaign Impact 1"} />
					<PlaceholderCard cardName={"Campaign Impact 2"} />
					<PlaceholderCard cardName={"How It Works"} />
					<CardSeperator text={"Donation Details"} />
					<PlaceholderCard cardName={"Donation Details"} />
					<CardSeperator text={"Learn More"} />
					<PlaceholderCard cardName={"Learn More Links"} />
				</Container>
			</Container>
		</div>
		</>}
		<GLModalBackdrop/>
	</>
	);
};


const CardSeperator = ({text}) => {
	return (
	<div className={"cardSeperator"}>
		<h3>{text}</h3>
	</div>
	)
} 
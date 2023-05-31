import React, { useEffect, useState, useRef } from 'react';
import { useTransition, animated, useSpring } from 'react-spring';
import PromiseValue from '../../base/promise-value';
import { setWindowTitle } from '../../base/plumbing/Crud';
import DataStore from '../../base/plumbing/DataStore';
import { Card as CardCollapse } from '../../base/components/CardAccordion';
import { Button, Col, Container, InputGroup, Row } from 'reactstrap';
import PropControl from '../../base/components/PropControl';
import Circle from '../../base/components/Circle';
import BG from '../../base/components/BG';
import { getLogo, space, stopEvent, uniq } from '../../base/utils/miscutils';
import { modifyPage } from '../../base/plumbing/glrouter';
import DynImg from '../../base/components/DynImg';
import NavBars from './ImpactNavBars';
import ImpactLoginCard from './ImpactLogin';
import { GLCard, GLHorizontal, GLVertical, GLModalCard, GLModalBackdrop, markPageLoaded } from './GLCards';
import ImpactFilterOptions from './ImpactFilterOptions'
import { fetchCharity } from '../pages/MyCharitiesPage'
import NGO from '../../base/data/NGO';
import CharityLogo from '../CharityLogo';
import { normaliseSogiveId } from '../../base/plumbing/ServerIOBase';
import ActionMan from '../../plumbing/ActionMan';
import C from '../../C';
import NGOImage from '../../base/components/NGOImage';
import AdvertsCatalogue from '../campaignpage/AdvertsCatalogue';
import { getDataItem } from '../../base/plumbing/Crud';
import KStatus from '../../base/data/KStatus';
import Misc from '../../base/components/Misc';
import List from '../../base/data/List';
import ListLoad from '../../base/components/ListLoad';
import Campaign from '../../base/data/Campaign';
import Advertiser from '../../base/data/Advertiser';
import ImpactLoadingScreen from './ImpactLoadingScreen'
import Money from '../../base/data/Money';
import SearchQuery from '../../base/searchquery';
import { fetchBaseObjects	 } from './impactdata';
import ImpactOverviewPage, {ImpactFilters} from './ImpactOverviewPage';
import ImpactStatsPage from './ImpactStatsPage';

/**
 * DEBUG OBJECTS
 */

import Login from '../../base/youagain';



export const ErrorDisplay = ({e}) => {

	const [showError, setShowError] = useState(false);

	let errorTitle = "Sorry, something went wrong :(";

	if (e.message?.includes("404: Not found")) errorTitle = "404: We couldn't find that!"
	if (e.message?.includes("Invalid URL")) errorTitle = "Sorry, that's not a valid page!"

	return <Container className='mt-5'>
		<h1>{errorTitle}</h1>
		<p>
			Check you have the correct URL. If you think this is a bug, please report it to support@good-loop.com
		</p>
		<CardCollapse title="Error" collapse={!showError} onHeaderClick={() => setShowError(!showError)}>
			<code>
				{e.message}
			</code>
		</CardCollapse>
	</Container>;
}

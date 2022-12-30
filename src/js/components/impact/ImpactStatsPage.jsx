
import React, { useEffect } from 'react';
import KStatus from '../../base/data/KStatus';
import List from '../../base/data/List';
import I18N from '../../base/i18n';
import PromiseValue from '../../base/promise-value';
import { getDataItem, getDataList, setWindowTitle } from '../../base/plumbing/Crud';
import C from '../../C';
import DataStore from '../../base/plumbing/DataStore';
import SearchQuery from '../../base/searchquery';
import PropControlDataItem from '../../base/components/PropControlDataItem';
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
import { fetchImpactItems, FilterBar, getImpactDebits, HeadlineDonationCard, ImpactFilters } from './ImpactHubPage';
import NGO from '../../base/data/NGO';
import LinkOut from '../../base/components/LinkOut';
import ServerIO from '../../plumbing/ServerIO';
import { getId, getType } from '../../base/data/DataClass';
import DynImg from '../../base/components/DynImg';
import { setNavProps } from '../../base/components/NavBar';


const ImpactStatsPage = () => {
	return <>
        TODO an impact version of the Green Dashboard
	</>;
};

export default ImpactStatsPage;

import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Col, Container, Modal, ModalBody, ModalHeader, Row } from 'reactstrap';


import { GLCard } from '../../impact/GLCards';
import { CO2e, tickSvg } from './GreenDashUtils';

import C from '../../../C';
import KStatus from '../../../base/data/KStatus';
import ListLoad from '../../../base/components/ListLoad';
import DataStore from '../../../base/plumbing/DataStore';
import { Bytes, space, sum } from '../../../base/utils/miscutils';
import { modifyPage } from '../../../base/plumbing/glrouter';
import ActionMan from '../../../plumbing/ActionMan';
import Misc from '../../../MiscOverrides';
import ServerIO from '../../../plumbing/ServerIO';

import { Recommendation, TypeBreakdown } from '../../../base/components/PageRecommendations';
import { EMBED_ENDPOINT, storedManifestForTag } from '../../../base/utils/pageAnalysisUtils';
import { RECS_OPTIONS_PATH, generateRecommendations, processedRecsPath, savedManifestPath, startAnalysis } from '../../../base/components/creative-recommendations/recommendation-utils';
import PropControl from '../../../base/components/PropControl';
import ShareWidget from '../../../base/components/ShareWidget';
import Login from '../../../base/youagain';
import { getDataItem } from '../../../base/plumbing/Crud';


const getCreative = (): string | null => DataStore.getValue(['location', 'path'])[3];

const isPseudo = () => Login.getUser().service === 'pseudo';


function CreativeListItem({item}) {
	const active = (item.id === getCreative());
	const linkPath = [...DataStore.getValue(['location', 'path'])];
	linkPath[3] = item.id;

	const { vertiser: brandId } = item;
	const brand = getDataItem({type: C.TYPES.Advertiser, id: brandId}).value;

	const logo = brand?.branding?.logo;

	return (
		<Card body tag={C.A} href={modifyPage(linkPath, null, true)} className={space('creative-item my-2', active && 'active')}>
			{logo && <img src={logo} className="brand-logo" />}
			<div className="description">
				<div className="tag-name"><Misc.FixBreak text={item.name} /></div>
				{brand && <div className="brand-name"><Misc.FixBreak text={brand.name} /></div>}
			</div>
			
			<div className="selected-indicator">{active && tickSvg}</div>
		</Card>
	);
}


function CreativeList() {
	return (
		<GLCard noPadding className="creative-list">
			<CardHeader>Select a creative to optimise</CardHeader>
			<CardBody>
				{/*<div>Sort By</div>*/}
				<ListLoad
					canFilter filterLocally /* filter local on json (server side filtering would be more complex) */
					type={C.TYPES.GreenTag} status={KStatus.PUBLISHED}
					hideTotal unwrapped
					ListItem={CreativeListItem}
					pageSize={10}
					selected={item => (item.id === getCreative())}				
				/>
			</CardBody>
		</GLCard>
	);
}


/**
 * @param {object} p
 * @param {object} p.manifest PageManifest
 * @returns {JSX.Element}
 */
function CreativeSizeBreakdown({ manifest }) {
	const [open, setOpen] = useState(false);
	const toggle = () => setOpen(a => !a);

	return <>
		<Button onClick={toggle}>Show Breakdown</Button>
		<Modal isOpen={open} className="type-breakdown-modal" toggle={toggle}>
			<ModalHeader toggle={toggle}>Data Type Breakdown</ModalHeader>
			<ModalBody>
					<TypeBreakdown manifest={manifest} />
			</ModalBody>
		</Modal>
	</>;
}


function CreativeSizeOverview({ tag, manifest }) {
	let weight = tag.weight;
	if (!weight && manifest) weight = manifest.reqHeaders + manifest.reqBody + manifest.resBody + manifest.resHeaders;

	// Provide an easy link to see the creative - either URL as given or HTML snippet/tag wrapped in a page
	let testLink;
	if (tag.creativeURL) {
		testLink = tag.creativeURL;
	} else if (tag.creativeHtml) {
		testLink = `${EMBED_ENDPOINT}?tag=${encodeURIComponent(tag.creativeHtml)}&why=measure-tag`;
	}

	return (
		<GLCard noPadding noMargin className="creative-size-card">
			<CardHeader>Your Creative</CardHeader>
			<CardBody>
				{manifest && (
					<img className="creative-screenshot w-100" src={manifest.screenshot} />
				)}
				<h4 className="text-center my-2">
					<C.A href={testLink} target="_blank">Creative Test Link</C.A>
				</h4>
				{/* TODO calculate this (country specific or global average??) <div className="carbon-per-impression">
					{CO2e} per impression<br/>
					based on creative size
					<div className="number">{perAdCO2}g {CO2e}</div>
				</div> */}
				<div className="size-info">
					<div className="bytes">
						Creative size
						<div className="number">
							{weight ? Bytes({b:weight}) : '-'}
							{weight && !tag.weight && <span title="Size not yet confirmed">*</span>}
						</div>
					</div>
					<div className="breakdown">
						<CreativeSizeBreakdown manifest={manifest} />
					</div>
				</div>
				
			</CardBody>
		</GLCard>
	);
}


/**
 * How much can the suggested optimisations reduce creative size?
 * @param {Object} p
 * @param {Object what is the data type??} recommendations List of all transfers augmented with recompressed / substitute items.
 */
function Reduction({ manifest, recommendations }) {
	if (!manifest || !recommendations) return null;
	// NB: caching the value with useEffect was leading to a stale-value bug
	let allbytes = recommendations.map(({ bytes, optBytes }) => Math.max(0, bytes - optBytes));
	let totalReduction = sum(allbytes);

	const percent = 100 * (totalReduction / manifest.totalDataTransfer);

	return (
		<div className="reduction">
			Reduce creative size by up to
			<div className="number">{percent.toFixed(1)}% <wbr /> ({Bytes({b:totalReduction})})</div>
		</div>
	);
}


function CreativeOptimisationControls() {
	return <div className="flex-row optimisation-options">
		<PropControl className="control-webp" type="checkbox" path={RECS_OPTIONS_PATH} prop="noWebp" label="Can't use .webp"
			help="Use this option to avoid generating .webp recommendations if your DSP doesn't support it."
		/>
		<PropControl className="control-retina" type="radio" path={RECS_OPTIONS_PATH} prop="retinaMultiplier" label="Resolution"
			options={[1, 1.5, 2]} labels={{1: 'Standard', 1.5: 'Compromise', 2: 'Retina'}}
			help="Retina mode scales images 2x larger to look best on ultra-high-density screens. Compromise mode scales to 1.5x to balance sharpness and file size."
		/>
	</div>;
};


function CreativeOptimisationOverview({ tag, manifest }): JSX.Element {
	const path = processedRecsPath({tag}, manifest);
	// ??what data "type" is recommendations??
	const recommendations = DataStore.getValue(path);

	const regenerate = () => generateRecommendations(manifest, path);

	// Hard-set initial values for options and force an update
	useEffect(() => DataStore.setValue(RECS_OPTIONS_PATH, { noWebp: false, retinaMultiplier: 1 }), []);

	// If there was no recommendations list in DataStore for the current tag/manifest combo, generate now.
	useEffect(() => {
		if (!DataStore.getValue(RECS_OPTIONS_PATH)) return; // Don't generate until default options are set
		if (manifest && !recommendations) regenerate();
	}, [recommendations, ...path]);

	const recCards = recommendations?.filter(spec => spec.optBytes < spec.bytes)
	.map(spec => (
		<Col className="mb-2" xs="4" key={spec.url} >
			<Recommendation spec={spec} />
		</Col>
	));

	return (
		<GLCard noPadding noMargin className="creative-opt-overview-card">
			<CardHeader>Optimisation Recommendations</CardHeader>
			<CardBody>
				<AnalyseTagPrompt tag={tag} manifest={manifest} />
				{recommendations && <>
					<Reduction manifest={manifest} recommendations={recommendations} />
					<CreativeOptimisationControls />
					<Container className="recs-list">
						<Row>{recCards}</Row>
					</Container>
				</>}
			</CardBody>
			{!isPseudo() && <CardFooter>
				<ShareWidget item={tag} hasButton noEmails hasLink>Share this page</ShareWidget>
			</CardFooter>}
		</GLCard>
	);
}


/**
 * Prompt and button to initiate / redo analysis of a single Green Ad Tag creative.
 * @param {object} p
 * @param {object} tag Currently-focused Green Ad Tag
 * @param {object} manifest Any existing page manifest for the focused GAT
 */
function AnalyseTagPrompt({ tag, manifest }): JSX.Element {
	const [analysisState, setAnalysisState] = useState<string|object>({});

	if (analysisState === 'loading') return <Misc.Loading text="Analysis in progress..." />;

	// Call MeasureServlet and analyse / re-analyse the GAT creative.
	const doIt = () => {
		setAnalysisState('loading');
		startAnalysis({tag}).then(
			() => setAnalysisState('ready'),
			error => setAnalysisState({error})
		);
	};

	// Already analysed? Show a less-prominent prompt to redo.
	if (manifest) {
		return <h5 className="text-center pull-right">
			{(!manifest.timestamp) ? <>Previously analysed.</> : (
				<>Last analysed <Misc.RelativeDate date={new Date(manifest.timestamp)} />.</>
			)}<br/>
			<Button className="my-2" onClick={doIt}>Re-Analyse</Button>
		</h5>;
	}

	return <h4 className="text-center">
		{analysisState.error ? <>
			Analysis failed with error &quot;{analysisState.error}&quot;. Retry?
		</> : <>
			This creative has not yet been analysed.
		</>}
		<Button className="mx-2" onClick={doIt} size="lg">Analyse Now</Button>
	</h4>;
}


// don't mind me, just learning typescript
type Setter<T> = {
	(val: T): void;
}


function CreativeView({ showList, setShowList }: {showList: boolean, setShowList: Setter<boolean>|null}): JSX.Element {
	const tagId = getCreative();
	if (!tagId) return <div>Select a creative from the list to get started.</div>;

	const pvTag = ActionMan.getDataItem({type: C.TYPES.GreenTag, status: KStatus.PUBLISHED, id: tagId});

	if (!pvTag.resolved) return <Misc.Loading text="Loading requested creative..." />;
	if (!pvTag.value) return <Alert color="danger">Couldn't find a creative with ID <code>{tagId}</code>.</Alert>;
	const tag = pvTag.value;

	const pvManifest = DataStore.fetch(savedManifestPath({tag}), () => (
		ServerIO.load(storedManifestForTag(tag), { swallow: true })
	));

	if (!pvManifest.resolved) return <Misc.Loading text="Checking for saved creative manifest..." />;

	// Minor hack: do a direct getValue() because AnalysePrompt overwrites the address, but not the fetch PV
	// MeasureServlet response is an array - but should only have one PageManifest in this context
	const manifest = DataStore.getValue(savedManifestPath({tag}))?.[0] || null;

	return <>
		<CardHeader>
			{setShowList && <a className="pull-left expand-button" role="button" onClick={() => setShowList(!showList)}>
				{showList ? '⇱' : '⇲'}
			</a>}
			Creative analysis: {tag.name}
		</CardHeader>
		<CardBody>
			<Container fluid>
				<Row>
					<Col xs="4">
						<CreativeSizeOverview tag={tag} manifest={manifest} />
					</Col>
					<Col xs="8">
						<CreativeOptimisationOverview tag={tag} manifest={manifest} />
					</Col>
				</Row>
			</Container>
		</CardBody>
	</>;
}


/**
 * 
 */
function GreenRecsCreative() {
	let [showList, setShowList] = useState(true);

	if (isPseudo()) {
		showList = false;
		setShowList = null;
	}

	return (
		<Container fluid className="creative-recommendations">
			<Row>
				{showList && !isPseudo() ? (
					<Col xs="3"><CreativeList /></Col>
				) : null}
				<Col xs={showList ? '9' : '12'}>
					<GLCard className="view-creative" noPadding>
						<CreativeView showList={showList} setShowList={setShowList}/>
					</GLCard>
				</Col>
			</Row>
		</Container>
	);
}


export function CreativeRecsPlaceholder() {
	return <>{/*
		<h3 className="mx-auto">Optimise Creative Files to Reduce Carbon</h3>
		<h4>Tips</h4>
		<p>
			These tips can require special tools to apply. We are working on automated self-service web tools to make this easy. Meanwhile - email us and we can
			help.
		</p>
		<ul>
			<li>Use .webp format instead of .png. webp is a more modern format which can do compression and transparency.</li>
			<li>Optimise fonts. Often a whole font will be included when just a few letters are needed.</li>
			<li>Sometimes replacing a font with an svg can further reduce the creative weight.</li>
			<li>Use .webm format for videos. It can get better compression.</li>
			<li>Replace GIFs. Embedded video (e.g. .webm or .mp4) is better for animations, and .webp is better for static images.</li>
			<li>Strip down large javascript libraries. Often a whole animation library is included when only a snippet is used.</li>
		</ul>
	*/}</>;
}


export default GreenRecsCreative;

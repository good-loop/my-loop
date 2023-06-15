import React, { useEffect, useState } from 'react';
import { Alert, Button, Card, CardBody, CardFooter, CardHeader, Col, Container, Row } from 'reactstrap';


import { GLCard } from '../../impact/GLCards';
import { CO2e, tickSvg } from './GreenDashUtils';

import C from '../../../C';
import KStatus from '../../../base/data/KStatus';
import ListLoad from '../../../base/components/ListLoad';
import DataStore from '../../../base/plumbing/DataStore';
import { space } from '../../../base/utils/miscutils';
import { modifyPage } from '../../../base/plumbing/glrouter';
import ActionMan from '../../../plumbing/ActionMan';
import Misc from '../../../MiscOverrides';
import ServerIO from '../../../plumbing/ServerIO';

import PageRecommendations from '../../../base/components/PageRecommendations';
import { storedManifestForTag } from '../../../base/utils/pageAnalysisUtils';


const getCreative = (): string | null => DataStore.getValue(['location', 'path'])[3];
const setCreative = (id: string): void => {
	const newPath = [...DataStore.getValue(['location', 'path'])];
	newPath[3] = id;
	modifyPage(newPath);
};


function CreativeListItem({item}) {
	const active = (item.id === getCreative());
	const setActive = () => setCreative(item.id);

	return (
		<GLCard className={space('creative-item', active && 'active')} noMargin onClick={setActive}>
			<Misc.ImgThumbnail />
			{item.name}
			<div className="selected-indicator">{active && tickSvg}</div>
		</GLCard>
	);
}


function CreativeList() {
	return (
		<GLCard className="creative-list">
			<div>Select a creative to view optimisation recommendations</div>
			<div>Sort By</div>
			<ListLoad type={C.TYPES.GreenTag} status={KStatus.PUBLISHED} hideTotal unwrapped notALink ListItem={CreativeListItem} pageSize={10} />
		</GLCard>
	);
}


function CreativeSizeOverview({ tag, manifest }) {
	return (
		<GLCard noPadding noMargin className="creative-size-card">
			<CardHeader>Your Creative Measurement</CardHeader>
			<CardBody>
				<div className="carbon-per-impression">
					{CO2e} per impression based on creative size
					<div className="number">1.1825g {CO2e}</div>
				</div>
				<div className="size-info">
					<div className="bytes">
						Creative size
						<div className="number">{tag.weight || 999999} bytes</div>
					</div>
					<div className="breakdown">
						<a role="button" onClick={() => {}}>View Breakdown</a>
					</div>
				</div>
				<img src={manifest.screenshot} className="w-100" />
			</CardBody>
		</GLCard>
	);
}


function CreativeOptimisationOverview({ tag, manifest }) {
	return (
		<GLCard noPadding noMargin className="creative-opt-overview-card">
			<CardHeader>Optimisation Recommendations</CardHeader>
			<CardBody>
				<p>Potential reduction in your creative's {CO2e}</p>
				<div className="reduction">
					Reduce {CO2e} by
					<div className="number">up to XX%</div>
				</div>
				<Container className="recs-list">
					<Row>
						{PageRecommendations({manifest}).map(rec => <Col xs="6">{rec}</Col>)}
					</Row>
				</Container>
			</CardBody>
			<CardFooter>
				Share
			</CardFooter>
		</GLCard>
	);
}


/**
 * Initiate analysis of 
 */
function AnalysePrompt({ tag }): JSX.Element {
	const [analysisState, setAnalysisState] = useState<string>();

	if (analysisState === 'loading') return <Misc.Loading text="Analysis in progress..." />;

	const doIt = () => {
		ServerIO.load(`${ServerIO.MEASURE_ENDPOINT}`, { data: { tagId: tag.id, url: tag.creativeURL } }).then(res => {
			// Store results where CreativeView will find them
			if (!res.error) DataStore.setValue(['widget', 'saved-tag-measurement', tag.id], res.cargo);
		});
		setAnalysisState('loading');
	};

	return <div>
		This creative has not yet been analysed. Do it now?<br/>
		<Button onClick={doIt}>Analyse</Button>
	</div>;
}


// don't mind me, just learning typescript
type Setter<T> = {
	(val: T): void;
}


function CreativeView({ showList, setShowList }: {showList: boolean, setShowList: Setter<boolean>}): JSX.Element {
	const tagId = getCreative();
	if (!tagId) return <div>Select a creative from the list to get started.</div>;

	const pvTag = ActionMan.getDataItem({type: C.TYPES.GreenTag, status: KStatus.PUBLISHED, id: tagId});

	if (!pvTag.resolved) return <Misc.Loading text="Loading requested creative..." />;
	if (!pvTag.value) return <Alert color="danger">Couldn't find a creative with ID <code>{tagId}</code>.</Alert>;
	const tag = pvTag.value;

	const pvManifest = DataStore.fetch(['widget', 'saved-tag-measurement', tagId], () => (
		ServerIO.load(storedManifestForTag(tagId), { swallow: true })
	));

	if (!pvManifest.resolved) return <Misc.Loading text="Checking for saved creative manifest..." />;

	// Normal MeasureServlet response is a list of manifests as multiple URLs can be analysed.
	// Just pull out the first, as green tags should only have one.
	const manifest = pvManifest.value?.[0] || null;

	return <>
		<CardHeader>
			<a className="pull-left expand-button" role="button" onClick={() => setShowList(!showList)}>{showList ? '⇱' : '⇲'}</a>
			{tag.name}
		</CardHeader>
		<CardBody>
			{manifest ? (
				<Container>
					<Row>
						<Col xs="4">
							<CreativeSizeOverview tag={tag} manifest={manifest} />
						</Col>
						<Col xs="8">
							<CreativeOptimisationOverview tag={tag} manifest={manifest} />
						</Col>
					</Row>
				</Container>
			) : (
				<AnalysePrompt tag={tag} />
			)}
		</CardBody>
	</>;
}


/**
 * 
 */
function GreenRecsCreative() {
	const [showList, setShowList] = useState(true);

	return (
			<Container fluid className="creative-recommendations">
				<Row>
					{showList ? (
						<Col xs="3"><CreativeList /></Col>
					) : null}
					<Col xs={showList ? '9' : 12}>
						<GLCard className="view-creative" noPadding>
							<CreativeView showList={showList} setShowList={setShowList}/>
						</GLCard>
					</Col>
				</Row>
			</Container>
	);
}


export function CreativeRecsPlaceholder() {
	return <>
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
	</>;
}


export default GreenRecsCreative;

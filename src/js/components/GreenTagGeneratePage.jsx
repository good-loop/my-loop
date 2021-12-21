import React, { Fragment } from 'react';
import { Col, Row, Button, Container, Card, CardHeader, CardBody } from 'reactstrap';

import PropControl from '../base/components/PropControl';
import C from '../C';
import ListLoad from '../base/components/ListLoad';
import { copyTextToClipboard, doShare, modifyHash, space, stopEvent } from '../base/utils/miscutils';
import KStatus from '../base/data/KStatus';
import Misc from '../base/components/Misc';
import { nonce } from '../base/data/DataClass';
import GreenTag, { KGreenTagType, KMacroType } from '../base/data/GreenTag';
import ActionMan from '../plumbing/ActionMan';
import Login from '../base/youagain';





/** Which green tag types wrap or bounce an existing VAST/VPAID tag? (And how should we describe it?) */
const wrappingTags = {
	[KGreenTagType.REDIRECT]: 'redirect to',
	[KGreenTagType.WRAPPER]: 'wrap',
};

const labelTagTypes = { PIXEL: 'Pixel', REDIRECT: 'Redirect with logging', WRAPPER: 'VAST/VPAID wrapper' };
const labelMacroTypes = { NONE: 'No macros', XANDR: 'AppNexus / Xandr', GOOGLE: 'Google / DoubleClick', TTD: 'TheTradeDesk' };


// Create or save changes to a green tag
const saveTag = (tagId) => {
	const type = C.TYPES.GreenTag;
	let path = DataStore.getDataPath({ status: KStatus.DRAFT, type, id: tagId });
	let afterPublish; // Action for after publish completes
	let item; // Local item to publish

	// Saving new tag?
	if (tagId === 'new') {
		item = new GreenTag(DataStore.getValue(path)); // Create copy
		item.id = nonce(8); // ...and give it a real ID
		afterPublish = () => DataStore.setValue(path, null); // Delete local temp copy when published
	} else {
		item = DataStore.getValue(path);
	}

	// Do it
	ActionMan.publishEdits(type, item.id, item).then(() => {
		afterPublish && afterPublish();
		modifyHash(['green', item.id]); // Return to view mode (on the new tag ID, if it's changed)
	}) // ...and execute follow-up actions
};


/** Left pane when editing or creating a new tag */
const EditPane = ({tagId}) => {
	const type = C.TYPES.GreenTag;
	const isNew = tagId === 'new';
	
	const path = DataStore.getDataPath({ type, status: KStatus.DRAFT, id: tagId }); // Path to draft copy of the tag
	
	// Get a clean copy of the tag...
	const pvTag = isNew ? (
		{ resolved: true, value: new GreenTag() }
	) : (
		ActionMan.getDataItem({ type, status: KStatus.PUBLISHED, id: tagId })
	);

	// Tag not loaded?
	if (!pvTag.value) {
		if (pvTag.resolved) {
			if (tagId) {
				return `Couldn't find tag with ID ${tagId}`; // Show error for "tried to load tag but couldn't"
			} else {
				return `Bad tag ID: "${tagId}"`; // Blank/falsy tag ID? Shouldn't happen, but.
			}
		}
		// Waiting for response from server
		return <Misc.Loading text="Loading tag..." />;
	}

	// Check existence of draft copy
	let tag = DataStore.getValue(path);
	if (!tag) {
		 // ...and create if necessary.
		tag = new GreenTag(pvTag.value);
		DataStore.setValue(path, tag);
	}

	 // Leave editor and discard local edits to draft
	const goBack = () => {
		modifyHash(['green', tagId]);
		DataStore.setValue(path, null);
	}	
	
	return (
		<Card className="left-pane edit-pane">
			<CardHeader className="pane-header">
				{tagId === 'new' ? 'Creating' : 'Editing'} Green Ad Tag
				<div role="button" className="back-chevron" onClick={goBack}>⏴</div>
			</CardHeader>
			<CardBody>
				<small>
					TODO Either more of these controls should be locked for already-created tags - or this editor shouldn't apply to them at all.<br/>
					Should you be able to change any aspect of an existing tag besides its display name? Probably not!
				</small>
				<PropControl label="Create" type="radio" path={path} prop="tagType" options={KGreenTagType.values} labels={labelTagTypes} />
				<PropControl label="Enter a name for your Green Ad Tag" path={path} prop="name" />
				<PropControl label="Enter a campaign ID to collate logging data for your advert" path={path} prop="campaign"
					disabled={tagId !== 'new'} help={tagId !== 'new' ? 'You cannot change the Campaign ID of an existing tag.' : null}
				/>
				{wrappingTags[tag.tagType] ? (
					<PropControl label={`Enter the tag or landing page URL you want to ${wrappingTags[tag.tagType]}`} path={path} prop="wrapped" />
				): null}
				<PropControl label="Macros" type="radio" path={path} prop="macros" options={KMacroType.values} labels={labelMacroTypes} />
				<Button id="generate-tag-button" color="primary" onClick={() => saveTag(tagId)}>
					{ isNew ? 'Create Tag' : 'Save Tag' }
				</Button>
				{ !isNew ? (
					<Button id="generate-tag-button" color="default" onClick={goBack}>Cancel</Button>
				) : null }
			</CardBody>
		</Card>
	);
};


/** Left pane when displaying, but not editing, a tag */
const ShowPane = ({ tagId }) => {
	const type = C.TYPES.GreenTag;
	const status = KStatus.PUBLISHED;

	const pvTag = ActionMan.getDataItem({ type, status, id: tagId });

	// Tag not loaded?
	if (!pvTag.value) {
		if (pvTag.resolved) {
			if (tagId) {
				return `Couldn't find tag with ID ${tagId}`; // Show error for "tried to load tag but couldn't"
			} else {
				return `Bad tag ID: "${tagId}"`; // Blank/falsy tag ID? Shouldn't happen, but.
			}
		}
		// Waiting for response from server
		return <Misc.Loading text="Loading tag..." />;
	}

	const tag = pvTag.value;

	return (
		<Card className="left-pane show-pane">
			<CardHeader className="pane-header">
				Your Green Ad Tag
				<div role="button" className="back-chevron" onClick={() => modifyHash(['green'])}>⏴</div>
			</CardHeader>
			<CardBody>
				<h3>{tag.name}</h3>
				<p>Created: <Misc.RoughDate date={tag.created} /></p>
				<p>Tag type: {labelTagTypes[tag.tagType]}</p>
				<p>Campaign ID: <code>{tag.campaign}</code></p>
				{wrappingTags[tag.tagType] ? <p>Target URL: {tag.wrapped}</p> : null}
				<p>
					<TagExport tag={tag} />
				</p>
				<Button color="primary" onClick={() => modifyHash(['green', tagId, 'edit'])}>Edit this tag</Button>
			</CardBody>
		</Card>
	);
};

/** Left pane when not focusing on a particular tag */
const IdlePane = () => {
	return (
		<Card className="left-pane idle-pane">
			<CardHeader className="pane-header">
				Green Ad Tag Generator
			</CardHeader>
			<CardBody>
				<p>
					<Button color="primary" onClick={() => modifyHash(['green', 'new', 'edit'])}>Create a new tag</Button>
				</p>
				<p>Or select an existing tag from the list on the right.</p>
			</CardBody>
		</Card>
	);
};


/** Summary of a green tag for display in ListLoad */
const TagListItem = ({ item }) => {
	const created = new Date(item.created);
	const path = DataStore.getValue(['location', 'path']);
	const focusTagId = path[1];
	
	const focused = item.id === focusTagId;
	let containerProps = {};
	if (!focused) {
		containerProps.role = "button";
		containerProps.onClick = () => modifyHash(['green', item.id]);
	}

	return (
		<Card body className={space('inner', focused && 'focused')}>
		<Row >
			<Col sm="6">
				<p className="tag-name" title={`Tag name: ${item.name}`}>{item.name}</p>
				<p className="created" title={`Tag created ${created.toString()}`}>Created <Misc.RoughDate date={created} /></p>
				<p className="campaign">Campaign: <code>{item.campaign}</code></p>
				<small>TODO A filter button next to campaign ID that applies a "campaign:this_campaign" filter to the list</small>
			</Col>
			<Col sm="6">
				<TagExport tag={item} />
			</Col>
		</Row>
	</Card>
	);
};

const TagExport = ({tag}) => {
	if (!tag) return null;

	const tagExport = GreenTag.generate(tag);

	const copyTag = (e) => {
		stopEvent(e);
		copyTextToClipboard(tagExport);
		return false;
	};

	// Share button won't be shown if the browser doesn't support it as an action
	const shareTag = (e) => {
		stopEvent(e);
		doShare(tagExport);
		return false;
	};

	return <>
		<small>Tag export:</small><br/>
		<div className="tag-export mb-2">{tagExport}</div>
		<Button size="sm" color="default" onClick={() => copyTag}>Copy to Clipboard</Button>
		{ navigator.share ? (
			<Button size="sm" color="default" onClick={() => shareTag}>Share</Button>
		) : null}
	</>;
};


const GreenTagGeneratePage = ({}) => {
	if (!Login.isLoggedIn()) {
		return 'Please log in to view and create Green Ad Tags';
	}

	const path = DataStore.getValue(['location', 'path']);
	const tagId = path[1];
	const mode = path[2];

	// Paths:
	// /greentag ==> "select or create a tag" (always present behind view/edit pane which slides in/)
	// /greentag/$tagId ==> view tag
	// /greentag/$tagId/edit ==> edit tag	
	let leftPane;
	let title;
	if (!tagId) {
		leftPane = <IdlePane />;
	} else {
		if (mode === 'edit') {
			leftPane = <EditPane tagId={tagId} />;
		} else {
			leftPane = <ShowPane tagId={tagId} />
		}
	}

	return <Container id="green-box">
		<Row className="my-4">
			<Col sm="5" className="detail-view">
				{leftPane}
			</Col>
			<Col sm="7" className="list-view p-4">
				<h4>{Login.getUser().name}</h4>
				<h3>Green Ad Tag List</h3>
				<small>TODO: Filtering and CSV export</small>
				<ListLoad type={C.TYPES.GreenTag} status={KStatus.PUBLISHED} ListItem={TagListItem} itemClassName="GreenTagItem" notALink />
				<small>TODO: Pagination</small>
			</Col>
		</Row>
	</Container>;
};


export default GreenTagGeneratePage;

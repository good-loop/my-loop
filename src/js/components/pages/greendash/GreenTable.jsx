import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import Misc from '../../../base/components/Misc';

import SimpleTable from '../../../base/components/SimpleTable';
import KStatus from '../../../base/data/KStatus';
import { getDataLogData, pivotDataLogData } from '../../../base/plumbing/DataLog';
import DataStore from '../../../base/plumbing/DataStore';
import C from '../../../C';
import ActionMan from '../../../plumbing/ActionMan';


const CampaignTable = ({ id }) => {
	if (!id) return 'No campaign ID';

	const pvCampaignData = DataStore.fetch(['widget', 'greendash', 'tables', 'campaign', id], () => {
		return getDataLogData({
			dataspace: 'green',
			q: `evt:pixel AND campaign:${id}`,
			breakdowns: ['adid/domain'],
		}).promise.then(res => pivotDataLogData(res, ['adid', 'domain']));
	});

	console.log('************* campaign data value', pvCampaignData.value);

	const pvTagsList = ActionMan.list({
		type: C.TYPES.GreenTag,
		status: KStatus.PUBLISHED,
		q: `campaign:${id}`
	});

	console.log('************* tags for campaign', pvTagsList.value);

	const campaignData = pvCampaignData.value;

	if (!campaignData) {
		return <Misc.Loading text="HONK" />
	}

	return <>
		<SimpleTable dataObject={campaignData} />
	</>;
};


const TagTable = ({ id }) => {
	if (!id) return 'No tag ID';
	return `tag table for ${id}`;
};

/**
 * Spreadsheet Table view -- What's the use case for this?? Is there a design / spec notes??
 * @returns 
 */
const GreenTable = () => {
	const path = DataStore.getValue(['location', 'path']);
	const tableType = path[2]; // campaign or tag
	const itemId = path[3];

	const Table = {
		campaign: CampaignTable,
		tag: TagTable,
	}[tableType] || (() => 'Invalid mode: ' + tableType);

	return <div className="green-subpage green-metrics">
		<Container>
			<Row>
				<Col md="12">
					<Table id={itemId} />
				</Col>
			</Row>
		</Container>
	</div>;
};

export default GreenTable;
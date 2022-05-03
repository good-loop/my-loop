import React, { useEffect, useState } from 'react';
import PropControl from '../../base/components/PropControl';
import { CharityCard } from './MyDataCommonComponents';
import { getCharityObject } from '../../base/components/PropControls/UserClaimControl';
import { getDataItem } from '../../base/plumbing/Crud';
import { getListPath } from '../../base/plumbing/DataStore';
import KStatus from '../../base/data/KStatus';
import ListLoad from '../../base/components/ListLoad';

const featuredCharities = [
    "against-malaria-foundation",
    "oxfam",
    "helen-keller-international",
    "clean-air-task-force",
    "strong-minds",
    "give-directly",
    "pratham",
    "wwf-uk",
    "cancer-research-uk"
];

const MyDataSelectCharity = () => {

    const pvNgo = getCharityObject();
    let ngo = null;
    if (pvNgo) ngo = pvNgo.value || pvNgo.interim;

    const CHARITY_WIDGET_PATH = ["widget", "MyDataCharitySelection"];

    let q = DataStore.getValue(CHARITY_WIDGET_PATH.concat("charitySearch"));
    const noQ = !q || q === "";

	// HACK: default list - poke it into appstate
	const dq = "LISTLOADHACK"; // NB: an OR over "id:X" doesn't work as SoGive is annoyingly using the schema.org "@id" property
	const type = "NGO"; 
    const status = "PUBLISHED";
	// fetch the full item - and make a Ref
	let hits = featuredCharities.map(cid => getDataItem({ type, id: cid, status }) && { id: cid, "@type": type, status });
	// HACK: This is whereListLoad will look!
	const charityPath = getListPath({ type: "NGO", status: KStatus.PUBLISHED, q: "LISTLOADHACK", sort: "impact" }); // "list.NGO.PUBLISHED.nodomain.LISTLOADHACK.whenever.impact".split(".");
	DataStore.setValue(charityPath, { hits, total: hits.length }, false);

    return <>
        <div className="modal-header-image">
            <img src="/img/mydata/charity-header.png" /> 
        </div>
        <h1 className="p-1 mb-4">Welcome!</h1>
        <h4 className="text-center p-1 mb-4">To get started, select the charity you would like to support</h4>
        <PropControl type="text" path={CHARITY_WIDGET_PATH} prop="charitySearch" label="Search our Charity Directory" className="charity-search" placeholder="Search Charities"/>
        <hr />
        {noQ && <h3 className="featured-charities text-center">Featured Charities</h3>}
        <ListLoad type="NGO" status="PUBLISHED" q={q || dq} sort="impact" ListItem={CharityCard} unwrapped hideTotal />
    </>;

};

export default MyDataSelectCharity;

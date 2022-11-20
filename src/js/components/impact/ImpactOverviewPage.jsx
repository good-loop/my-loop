
import React, { useEffect } from 'react';
import KStatus from '../../base/data/KStatus';
import { getDataItem, getDataList, setWindowTitle } from '../../base/plumbing/Crud';
import C from '../../C';
import DataStore from '../../base/plumbing/DataStore';
import SearchQuery from '../../base/searchquery';

export class ImpactFilters {
    brand;
    brand2;
    campaign;
    impactdebit;
    start;
    end;
    status;
}

const ImpactOverviewPage = () => {
    /** @type {ImpactFilters} */
    let filters = DataStore.getValue('location','params');
    let status = filters.status || KStatus.PUBLISHED;

    // fetch items
    let pvBrand = filters.brand? getDataItem({type:C.TYPES.Advertiser, id:filters.brand, status}) : {};
    let pvBrand2 = filters.brand2? getDataItem({type:C.TYPES.Advertiser, id:filters.brand2, status}) : {};
    let pvCampaign = filters.campaign? getDataItem({type:C.TYPES.Campaign, id:filters.campaign, status}) : {};
    let brand = pvBrand.value;
    let brand2 = pvBrand2.value;

    // fetch impacts
    let sq = SearchQuery.setProp(null, "vertiser", filters.brand2 || filters.brand);
    let pvImpactList = getDataList({type:C.TYPES.ImpactDebit, status, q:sq.query, start:filters.start, end:filters.end});
    console.log("pvImpactList", pvImpactList, "sq", sq.query);
    return <>
    TODO
    {brand && <h2>{brand.name}</h2>}
    Number of Campaigns
    Charities
    Total £s
    </>;
};


export default ImpactOverviewPage;


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
import { Container } from 'reactstrap';
import PropControl from '../../base/components/PropControl';
import { Card } from '../../base/components/CardAccordion';
import BG from '../../base/components/BG';
import Misc from '../../MiscOverrides';
import { getLogo, uniq } from '../../base/utils/miscutils';
import Branding from '../../base/data/Branding';
import Impact from '../../base/data/Impact';
import Money from '../../base/data/Money';


export class ImpactFilters {
    brand;
    brand2;
    campaign;
    /** charity ID */
    cid;
    impactdebit;
    start;
    end;
    status;
    q;
}

const ImpactHubPage = () => {
    /** @type {ImpactFilters} */
    let filters = DataStore.getValue('location','params');
    if ( ! filters.status) filters.status = KStatus.PUBLISHED;
    let status = filters.status;

    // fetch items
    let pvBrand = filters.brand? getDataItem({type:C.TYPES.Advertiser, id:filters.brand, status}) : {};
    let pvBrand2 = filters.brand2? getDataItem({type:C.TYPES.Advertiser, id:filters.brand2, status}) : {};
    let pvCampaign = filters.campaign? getDataItem({type:C.TYPES.Campaign, id:filters.campaign, status}) : {};
    let brandId = filters.brand2 || filters.brand;
    let brand1 = pvBrand.value;
    let brand2 = pvBrand2.value;
    let brand = filters.brand2? brand2 : brand1; // prefer the child brand
    // HACK - poke q onto the filters
    let sq = SearchQuery.setProp(null, "vertiser", brandId);
    sq = SearchQuery.setProp(sq, "campaign", filters.campaign);
    filters.q = sq.query;

    return <>
        <FilterBar />
        {brand && <h2>{brand.name}</h2>}
        <Card><HeadlineDonationCard brand={brand} filters={filters} /></Card>
    
        <Card><CampaignCountCard filters={filters} /></Card>
        <Card><CharityCountCard filters={filters} /></Card>
        <Card><ViewCountCard filters={filters} /></Card>

        <Card><LogoWallCard brand={brand} filters={filters} /></Card>
    </>;
};


/* ------- Data Functions --------- */

const getImpactDebits = ({filters}) => {
    let pvImpactDebits = getDataList({type:C.TYPES.ImpactDebit, ...filters});
    // console.log("pvImpactDebits", pvImpactDebits);
    return pvImpactDebits;
};

const getCampaigns = ({filters}) => {
    let pvCampaigns = getDataList({type:C.TYPES.Campaign, ...filters});
    // console.log("pvCampaigns", pvCampaigns);
    return pvCampaigns;
};

const getCharities = ({filters}) => {
    // get the ImpactDebits
    let pvItems0 = getImpactDebits({filters});
    // ...then get the charities
    let pvCharities = PromiseValue.then(pvItems0, item0s => {
        let cids = List.hits(item0s).map(i0 => i0.impact?.charity);
        const pv2 = getDataList({type:"NGO", status:filters.status, ids:cids});
        return pv2;
    });
    // console.group("pvCharities", pvCharities);
    return pvCharities;
}

/* ------- End of Data Functions --------- */


/* ------- Components --------- */

const CampaignCountCard = ({filters}) => {
    let pvItems = getCampaigns({filters});
    if ( ! pvItems.value) return <Nope />;
    let n = List.total(pvItems.value);
    return <>
        {I18N.tr(n+" Campaign(s)")}
        {n < 10 && <div>{List.hits(pvItems.value).map(item => item.name)}</div>}
    </>;
}

const CharityCountCard = ({filters}) => {
    let pvItems = getCharities({filters});
    if ( ! pvItems.value) return <Nope />;
    let n = List.total(pvItems.value);
    return <>
        {I18N.tr(n+" Charities (singular: Charity)")}
        {n < 10 && <div>{List.hits(pvItems.value).map(item => item.name)}</div>}
    </>;
}

const ViewCountCard = ({filters}) => {
    return "?? Views";
}

const LogoWallCard = ({filters}) => {
    return "?? logos";
}

const HeadlineDonationCard = ({brand, filters}) => {
    if ( ! brand) {
        return <Misc.Loading />
    }
    let logo = getLogo(brand);
    let branding = Branding.get(brand);
    let image = branding.backgroundImage || "/img/ihub/world-hand.png";

    let pvImpactDebits = getImpactDebits({filters});    
    let moneys = pvImpactDebits.value && List.hits(pvImpactDebits.value).map(item => Impact.amount(item.impact)).filter(x => x);
    let totalMoney = moneys && Money.total(moneys, "GBP");

    return (<><BG image={image} />
        <img className='logo logo-xl' src={logo} />
        {totalMoney && <Misc.Money amount={totalMoney} />} Donated
    </>);
};

/**
 * Filter display / controls at the top of the page
 */
const FilterBar = () => {
    const childBrands = false; // TODO
    return <div id='filterBar'>
        <PropControl type="DataItem" itemType={C.TYPES.Advertiser} prop="brand" label />
        {childBrands && <PropControl type="DataItem" itemType={C.TYPES.Advertiser} prop="brand2" label="Brands" />}
    </div>;
}

const Nope = () => <>-</>;

export default ImpactHubPage;

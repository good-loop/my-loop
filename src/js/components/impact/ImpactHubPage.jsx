
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
import { Col, Container, InputGroup, Row } from 'reactstrap';
import PropControl from '../../base/components/PropControl';
import { Card } from '../../base/components/CardAccordion';
import BG from '../../base/components/BG';
import Misc from '../../MiscOverrides';
import { getLogo, space, uniq } from '../../base/utils/miscutils';
import Branding from '../../base/data/Branding';
import Impact from '../../base/data/Impact';
import Money from '../../base/data/Money';
import { OTHER_CONSENT } from '../../base/data/Claim';


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

    return <Container>
        <FilterBar filters={filters} />
        <Row>
            <Col>
                <Card style={{background:"#3488AB"}}><HeadlineDonationCard brand={brand} filters={filters} /></Card>
            </Col>
            <Col>
                <Card><CampaignCountCard filters={filters} /></Card>

                <Card><CharityCountCard filters={filters} /></Card>
            </Col>
        </Row>
        {/* <Card><ViewCountCard filters={filters} /></Card>
        <Card><LogoWallCard brand={brand} filters={filters} /></Card> */}
    </Container>;
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
        <h3>{I18N.tr(n+" Campaign(s)")}</h3>
        {n < 10 && <div>{List.hits(pvItems.value).map(item => item.name)}</div>}
    </>;
}

const CharityCountCard = ({filters}) => {
    let pvItems = getCharities({filters});
    if ( ! pvItems.value) return <Nope />;
    let n = List.total(pvItems.value);
    return <>
        <h3>{I18N.tr(n+" Charities (singular: Charity)")}</h3>
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

    return (<BG style={{height:'30vh',width:'30vh',margin:"auto"}} image={image} color='#3488AB' >
            <Circle color="white" width="100%" height="100%">                
                <img className='logo logo-xl' src={logo} />
                <h2>{totalMoney && <Misc.Money amount={totalMoney} />} Donated</h2>
            </Circle>
        </BG>);
};

/**
 * Put the childrem in a circle.
 * Do we have something like this already??
 */
const Circle = ({color="white",border="2px solid black",children,width,height,style,className}) => {
    let style2 = Object.assign({width,height,border,borderRadius:"50%",display:"flex", alignItems:"center",justifyContent:"center"}, style);
    return <div style={style2} className={space(color && "bg-"+color, className)}>{children}</div>;
};

/**
 * Filter display / controls at the top of the page
 */
const FilterBar = ({filters}) => {    
    let pvChildBrands, childBrands;
    if (filters.brand) {
        let q = SearchQuery.setProp(null, "parentId", filters.brand).query;
        pvChildBrands = getDataList({type:"Advertiser", status:filters.status, q, swallow:true});
        childBrands = List.hits(pvChildBrands?.value);
    }    
    return <div id='filterBar'>
        <PropControl type="DataItem" itemType={C.TYPES.Advertiser} prop="brand" label showId={false} />
        {childBrands && childBrands.length? <PropControl type="DataItem" itemType={C.TYPES.Advertiser} prop="brand2" label="Brand" list={childBrands} /> : null}
    </div>;
}

const Nope = () => <>-</>;

export default ImpactHubPage;

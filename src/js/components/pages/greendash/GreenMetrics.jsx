import React, { useEffect, useState } from 'react';
import PromiseValue from 'promise-value';
import { Alert, Button, Col, Container, Row } from 'reactstrap';

// import ChartWidget from '../../../base/components/ChartWidget';
import DataStore from '../../../base/plumbing/DataStore';
import printer from '../../../base/utils/printer';
import List from '../../../base/data/List';
import Misc from '../../../base/components/Misc';
import { LoginWidgetEmbed } from '../../../base/components/LoginWidget';
import ErrAlert from '../../../base/components/ErrAlert';

import { GreenCard, periodFromUrl, printPeriod } from './dashutils';
import { getCampaigns, getCarbon, getSumColumn } from './carboncalc';
import { getCampaignsEmissions, getCarbonEmissions, getSumColumnEmissions } from './emissionsCalc';

import GreenDashboardFilters from './GreenDashboardFilters';
import BreakdownCard from './BreakdownCard';
import JourneyCard from './JourneyCard';
import TimeSeriesCard from './TimeSeriesCard';
import TimeSeriesCardEmissions from './TimeSeriesCardEmissions';
import CompareCard from './CompareCard';
import TimeOfDayCard from './TimeOfDayCard';

import { getDataItem, getDataList } from '../../../base/plumbing/Crud';
import C from '../../../C';

import KStatus from '../../../base/data/KStatus';
import SearchQuery from '../../../base/searchquery';
import Campaign from '../../../base/data/Campaign';
import Login from '../../../base/youagain';

import { yessy } from '../../../base/utils/miscutils';
import MapCard from './MapCard';

/**
 * @deprecated
 */
const OverviewWidget = ({ period, data }) => {
  let imps;
  if (data?.length > 1) {
    const total = getSumColumn(data, 'count');
    imps = printer.prettyInt(total);
  } else if (!data) {
    imps = 'Fetching data...';
  } else {
    console.warn('OverviewWidget - Empty total-impressions table', data);
    imps = 'No data';
  }

  return (
    <Row className='greendash-overview mb-2'>
      <Col xs='12'>
        <span className='period mr-4'>{printPeriod(period)}</span>
        <span className='impressions'>
          Impressions served: <span className='impressions-count'>{imps}</span>
        </span>
      </Col>
    </Row>
  );
};

const OverviewWidgetEmissions = ({ period, data }) => {
  let imps;
  if (data?.length >= 1) {
    const total = getSumColumnEmissions(data, 'count');
    imps = printer.prettyInt(total);
  } else if (!data) {
    imps = 'Fetching data...';
  } else {
    console.warn('OverviewWidget - Empty total-impressions table', data);
    imps = 'No data';
  }

  return (
    <Row className='greendash-overview mb-2'>
      <Col xs='12'>
        <span className='period mr-4'>{printPeriod(period)}</span>
        <span className='impressions'>
          Impressions served: <span className='impressions-count'>{imps}</span>
        </span>
      </Col>
    </Row>
  );
};

const CTACard = ({}) => {
  return (
    <GreenCard className='carbon-cta flex-column' downloadable={false}>
      <div className='cta-card-decoration'>
        <img className='tree-side' src='/img/green/tree-light.svg' />
        <img className='tree-centre' src='/img/green/tree-light.svg' />
        <img className='tree-side' src='/img/green/tree-light.svg' />
      </div>
      <p className='mb-2'>Interested to know more about climate positive advertising?</p>
      <a className='get-in-touch pull-right text-right' href='https://www.good-loop.com/contact' target='_blank'>
        <Button color='primary' size='md'>
          Get In Touch
        </Button>
      </a>
    </GreenCard>
  );
};

const GreenMetrics2 = ({}) => {
  // Default to current quarter, all brands, all campaigns
  const period = periodFromUrl();
  if (!period) return; // Filter widget will set this on first render - allow it to update
  const brandId = DataStore.getUrlValue('brand');
  const agencyId = DataStore.getUrlValue('agency');
  const campaignId = DataStore.getUrlValue('campaign');
  const tagId = DataStore.getUrlValue('tag');

  // const { pvBrands, pvCampaigns, pvTags } = getGreenDashObjects(brandId, campaignId, tagId);

  // What are we going to filter on? ("adid" rather than "tag" because that's what we'll search for in DataLog)
  // ??shouldn't brand be vertiser??
  const filterMode = campaignId ? 'campaign' : brandId ? 'brand' : agencyId ? 'agency' : tagId ? 'adid' : null;
  // Get the ID for the object we're filtering for
  const filterId = { campaign: campaignId, brand: brandId, agency: agencyId, adid: tagId }[filterMode];

  if (!filterMode) {
    return <Alert color='info'>Select a brand, campaign, or tag to see data.</Alert>;
  }

  // Fetch common data for CO2Card and BreakdownCard.
  // CompareCard sets its own time periods & TimeOfDayCard sets the timeofday flag, so both need to fetch their own data
  // ...but give them the basic filter spec so they stay in sync otherwise

  // Query filter e.g. which brand, campaign, or tag?
  let q = `${filterMode}:${filterId}`;

  // HACK: filterMode=brand is twice wrong: the data uses vertiser, and some tags dont carry brand info :(
  // So do it by an OR over campaign-ids instead.
  if (filterMode === 'brand') {
    // get the campaigns
    let sq = SearchQuery.setProp(null, 'vertiser', filterId);
    const pvAllCampaigns = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUBLISHED, q: sq.query });
    if (!pvAllCampaigns.resolved) {
      return <Misc.Loading text='Fetching brand campaigns...' />;
    }
    const campaignIds = List.hits(pvAllCampaigns.value).map((c) => c.id);
    if (!yessy(campaignIds)) {
      return <Alert color='info'>No campaigns for brand id: {filterId}</Alert>;
    }
    q = SearchQuery.setPropOr(null, 'campaign', campaignIds).query;
  }
  if (filterMode === 'agency') {
    // copy pasta of brand above
    // get the campaigns
    let sq = SearchQuery.setProp(null, 'agencyId', filterId);
    const pvAllCampaigns = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUBLISHED, q: sq.query });
    if (!pvAllCampaigns.resolved) {
      return <Misc.Loading text='Fetching agency campaigns...' />;
    }
    const campaignIds = List.hits(pvAllCampaigns.value).map((c) => c.id);
    if (!yessy(campaignIds)) {
      return <Alert color='info'>No campaigns for agency id: {filterId}</Alert>;
    }
    q = SearchQuery.setPropOr(null, 'campaign', campaignIds).query;
  }

  // HACK: Is this a master campaign? Do we need to cover sub-campaigns?
  if (filterMode === 'campaign') {
    const pvCampaign = getDataItem({ type: C.TYPES.Campaign, id: campaignId, status: KStatus.PUB_OR_DRAFT });
    if (!pvCampaign.value) {
      return <Misc.Loading text='Fetching campaign...' />;
    }
    const campaign = pvCampaign.value;
    if (Campaign.isMaster(campaign)) {
      const pvAllCampaigns = Campaign.pvSubCampaigns({ campaign });
      if (!pvAllCampaigns.resolved) {
        return <Misc.Loading text='Fetching campaigns...' />;
      }
      const campaignIds = List.hits(pvAllCampaigns.value).map((c) => c.id);
      if (!yessy(campaignIds)) {
        return <Alert color='info'>No campaigns for master campaign id: {filterId}</Alert>;
      }
      q = SearchQuery.setPropOr(null, 'campaign', campaignIds).query;
    }
  }

  const baseFilters = {
    q,
    start: period.start.toISOString(),
    end: period.end.toISOString(),
  };

  const pvChartData = getCarbon({ ...baseFilters, breakdown: ['adid', 'time', 'os', 'total'] });
  const pvChartDataEmissions = getCarbonEmissions({
    ...baseFilters,
    breakdown: [
      'adid{"emissions":"sum"}',
      'time{"emissions":"sum"}',
      'os{"emissions":"sum"}',
      'total{"emissions":"sum"}',
    ],
  });

  console.log(pvChartData, pvChartDataEmissions);

  let pvCampaigns = getCampaigns(pvChartData.value?.tables?.adid);
  let pvCampaignsEmissions = getCampaignsEmissions(pvChartDataEmissions.value?.by_adid.buckets);
  if (pvCampaigns && PromiseValue.isa(pvCampaigns.value)) {
    // HACK unwrap nested PV
    pvCampaigns = pvCampaigns.value;
  }
  if (pvCampaignsEmissions && PromiseValue.isa(pvCampaignsEmissions.value)) {
    // HACK unwrap nested PV
    pvCampaignsEmissions = pvCampaignsEmissions.value;
  }
  let noData = pvChartData.value && !pvChartData.value.tables?.adid?.length;
	let noDataEmissions = pvChartDataEmissions.value && !pvChartDataEmissions.value.allCount;
  // TODO Fall back to filterMode methods to get campaigns when table is empty

  if (!pvChartData.resolved) {
    return <Misc.Loading text='Fetching campaign lifetime data...' />;
  }
  if (!pvChartData.value) {
    return <ErrAlert error={pvChartData.error} color='danger' />;
  }

  const commonProps = { period, baseFilters };
  // Removed (temp?): brands, campaigns, tags

  // HACK: Tell JourneyCard we had an empty table & so couldn't get campaigns (but nothing is "loading")
  // TODO We CAN get campaigns but it'd take more of a rewrite than we want to do just now.
  // not working?? How does this compare to noData
  const emptyTable =
    pvChartData.resolved && (!pvChartData?.value?.tables?.total || pvChartData.value.tables.total.length === 1);
  const emptyTableEmissions =
    pvChartDataEmissions.resolved && (!pvChartDataEmissions?.value?.allCount || pvChartDataEmissions.value.by_total.buckets.length === 0);

  const [emissionsData, SetEmissionsData] = useState(false);

  return <>
	<Button color='secondary' onClick={() => SetEmissionsData(!emissionsData)}>{emissionsData ? 'Emissions' : 'Green'}</Button>
	{emissionsData ? (
    <>
      <OverviewWidgetEmissions period={period} data={pvChartDataEmissions.value?.by_total.buckets} />
      <Row className='card-row'>
        <Col xs='12' sm='8' className='flex-column'>
          <TimeSeriesCardEmissions {...commonProps} data={pvChartDataEmissions.value?.by_time.buckets} noData={noDataEmissions} />
        </Col>
        <Col xs='12' sm='4' className='flex-column'>
          WIP
        </Col>
      </Row>
      <Row className='card-row'>
        <Col xs='12' sm='4' className='flex-column'>
          <CompareCard {...commonProps} />
        </Col>
        <Col xs='12' sm='4' className='flex-column'>
          <BreakdownCard {...commonProps} tables={pvChartData.value?.tables} />
        </Col>
        <Col xs='12' sm='4' className='flex-column'>
          {true ? (
            <>
              <TimeOfDayCard {...commonProps} />
              <MapCard {...commonProps} />
            </>
          ) : (
            <>
              <TimeOfDayCard {...commonProps} />
              <CTACard />
            </>
          )}
        </Col>
      </Row>
    </>
  ) : (
    <>
      <OverviewWidget period={period} data={pvChartData.value?.tables?.total} />
      <Row className='card-row'>
        <Col xs='12' sm='8' className='flex-column'>
          <TimeSeriesCard {...commonProps} data={pvChartData.value?.tables?.time} noData={noData} />
        </Col>
        <Col xs='12' sm='4' className='flex-column'>
          <JourneyCard campaigns={List.hits(pvCampaigns?.value)} {...commonProps} emptyTable={emptyTable || noData} />
        </Col>
      </Row>
      <Row className='card-row'>
        <Col xs='12' sm='4' className='flex-column'>
          <CompareCard {...commonProps} />
        </Col>
        <Col xs='12' sm='4' className='flex-column'>
          <BreakdownCard {...commonProps} tables={pvChartData.value?.tables} />
        </Col>
        <Col xs='12' sm='4' className='flex-column'>
          {true ? (
            <>
              <TimeOfDayCard {...commonProps} />
              <MapCard {...commonProps} />
            </>
          ) : (
            <>
              <TimeOfDayCard {...commonProps} />
              <CTACard />
            </>
          )}
        </Col>
      </Row>
    </>
  )}
	</>
};

const GreenMetrics = ({}) => {
  const [agencyIds, setAgencyIds] = useState();
  let agencyId = DataStore.getUrlValue('agency');
  if (!agencyId && agencyIds?.length === 1) agencyId = agencyIds[0];

  // All our filters etc are based user having at most access to one agency ??how so?
  // Group M users will have multiple, so start by selecting one.
  useEffect(() => {
    Login.getSharedWith().then((res) => {
      if (!res?.cargo) {
        setAgencyIds([]);
        return;
      }
      const _agencyIds = res.cargo
        .map((share) => {
          const matches = share.item.match(/^Agency:(\w+)$/);
          if (!matches) return null;
          return matches[1];
        })
        .filter((a) => a);
      setAgencyIds(_agencyIds);
    });
  }, [Login.getId()]);

  let content;

  if (!Login.isLoggedIn()) {
    // Only for logged-in users!
    content = (
      <div>
        <h3 className='text-center'>Log in to access Green Media</h3>
        <Container>
          <Row>
            <Col xs='12' sm='6' className='mx-auto'>
              <LoginWidgetEmbed verb='login' />
            </Col>
          </Row>
        </Container>
      </div>
    );
  } else if (!agencyIds) {
    content = <Misc.Loading text='Checking your access...' />;
  } else {
    content = (
      <>
        <GreenDashboardFilters />
        <GreenMetrics2 />
      </>
    );
  }

  return (
    <div className='green-subpage green-metrics'>
      <Container fluid>{content}</Container>
    </div>
  );
};

export default GreenMetrics;

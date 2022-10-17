import md5 from 'md5';
import KStatus from '../../../base/data/KStatus';
import { getDataList } from '../../../base/plumbing/Crud';
import { assert } from '../../../base/utils/assert';
import C from '../../../C';
import PromiseValue from 'promise-value';
import List from '../../../base/data/List';
import Impact from '../../../base/data/Impact';
import { encURI } from '../../../base/utils/miscutils';
import Campaign from '../../../base/data/Campaign';
import SearchQuery from '../../../base/searchquery';
import { periodFromUrl } from './dashutils';

/**
 *
 * @param {Object} p
 * @param {string} p.q
 * @param {string} p.start
 * @param {string} p.end
 * @param {string[]} p.breakdown
 * @returns {}
 */
export const getCarbonEmissions = ({ q = '', start = '1 month ago', end = 'now', breakdown, ...rest }) => {
  // assert(!q?.includes('brand:'), q);
  const data = {
    dataspace: 'emissions',
    q,
    start,
    end,
    breakdown,
    ...rest,
  };

  return DataStore.fetch(['misc', 'DataLog', 'green', md5(JSON.stringify(data))], () => {
    // buckets of publisher, impressions, carbon rows
    return ServerIO.load(ServerIO.DATALOG_ENDPOINT, { data, swallow: true });
  }); // /fetch()
};

/**
 *
 * @param {Object[][]} buckets
 * @param {!string} keyName
 * @returns {!number}
 */
export const getSumColumnEmissions = (buckets, keyName) => {
  if (!buckets?.length) {
    console.warn('getSumColumn - no data', buckets, keyName);
    return 0; // no data
  }
  let total = 0;
  for (let i = 0; i < buckets.length; i++) {
    const row = buckets[i];
    const n = row[keyName];
    if (!n) continue;
    total += 1.0 * n;
  }
  return total;
};

/**
 *
 * @param {Object[][]} buckets
 * @returns {Object} {breakdown-key: sum-for-key}
 */
export const getBreakdownByEmissions = (buckets, keyNameToSum, keyNameToBreakdown) => {
  if (!buckets?.length) {
    return {}; // no data
  }

  const bi = keyNameToBreakdown === 'time' ? 'key_as_string' : 'key';

  let totalByX = {};
  for (let i = 0; i < buckets.length; i++) {
    const row = buckets[i];
    const n = row[keyNameToSum];
    if (!n) continue;
    const b = row[bi]; // breakdown key
    let v = totalByX[b] || 0;
    v += n;
    totalByX[b] = v;
  }
  return totalByX;
};

/**
 * Get the GreenTags referenced by the buckets
 * @param {?Object[][]} buckets
 * @returns {?PromiseValue} PV of a List of GreenTags
 */
export const getTags = (buckets) => {
  if (!buckets || !buckets.length) {
    return null;
  }

  const tagIdSet = {};
  const adIdKey = 'key';
  buckets.forEach((row, i) => {
    let adid = row[adIdKey];
    // HACK CaptifyOldMout data is polluted with impressions for adids like `ODCTC5Tu"style="position:absolute;` due to mangled pixels
    adid = adid.match(/[^"]+/); // Fairly safe to assume " won't be found in a normal adid
    if (adid && adid !== 'unset') {
      tagIdSet[adid] = true;
    }
  });

  const ids = Object.keys(tagIdSet);
  if (!ids.length) return null;

  // ??does PUB_OR_DRAFT work properly for `ids`??

  let pvTags = getDataList({ type: C.TYPES.GreenTag, status: KStatus.PUB_OR_DRAFT, ids });

  return pvTags;
};

/**
 *
 * @param {Object[][]} buckets
 * @returns {?PromiseValue} PV of a List of Campaigns
 */
export const getCampaignsEmissions = (buckets) => {
  let pvTags = getTags(buckets);
  if (!pvTags) {
    return null;
  }

  return PromiseValue.then(pvTags, (tags) => {
    let cidSet = {};
    List.hits(tags).forEach((tag) => {
      if (tag && tag.campaign) {
        cidSet[tag.campaign] = true;
      }
    });
    let cids = Object.keys(cidSet);
    let pvcs = getDataList({ type: C.TYPES.Campaign, status: KStatus.PUB_OR_DRAFT, ids: cids });
    // TODO have PromiseValue.then() unwrap nested PromiseValue
    return pvcs;
  });
};

/**
 *
 * @returns {?Impact} null if loading data
 */
export const calculateDynamicOffsetEmissions = ({ campaign, offset, period }) => {
  Campaign.assIsa(campaign);
  if (!Impact.isDynamic(offset)) return offset; // paranoia
  let n;
  // HACK: carbon offset?
  if (Impact.isCarbonOffset(offset)) {
    let sq = SearchQuery.setProp(null, 'campaign', campaign.id);
    if (!period) period = periodFromUrl();
    let pvCarbonData = getCarbonEmissions({
      q: sq.query,
      start: period?.start.toISOString() || '2022-01-01',
      end: period?.end.toISOString() || 'now',
      breakdown: ['total{"emissions":"sum"}'],
    });
    if (!pvCarbonData.value) {
      return null;
    }
    let buckets = pvCarbonData.value.by_total.buckets;
    let totalEmissions = getSumColumnEmissions(buckets, 'co2');
    n = totalEmissions;
  } else {
    // check it is per impression
    if (offset.input) assert(offset.input.substring(0, 'impression'.length) === 'impression', offset);
    // how many impressions?
    let impressions = Campaign.viewcount({ campaign });
    console.log('impressions', impressions, campaign);
    if (!impressions) {
      return null;
    }
    n = impressions * offset.rate;
  }
  // copy and set n
  let snapshotOffset = new Impact(offset);
  snapshotOffset.n = n;
  delete snapshotOffset.rate;
  delete snapshotOffset.input;
  return snapshotOffset;
};

/**
 * @param {Object} p
 * @param {!Campaign} p.campaign If `campaign` is a master, then this function WILL look up sub-campaigns and include them.
 * @param {?Object} p.period {start, end}
 * @returns {Object} {isLoading:boolean, carbon: [], carbonTotal: Number, trees: [], treesTotal:Number, coral: [], pvAllCampaigns }
 */
export const getOffsetsByTypeEmissions = ({ campaign, status, period }) => {
  console.warn('getOffsetsByType', campaign, status, period);
  // Is this a master campaign?
  let pvAllCampaigns = Campaign.pvSubCampaigns({ campaign, status });

  const allFixedOffsets = [];
  if (pvAllCampaigns.value) {
    // for each campaign:
    // - collect offsets
    // - Fixed or dynamic offsets? If dynamic, get impressions
    // - future TODO did it fund eco charities? include those here
    List.hits(pvAllCampaigns.value).forEach((campaign) => {
      let offsets = Campaign.offsets(campaign);
      let fixedOffsets = offsets.map((offset) =>
        Impact.isDynamic(offset) ? calculateDynamicOffsetEmissions({ campaign, offset, period }) : offset
      );
      allFixedOffsets.push(...fixedOffsets);
    });
    console.log('allFixedOffsets', allFixedOffsets);
  }
  const offsets4type = {};
  // HACK - return this too
  offsets4type.pvAllCampaigns = pvAllCampaigns;
  // kgs of CO2
  let co2 = campaign.co2; // manually set for this campaign?
  let carbonOffsets;
  if (!co2) {
    // from offsets inc dynamic
    carbonOffsets = allFixedOffsets.filter((o) => Impact.isCarbonOffset(o));
    co2 = carbonOffsets.reduce((x, offset) => x + offset.n, 0);
  } else {
    // HACK use our default, gold-standard
    carbonOffsets = [new Impact({ charity: 'gold-standard', rate: 1, name: 'carbon offset' })];
  }
  offsets4type.carbon = carbonOffsets;
  offsets4type.carbonTotal = co2;

  // Trees
  offsets4type.trees = allFixedOffsets.filter((o) => o?.name?.substring(0, 4) === 'tree');
  offsets4type.treesTotal = offsets4type.trees.reduce((x, offset) => x + offset.n, 0);

  // coral
  offsets4type.coral = allFixedOffsets.filter((o) => o?.name?.substring(0, 4) === 'coral');
  offsets4type.coralTotal = offsets4type.coral.reduce((x, offset) => x + offset.n, 0);

  let isLoading = !pvAllCampaigns.resolved || allFixedOffsets.includes(null);
  offsets4type.isLoading = isLoading;
  return offsets4type;
};

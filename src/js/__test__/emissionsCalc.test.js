import { getSumColumnEmissions } from '../components/pages/greendash/emissionsCalc';

const testBuckets1 = [
  {
    key: 'unset',
    doc_count: 85517,
    co2supplypath: 74.0136149,
    meta: {},
    co2: 459.2021867014519,
    count: 600406,
    baseco2: 0,
    co2creative: 315.1876915954507,
  },
];

describe('emissionsCalc functions', () => {
  test('getSumColumnEmissions', () => {
    expect(getSumColumnEmissions(testBuckets1, "co2")).toBe(459.2021867014519);
  });
});

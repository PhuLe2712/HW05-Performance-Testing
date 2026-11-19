  import { runWorkflow, assertFixtureCount } from './common.js';
import { markdownReport } from './report.js';

const fixtureRows = 1000;
export const options = {
  scenarios: {
    soak_profile: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: '4m', target: 1 },
        { duration: '10s', target: 5 },
        { duration: '3m50s', target: 5 },
        { duration: '10s', target: 10 },
        { duration: '3m50s', target: 10 },
      ],
      gracefulStop: '10s',
    },
  },
  thresholds: { http_req_failed: ['rate<0.01'], checks: ['rate>0.995'] },
};
export function setup() { assertFixtureCount(fixtureRows); return { minimumRows: fixtureRows }; }
export default function () { runWorkflow(2); }
export function handleSummary(data) { return markdownReport(data, 'reports/soak-summary.md', 'Soak test summary'); }

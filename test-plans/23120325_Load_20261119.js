import { runWorkflow, assertFixtureCount } from './common.js';
import { htmlReport } from './report.js';

const vus = 5;
const iterationsPerVu = 5;
const iterations = vus * iterationsPerVu;
export const options = {
  scenarios: {
    load_profile: {
      executor: 'per-vu-iterations',
      vus,
      iterations: iterationsPerVu,
    },
  },
  thresholds: { http_req_failed: ['rate<0.01'], checks: ['rate>0.995'] },
};
export function setup() { assertFixtureCount(iterations); return { required: iterations }; }
export default function () { runWorkflow(1.5); }
export function handleSummary(data) { return htmlReport(data, 'Load test summary'); }

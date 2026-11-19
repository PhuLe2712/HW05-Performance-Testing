  import { runWorkflow, assertFixtureCount } from './common.js';
import { markdownReport } from './report.js';

const vus = 100;
const iterationsPerVu = 1;
const iterations = vus * iterationsPerVu;
export const options = {
  scenarios: {
    spike_profile: {
      executor: 'per-vu-iterations',
      vus,
      iterations: iterationsPerVu,
    },
  },
  thresholds: { http_req_failed: ['rate<0.01'], checks: ['rate>0.995'] },
};
export function setup() { assertFixtureCount(iterations); return { required: iterations }; }
export default function () { runWorkflow(0); }
export function handleSummary(data) { return markdownReport(data); }

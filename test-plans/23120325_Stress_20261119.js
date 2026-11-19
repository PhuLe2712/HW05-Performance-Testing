import { runWorkflow, assertFixtureCount } from './common.js';
import { jsonReport } from './report.js';

const vus = 20;
const iterationsPerVu = 5;
const iterations = vus * iterationsPerVu;
export const options = {
  scenarios: {
    stress_profile: {
      executor: 'per-vu-iterations',
      vus,
      iterations: iterationsPerVu,
    },
  },
  thresholds: { http_req_failed: ['rate<0.01'], checks: ['rate>0.995'] },
};
export function setup() { assertFixtureCount(iterations); return { required: iterations }; }
export default function () { runWorkflow(0.25); }
export function handleSummary(data) { return jsonReport(data); }

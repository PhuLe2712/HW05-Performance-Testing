# Soak Test Summary — 19/11/2026

- Profile: staged 1 → 5 → 10 VUs for 12 minutes.
- Completed: 939 workflows, 3,756 HTTP requests, 0 interrupted iterations.
- HTTP failures: 0/3,756; checks passed: 7,512/7,512 (100%).
- Whole-run pooled HTTP duration: mean 9.040 ms, p95 19.620 ms, max 225.702 ms.
- At the 10 VU plateau: 2,275 requests, 568 workflows, 9.891 requests/s, p95 20.220 ms.
- Raw data: `../../results/rerun-20261119/soak-rerun-20261119.jsonl`.
- Dashboard: `dashboard/soak/index.html`.

The scenario completed its planned duration. The k6 process remained open because of the web dashboard and was manually stopped afterward, so the CLI exit code was 1. This is not reported as exit 0. Resource samples were not collected for this rerun.
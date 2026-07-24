# AWS Bedrock Cost Calculator

A no-server calculator for planning Amazon Bedrock model-token costs.

It supports editable model pricing and inference regions, either active-user or direct-chat volume inputs, cloud fallback percentage, ordinary and RAG-heavy conversation presets, custom token counts, and monthly/annual cost output.

## Run checks

```bash
npm test
```

The GitHub Actions workflow runs the tests and deploys the static site to GitHub Pages on every push to `main`.

## Pricing caution

Preset values are planning defaults. Confirm current model availability, regional inference mode, and price with AWS before using an estimate for procurement or approval.

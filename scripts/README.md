Razorpay webhook test scripts
=============================

This folder contains a small helper to compute Razorpay webhook signatures and optionally post test payloads to your webhook endpoint.

scripts/razorpay-webhook-test.js
--------------------------------
- Usage:

  node scripts/razorpay-webhook-test.js --secret <your-secret> [--file scripts/sample_razorpay_event.json] [--url https://your-webhook-url]

- Examples:

  # Print signature for the sample payload
  node scripts/razorpay-webhook-test.js --secret mysecret

  # Print signature for a specific file
  node scripts/razorpay-webhook-test.js --secret mysecret --file scripts/sample_razorpay_event.json

  # Post sample payload to your webhook URL (includes x-razorpay-signature header)
  node scripts/razorpay-webhook-test.js --secret mysecret --file scripts/sample_razorpay_event.json --url https://example.com/.netlify/functions/razorpay-webhook

Notes
-----
- This script computes HMAC-SHA256 of the raw JSON body and encodes the digest in base64, which matches Razorpay's signature format.
- When posting to a real webhook endpoint, ensure the endpoint expects the raw JSON body and verifies the `x-razorpay-signature` header accordingly.

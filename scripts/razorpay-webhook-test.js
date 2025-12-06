#!/usr/bin/env node
/*
  Simple Razorpay webhook tester.

  Usage:
    node scripts/razorpay-webhook-test.js --secret <secret> [--file payload.json] [--url https://example.com/webhook]

  If --url is provided the script will POST the raw payload to the URL with the
  computed `x-razorpay-signature` header. Otherwise it just prints the signature
  for the provided payload.
*/

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

function parseArgs() {
  const args = process.argv.slice(2);
  const out = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--secret') { out.secret = args[++i]; }
    else if (a === '--file') { out.file = args[++i]; }
    else if (a === '--url') { out.url = args[++i]; }
    else if (a === '--data') { out.data = args[++i]; }
    else if (a === '--help' || a === '-h') { out.help = true; }
  }
  return out;
}

function usage() {
  console.log('Usage: node scripts/razorpay-webhook-test.js --secret <secret> [--file payload.json] [--url https://example.com/webhook]');
  console.log('Options:');
  console.log('  --secret   Razorpay webhook secret (required)');
  console.log('  --file     Path to JSON file containing the webhook payload (raw body will be used)');
  console.log('  --data     Inline JSON string to use as payload (raw will be used)');
  console.log('  --url      If provided, POST the payload to this URL with the signature header');
}

async function main() {
  const opts = parseArgs();
  if (opts.help || !opts.secret) {
    usage();
    process.exit(opts.help ? 0 : 1);
  }

  let bodyRaw = null;
  if (opts.file) {
    const fp = path.resolve(process.cwd(), opts.file);
    if (!fs.existsSync(fp)) {
      console.error('Payload file not found:', fp);
      process.exit(2);
    }
    bodyRaw = fs.readFileSync(fp, 'utf8');
  } else if (opts.data) {
    bodyRaw = opts.data;
  } else {
    // Default sample event (compact)
    const sample = {
      entity: 'event',
      account_id: 'acc_test',
      event: 'payment.captured',
      contains: ['payment'],
      payload: {
        payment: {
          entity: {
            id: 'pay_test_123',
            amount: 10000,
            currency: 'INR',
            status: 'captured'
          }
        }
      }
    };
    bodyRaw = JSON.stringify(sample);
  }

  // Razorpay expects HMAC-SHA256 of the raw body, base64-encoded
  const hmac = crypto.createHmac('sha256', opts.secret);
  hmac.update(bodyRaw, 'utf8');
  const signature = hmac.digest('base64');

  console.log('Computed x-razorpay-signature:', signature);

  if (opts.url) {
    try {
      console.log('Posting payload to', opts.url);
      const res = await fetch(opts.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-razorpay-signature': signature
        },
        body: bodyRaw
      });

      const text = await res.text();
      console.log('Response status:', res.status);
      console.log('Response body:');
      console.log(text);
    } catch (err) {
      console.error('Error posting to URL:', err);
      process.exit(3);
    }
  }
}

main();

#!/usr/bin/env node
/**
 * Email Configuration Diagnostics
 * Run locally or on Render to validate Brevo setup
 * 
 * Usage:
 *   node diagnose-email.js
 */

import dotenv from 'dotenv';
dotenv.config();

console.log('\n🔍 Email Configuration Diagnostics\n');
console.log('='.repeat(60));

// Check SMTP config
const smtpHost = process.env.SMTP_HOST;
const smtpPort = process.env.SMTP_PORT;
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const fromEmail = process.env.FROM_EMAIL;
const brevoApiKey = process.env.BREVO_API_KEY;

console.log('\n📋 Environment Variables Status:\n');

const checkVar = (name, value, hint = '') => {
  const status = value ? '✅' : '❌';
  const display = value ? (value.length > 20 ? value.substring(0, 20) + '...' : value) : 'NOT SET';
  console.log(`  ${status} ${name.padEnd(25)} ${display} ${hint}`);
};

checkVar('SMTP_HOST', smtpHost, smtpHost === 'smtp-relay.brevo.com' ? '' : smtpHost ? '(custom)' : '');
checkVar('SMTP_PORT', smtpPort, smtpPort ? `(should be 587)` : '');
checkVar('SMTP_USER', smtpUser, smtpUser ? '(masked for security)' : 'required for SMTP');
checkVar('SMTP_PASS', smtpPass, smtpPass ? '(masked for security)' : 'required for SMTP');
checkVar('BREVO_API_KEY', brevoApiKey, brevoApiKey ? '(masked for security)' : 'recommended fallback');
checkVar('FROM_EMAIL', fromEmail, fromEmail ? '(must be verified in Brevo)' : 'required');

console.log('\n' + '='.repeat(60));
console.log('\n🎯 Configuration Summary:\n');

const smtpConfigured = !!(smtpHost && smtpPort && smtpUser && smtpPass);
const apiConfigured = !!brevoApiKey;
const fromSet = !!fromEmail;

console.log(`  SMTP Relay:  ${smtpConfigured ? '✅ Configured' : '❌ Incomplete'}`);
console.log(`  Brevo API:   ${apiConfigured ? '✅ Configured' : '❌ Not Set'}`);
console.log(`  From Email:  ${fromSet ? '✅ Set' : '❌ Missing'}`);

if (!smtpConfigured && !apiConfigured) {
  console.log('\n⚠️  WARNING: No email provider configured!\n');
  console.log('   Actions:');
  console.log('   1. Set BREVO_API_KEY (easiest, most reliable for restricted networks)');
  console.log('   2. OR set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS');
  console.log('   3. Get credentials from: https://app.brevo.com > Settings > SMTP & API\n');
} else if (smtpConfigured && !apiConfigured) {
  console.log('\n⚠️  INFO: SMTP configured but no API fallback.\n');
  console.log('   If SMTP times out, set BREVO_API_KEY for automatic fallback.\n');
} else if (!smtpConfigured && apiConfigured) {
  console.log('\n✅ Brevo API configured. Will use HTTP fallback (no SMTP needed).\n');
} else {
  console.log('\n✅ Both SMTP and API configured. Will try SMTP first, fallback to API.\n');
}

// Test connectivity
console.log('='.repeat(60));
console.log('\n🌐 Testing Connectivity:\n');

if (smtpConfigured) {
  try {
    console.log('  Testing SMTP connection...');
    const nodemailer = await import('nodemailer');
    const transporter = nodemailer.default.createTransport({
      host: smtpHost,
      port: Number(smtpPort),
      secure: false,
      auth: { user: smtpUser, pass: smtpPass },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });

    await transporter.verify();
    console.log('  ✅ SMTP connection successful\n');
  } catch (err) {
    console.log(`  ❌ SMTP connection failed: ${err.message}\n`);
    console.log('     Possible causes:');
    console.log('     - Wrong SMTP credentials');
    console.log('     - SMTP relay not enabled in Brevo account');
    console.log('     - Network blocks outbound to smtp-relay.brevo.com:587');
    console.log('     - Brevo IP/domain restrictions\n');
  }
} else {
  console.log('  ⏭️  SMTP not configured, skipping test.\n');
}

if (apiConfigured) {
  try {
    console.log('  Testing Brevo API key...');
    const res = await fetch('https://api.brevo.com/v3/account', {
      method: 'GET',
      headers: { 'api-key': brevoApiKey },
      timeout: 5000
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`  ✅ Brevo API key valid (Account: ${data.email || 'N/A'})\n`);
    } else {
      console.log(`  ❌ Brevo API returned ${res.status}: ${res.statusText}\n`);
      console.log('     Possible causes:');
      console.log('     - Invalid API key');
      console.log('     - API key not generated yet\n');
    }
  } catch (err) {
    console.log(`  ❌ Brevo API test failed: ${err.message}\n`);
  }
} else {
  console.log('  ⏭️  Brevo API key not set, skipping test.\n');
}

console.log('='.repeat(60));
console.log('\n📝 Next Steps:\n');

if (!smtpConfigured && !apiConfigured) {
  console.log('  1. Go to https://app.brevo.com > Settings > SMTP & API');
  console.log('  2. Copy API Key (v3) and set as BREVO_API_KEY env var');
  console.log('  3. Restart backend service');
  console.log('  4. Re-run this script to verify\n');
} else if (smtpConfigured && !apiConfigured) {
  console.log('  1. Set BREVO_API_KEY in environment as fallback');
  console.log('  2. If SMTP continues timing out, check Brevo account settings');
  console.log('  3. Contact Render support if egress to SMTP is blocked\n');
} else {
  console.log('  1. Send a test email via POST /api/debug/test-email');
  console.log('  2. Check logs for which provider succeeded\n');
}

console.log('='.repeat(60));
console.log('\n');

#!/usr/bin/env node
/**
 * Complete Email Troubleshooting & Testing Script
 * Tests all possible email sending issues
 * 
 * Usage:
 *   cd backend
 *   node test-email-complete.js [recipient-email]
 */

import dotenv from 'dotenv';
import fetch from 'node-fetch';
dotenv.config();

const args = process.argv.slice(2);
const testEmail = args[0] || process.env.DEV_TEST_EMAIL || 'test@example.com';

console.log('\n' + '='.repeat(70));
console.log('🔧 COMPLETE EMAIL TROUBLESHOOTING');
console.log('='.repeat(70));

// 1. Check required environment variables
console.log('\n📋 STEP 1: Environment Variables\n');

const required = {
  'FROM_EMAIL': process.env.FROM_EMAIL,
  'BREVO_API_KEY': process.env.BREVO_API_KEY ? '***' : undefined,
  'SMTP_HOST': process.env.SMTP_HOST,
  'SMTP_PORT': process.env.SMTP_PORT,
  'SMTP_USER': process.env.SMTP_USER ? '***' : undefined,
  'SMTP_PASS': process.env.SMTP_PASS ? '***' : undefined,
};

let allSet = true;
for (const [key, value] of Object.entries(required)) {
  if (value) {
    console.log(`  ✅ ${key} = ${value}`);
  } else {
    console.log(`  ❌ ${key} = NOT SET`);
    allSet = false;
  }
}

if (!process.env.FROM_EMAIL) {
  console.log('\n⚠️  CRITICAL ERROR: FROM_EMAIL is required!');
  console.log('   Add to environment: FROM_EMAIL=your-verified-email@domain.com');
  process.exit(1);
}

if (!process.env.BREVO_API_KEY) {
  console.log('\n⚠️  WARNING: BREVO_API_KEY not set. SMTP must work or emails will fail.');
  console.log('   Recommended: Set BREVO_API_KEY=<your-api-key> for fallback');
}

// 2. Validate FROM_EMAIL format
console.log('\n📋 STEP 2: Sender Email Validation\n');

const fromEmail = process.env.FROM_EMAIL;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (emailRegex.test(fromEmail)) {
  console.log(`  ✅ FROM_EMAIL format valid: ${fromEmail}`);
} else {
  console.log(`  ❌ FROM_EMAIL format invalid: ${fromEmail}`);
  console.log('   Must be in format: name@domain.com');
  process.exit(1);
}

// 3. Test Brevo API Key
console.log('\n📋 STEP 3: Brevo API Key Validation\n');

if (process.env.BREVO_API_KEY) {
  try {
    const res = await fetch('https://api.brevo.com/v3/account', {
      headers: {
        'api-key': process.env.BREVO_API_KEY
      }
    });

    if (res.ok) {
      const data = await res.json();
      console.log(`  ✅ Brevo API key is valid`);
      console.log(`     Account email: ${data.email}`);
    } else {
      console.log(`  ❌ Brevo API key is invalid or expired`);
      console.log(`     Response: ${res.status} ${res.statusText}`);
      const body = await res.text();
      console.log(`     Details: ${body}`);
      process.exit(1);
    }
  } catch (err) {
    console.log(`  ❌ Could not connect to Brevo API: ${err.message}`);
    process.exit(1);
  }
} else {
  console.log(`  ⏭️  BREVO_API_KEY not set, skipping API validation`);
}

// 4. Test Brevo sender verification
console.log('\n📋 STEP 4: Brevo Sender Verification\n');

if (process.env.BREVO_API_KEY) {
  try {
    const res = await fetch('https://api.brevo.com/v3/senders', {
      headers: {
        'api-key': process.env.BREVO_API_KEY
      }
    });

    if (res.ok) {
      const data = await res.json();
      const senders = data.senders || [];
      
      const verified = senders.find(s => s.email === fromEmail && s.isVerified);
      if (verified) {
        console.log(`  ✅ Sender ${fromEmail} is verified in Brevo`);
      } else {
        const exists = senders.find(s => s.email === fromEmail);
        if (exists) {
          console.log(`  ⚠️  Sender ${fromEmail} exists but NOT verified`);
          console.log(`     Status: ${exists.status || 'unknown'}`);
          console.log(`     Action: Verify the email in Brevo console`);
        } else {
          console.log(`  ❌ Sender ${fromEmail} not found in Brevo account`);
          console.log(`     Verified senders: ${senders.map(s => s.email).join(', ')}`);
          console.log(`     Action: Add this email as a verified sender in Brevo`);
        }
      }
    } else {
      console.log(`  ⚠️  Could not verify senders: ${res.status}`);
    }
  } catch (err) {
    console.log(`  ⚠️  Sender check failed: ${err.message}`);
  }
} else {
  console.log(`  ⏭️  BREVO_API_KEY not set, skipping sender verification`);
}

// 5. Send test email
console.log('\n📋 STEP 5: Test Email Send\n');

if (process.env.BREVO_API_KEY) {
  try {
    console.log(`  📤 Sending test email to ${testEmail}...`);
    
    const payload = {
      sender: {
        name: "Manwell Store",
        email: fromEmail
      },
      to: [{
        email: testEmail,
        name: testEmail.split('@')[0]
      }],
      subject: "Manwell Test Email",
      htmlContent: `
        <div style="font-family: Arial; padding: 20px; background: #f5f5f5;">
          <div style="background: white; padding: 30px; border-radius: 8px;">
            <h2>Test Email from Manwell Backend</h2>
            <p>If you received this email, everything is working! ✅</p>
            <p><strong>Sent via:</strong> Brevo API</p>
            <p><strong>From:</strong> ${fromEmail}</p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
        </div>
      `,
      textContent: `Test email from Manwell Backend. Sent via Brevo API.`,
      replyTo: {
        email: fromEmail,
        name: "Manwell Store"
      }
    };

    const res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok) {
      console.log(`  ✅ Email queued successfully!`);
      console.log(`     Message ID: ${data.messageId}`);
      console.log(`     Recipient: ${testEmail}`);
      console.log(`     Should arrive within 1-2 minutes`);
    } else {
      console.log(`  ❌ Email send failed: ${res.status}`);
      console.log(`     Error: ${data.message || data.error || JSON.stringify(data)}`);
      process.exit(1);
    }
  } catch (err) {
    console.log(`  ❌ Email send error: ${err.message}`);
    process.exit(1);
  }
} else {
  console.log(`  ❌ Cannot test: BREVO_API_KEY not set`);
}

// Summary
console.log('\n' + '='.repeat(70));
console.log('✅ DIAGNOSTICS COMPLETE');
console.log('='.repeat(70));

console.log('\n📝 Next Steps:\n');
if (!process.env.FROM_EMAIL) {
  console.log('  1. ❌ Set FROM_EMAIL to a verified sender email address');
} else if (process.env.BREVO_API_KEY) {
  console.log('  1. ✅ Check your inbox (or spam) for test email');
  console.log('  2. ✅ Mark as "Not Spam" if needed');
  console.log('  3. ✅ Try registering a new user on your app');
} else {
  console.log('  1. ⚠️  Add BREVO_API_KEY to environment for reliable email delivery');
  console.log('  2. Get it from: https://app.brevo.com > Settings > SMTP & API');
}

console.log('\n');

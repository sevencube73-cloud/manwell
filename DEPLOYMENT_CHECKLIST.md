# 📋 Deployment Checklist

## Pre-Deployment ✅

### Code Changes

- [x] `config/mail.js` - Brevo SMTP transporter created
- [x] `utils/sendEmail.js` - Rewritten for Brevo SMTP
- [x] Templates created (OTP, verification, orders, password reset)
- [x] All email calls updated in controllers
- [x] Error handling implemented
- [x] Documentation created

### Local Testing

- [ ] Test email sending locally
  ```bash
  node -e "import('./utils/sendEmail.js').then(({ sendEmail }) => sendEmail({ to: 'test@example.com', subject: 'Test', html: '<h1>Test</h1>' }))"
  ```
- [ ] Verify all imports work
- [ ] Check for any syntax errors
- [ ] Verify templates render correctly

---

## Render Deployment Steps

### Step 1: Add Environment Variables

- [ ] Go to Render Dashboard
- [ ] Click your Node.js service
- [ ] Go to "Environment" tab
- [ ] Add these variables:

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=9e068f001@smtp-brevo.com
SMTP_PASS=YOUR_SMTP_KEY_HERE
FROM_EMAIL=no-reply@yourdomain.com
```

- [ ] Verify all variables are entered correctly
- [ ] Save environment variables

### Step 2: Restart Service

- [ ] Click "Manual Restart" button
- [ ] Wait for service to restart (1-2 minutes)
- [ ] Check logs for any errors

### Step 3: Test Email Delivery

- [ ] Test registration flow
  1. Go to signup page
  2. Register with email
  3. Check email for OTP/verification
  4. Verify email arrives within 1-2 seconds
- [ ] Test password reset flow
  1. Click "Forgot Password"
  2. Enter email
  3. Check email for reset link
- [ ] Test order confirmation
  1. Create test order
  2. Verify confirmation email sent
  3. Check Render logs

### Step 4: Verify Logs

In Render Dashboard → Runtime logs, verify:

```
✅ Email sent to user@example.com | Subject: "..." | MessageID: <id>
```

### Step 5: Check Brevo Dashboard

- [ ] Go to Brevo Dashboard
- [ ] Check "Statistics" section
- [ ] Verify emails are being delivered
- [ ] Check delivery rate (should be near 100%)

---

## Post-Deployment Testing

### Email Verification Flow

- [ ] User registration with email
- [ ] OTP email arrives
- [ ] OTP is correct in email
- [ ] User can verify with OTP
- [ ] User can log in after verification

### Password Reset Flow

- [ ] Request password reset
- [ ] Reset email arrives
- [ ] Reset link works
- [ ] Can set new password
- [ ] Can login with new password

### Order Confirmation

- [ ] Create order
- [ ] Order confirmation email sent
- [ ] Email has correct order details
- [ ] Tracking link works

### Email Content Verification

- [ ] HTML renders correctly
- [ ] Images load (if applicable)
- [ ] Links are functional
- [ ] Email looks good on mobile
- [ ] Sender name is "Manwell Store"
- [ ] Signature/footer is correct

---

## Troubleshooting Checklist

### If emails not sending:

- [ ] Check Render environment variables

  - Verify all 5 variables are set
  - Check for typos
  - Verify SMTP_PASS is actual SMTP Key

- [ ] Restart service

  - Click "Manual Restart"
  - Wait for full restart
  - Check logs

- [ ] Check Render logs for errors

  - Look for "Failed to send email"
  - Check error message details
  - Note exact error text

- [ ] Verify network/firewall

  - Check if Render can reach Brevo SMTP
  - Check Brevo server status

- [ ] Test locally
  - Pull latest code
  - Run test email locally
  - Check for different error messages

### If emails arriving in spam:

- [ ] Update `FROM_EMAIL` to verified domain
- [ ] Configure SPF/DKIM in Brevo
- [ ] Add dkim signature
- [ ] Check SPF record
- [ ] Wait 24-48 hours for DNS propagation

### If slow email delivery:

- [ ] Check Brevo dashboard for queue
- [ ] Check Render service CPU usage
- [ ] Monitor Brevo rate limits
- [ ] Check email size (keep <10MB)

---

## Monitoring (Ongoing)

### Daily

- [ ] Check Render logs for errors
- [ ] Monitor email delivery
- [ ] Respond to any failures

### Weekly

- [ ] Check Brevo dashboard statistics
- [ ] Review delivery rates
- [ ] Check bounce rates
- [ ] Monitor spam complaints

### Monthly

- [ ] Review email templates for improvements
- [ ] Update templates if needed
- [ ] Check Brevo account usage
- [ ] Plan for quota upgrades if needed

---

## Rollback Plan (If Issues)

If problems occur and you need to revert:

1. **Keep previous email service configured**

   - Keep Resend API key if still using it
   - Revert `utils/sendEmail.js` to old version

2. **Quick Rollback Steps**

   - Revert function calls to old format
   - Remove Brevo env variables
   - Restart Render service

3. **Time to Rollback:** <5 minutes

---

## Maintenance Tasks

### Initial (First Week)

- [ ] Monitor email delivery closely
- [ ] Test all email flows
- [ ] Gather user feedback
- [ ] Fix any issues

### Ongoing (Monthly)

- [ ] Review email templates
- [ ] Update as needed
- [ ] Monitor Brevo quotas
- [ ] Optimize for better delivery

### Quarterly

- [ ] Audit email configuration
- [ ] Review delivery statistics
- [ ] Update templates if needed
- [ ] Plan SPF/DKIM improvements

---

## Success Indicators ✅

Email system is working correctly when:

- [x] Registration → OTP email arrives in <2 seconds
- [x] Verification → Confirmation email sent
- [x] Order → Order confirmation email sent
- [x] Password Reset → Reset email sent
- [x] All emails are properly formatted
- [x] Render logs show success messages
- [x] No error messages in logs
- [x] Delivery rate >98%
- [x] Bounce rate <1%
- [x] Spam complaint rate 0%

---

## Emergency Contacts

**Brevo Support:** https://www.brevo.com/support/

**Render Support:** https://render.com/support

**Common Issues:**

- SMTP connection: Check host/port/credentials
- Delivery rate: Check sender reputation/SPF/DKIM
- Quota exceeded: Upgrade Brevo plan

---

## Sign-Off

- [ ] Code reviewed and tested locally
- [ ] Environment variables ready
- [ ] Team notified of deployment
- [ ] Deployment complete
- [ ] Testing passed
- [ ] Ready for production

---

**Deployment Date:** ******\_\_\_******

**Deployed By:** ******\_\_\_******

**Status:** ✅ Ready for Production

---

## Quick Commands

### Test email locally:

```bash
node -e "
import('./utils/sendEmail.js').then(({ sendEmail }) => {
  sendEmail({
    to: 'test@example.com',
    subject: 'Test',
    html: '<h1>✅ Works!</h1>'
  }).then(() => console.log('✅ Sent')).catch(e => console.error('❌', e.message))
})
"
```

### Check Render logs:

```bash
# In Render Dashboard → Runtime logs
# Or use Render CLI:
render logs <service-id>
```

### Verify environment:

```bash
# Add this to a test endpoint:
console.log('SMTP_HOST:', process.env.SMTP_HOST);
console.log('SMTP_USER:', process.env.SMTP_USER ? '***' : 'NOT SET');
console.log('FROM_EMAIL:', process.env.FROM_EMAIL);
```

---

**Last Updated:** December 2024  
**Document Version:** 1.0

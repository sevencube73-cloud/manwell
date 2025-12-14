# Brevo SMTP Email Configuration Guide

This guide documents the implementation of Brevo SMTP for email delivery using Nodemailer.

## ✅ Implementation Status

All email functionality has been migrated from Resend to **Brevo SMTP using Nodemailer**.

### Files Updated:

- ✅ `config/mail.js` - Brevo SMTP transporter configuration
- ✅ `utils/sendEmail.js` - Unified email sending function
- ✅ `templates/` - Email templates (OTP, verification, orders, password reset)
- ✅ `controllers/authController.js` - Updated all sendEmail calls
- ✅ `controllers/userController.js` - Updated all sendEmail calls
- ✅ `controllers/orderController.js` - Updated all sendEmail calls
- ✅ `backend/backend/` - Duplicate backend folder also updated

---

## 🔧 Configuration

### Environment Variables Required

Add these to your `.env` file and configure on Render:

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=9e068f001@smtp-brevo.com
SMTP_PASS=YOUR_SMTP_KEY_HERE
FROM_EMAIL=no-reply@yourdomain.com
```

**⚠️ Important:**

- `SMTP_PASS` is your Brevo SMTP Key (NOT your Brevo login password)
- Get this from Brevo Dashboard → SMTP Section
- Use port **587** (NOT 465)
- `secure` is set to `false` for port 587

### Render Deployment

1. Open Render Dashboard
2. Click your Node.js service
3. Go to **Environment**
4. Add the variables above
5. Click **Save**
6. Click **Manual Restart** (critical!)

---

## 📧 Email Functions

### Basic Usage

```javascript
import { sendEmail } from "../utils/sendEmail.js";

await sendEmail({
  to: "user@example.com",
  subject: "Email Subject",
  html: "<h1>Your HTML content here</h1>",
});
```

### Using Templates

#### OTP Verification Email

```javascript
import { sendEmail } from "../utils/sendEmail.js";
import { otpEmailTemplate } from "../templates/otpEmail.js";

const otp = Math.floor(10000 + Math.random() * 90000).toString();
const html = otpEmailTemplate(user.name, otp);

await sendEmail({
  to: user.email,
  subject: "Your Manwell Verification Code",
  html,
});
```

#### Email Verification

```javascript
import { sendEmail } from "../utils/sendEmail.js";
import { verifyEmailTemplate } from "../templates/verifyEmail.js";

const html = verifyEmailTemplate(user.name, verificationToken);

await sendEmail({
  to: user.email,
  subject: "Verify Your Email Address",
  html,
});
```

#### Order Confirmation

```javascript
import { sendEmail } from "../utils/sendEmail.js";
import { orderConfirmationTemplate } from "../templates/orderConfirmation.js";

const trackingUrl = `${process.env.CLIENT_URL}/order/${order._id}/track`;
const html = orderConfirmationTemplate(
  user.name,
  order._id,
  order.total,
  trackingUrl
);

await sendEmail({
  to: user.email,
  subject: "Order Confirmation",
  html,
});
```

#### Password Reset

```javascript
import { sendEmail } from "../utils/sendEmail.js";
import { passwordResetTemplate } from "../templates/passwordReset.js";

const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
const html = passwordResetTemplate(user.name, resetUrl);

await sendEmail({
  to: user.email,
  subject: "Password Reset Request",
  html,
});
```

---

## 📁 File Structure

```
backend/
├── config/
│   └── mail.js                    # Brevo SMTP transporter
├── utils/
│   └── sendEmail.js               # Unified email sending function
├── templates/
│   ├── otpEmail.js                # OTP verification template
│   ├── verifyEmail.js             # Email verification template
│   ├── orderConfirmation.js       # Order confirmation template
│   └── passwordReset.js           # Password reset template
└── controllers/
    ├── authController.js          # Updated with new sendEmail format
    ├── userController.js          # Updated with new sendEmail format
    └── orderController.js         # Updated with new sendEmail format
```

---

## ✅ Testing

### Test Email Script

Create a test file to verify your setup:

```javascript
// test-email.js
import { sendEmail } from "./utils/sendEmail.js";

async function testEmail() {
  try {
    await sendEmail({
      to: "your-email@example.com",
      subject: "Brevo SMTP Test",
      html: "<h1>✅ Brevo is working!</h1><p>If you see this, your email setup is correct.</p>",
    });
    console.log("✅ Test email sent successfully");
  } catch (error) {
    console.error("❌ Test failed:", error.message);
  }
}

testEmail();
```

Run with: `node test-email.js`

**Expected Result:**

- ✅ Email arrives in your inbox
- ✅ No errors in console
- ✅ Sender is "Manwell Store <your-from-email>"

---

## 🔍 Troubleshooting

### Issue: "Authentication failed"

**Solution:** Check that `SMTP_PASS` is your Brevo SMTP Key, not your login password.

### Issue: "Connection refused"

**Solution:**

- Verify `SMTP_HOST=smtp-relay.brevo.com`
- Verify `SMTP_PORT=587`
- Verify `secure=false`

### Issue: Emails not sending on Render

**Solution:**

- Go to Render Dashboard
- Click your service → Environment
- Verify all variables are set
- Click **Manual Restart** (required!)

### Issue: "Email sent but not received"

**Solution:**

- Check spam folder
- Configure SPF/DKIM in Brevo (improves delivery)
- Test with a different email address

---

## 🔐 Email Sender Configuration (Optional but Recommended)

### Setup Custom Domain SPF/DKIM

1. Go to **Brevo Dashboard** → **Senders**
2. Click **Add a Sender**
3. Verify your domain (add SPF and DKIM records)
4. Update `FROM_EMAIL` in environment variables

**SPF Record Example:**

```
v=spf1 include:smtp-relay.brevo.com ~all
```

**DKIM:** Follow Brevo's instructions in the dashboard

This improves email deliverability to inboxes.

---

## 📊 Email Logging

All emails are logged with:

```
✅ Email sent to user@example.com | Subject: "Order Confirmation" | MessageID: <id>
```

Check these logs in:

- **Render:** Runtime logs
- **Local:** Console output with `console.log()`

---

## 🚀 Summary of Changes

| Component              | Before                         | After                              |
| ---------------------- | ------------------------------ | ---------------------------------- |
| **Service**            | Resend API                     | Brevo SMTP                         |
| **Package**            | `resend`                       | `nodemailer`                       |
| **Config**             | `config/email.js`              | `config/mail.js`                   |
| **Function Signature** | `sendEmail(to, subject, html)` | `sendEmail({ to, subject, html })` |
| **Fallback**           | Nodemailer                     | - (direct SMTP)                    |
| **Templates**          | Inline HTML                    | Modular template functions         |
| **Environment**        | `RESEND_API_KEY`               | `SMTP_*` variables                 |

---

## 📝 Quick Reference

### Send Email Template

```javascript
await sendEmail({
  to: "user@example.com",
  subject: "Your Subject",
  html: "<h1>Your HTML</h1>",
});
```

### Error Handling

```javascript
try {
  await sendEmail({ to, subject, html });
  console.log("✅ Email sent");
} catch (error) {
  console.error("❌ Email failed:", error.message);
}
```

### Common Subjects

- "Your Manwell Verification Code" (OTP)
- "Verify Your Email Address" (Link verification)
- "Order Confirmation" (Order receipt)
- "Password Reset Request" (Password reset)

---

## 📞 Support

For issues:

1. Check console logs in Render
2. Verify environment variables on Render
3. Test with `test-email.js`
4. Check Brevo logs in the dashboard
5. Contact Brevo support if SMTP connection fails

---

**Last Updated:** December 2024  
**Status:** ✅ Production Ready

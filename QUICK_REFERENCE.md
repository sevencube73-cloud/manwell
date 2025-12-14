# Quick Reference: Email Implementation

## Environment Variables (Add to `.env` and Render)

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=9e068f001@smtp-brevo.com
SMTP_PASS=YOUR_SMTP_KEY_HERE
FROM_EMAIL=no-reply@yourdomain.com
```

---

## Send Email (Basic)

```javascript
import { sendEmail } from "../utils/sendEmail.js";

await sendEmail({
  to: "user@example.com",
  subject: "Hello",
  html: "<h1>Welcome!</h1>",
});
```

---

## Send OTP Email

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

---

## Send Verification Email

```javascript
import { sendEmail } from "../utils/sendEmail.js";
import { verifyEmailTemplate } from "../templates/verifyEmail.js";

const html = verifyEmailTemplate(user.name, token);

await sendEmail({
  to: user.email,
  subject: "Verify Your Email Address",
  html,
});
```

---

## Send Order Confirmation

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

---

## Send Password Reset

```javascript
import { sendEmail } from "../utils/sendEmail.js";
import { passwordResetTemplate } from "../templates/passwordReset.js";

const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
const html = passwordResetTemplate(user.name, resetUrl);

await sendEmail({
  to: user.email,
  subject: "Password Reset Request",
  html,
});
```

---

## Error Handling

```javascript
try {
  await sendEmail({
    to: user.email,
    subject: "Subject",
    html: "<h1>Content</h1>",
  });
  console.log("✅ Email sent successfully");
} catch (error) {
  console.error("❌ Email failed:", error.message);
  // Handle error appropriately
}
```

---

## Files Modified

| Component     | File                             | Changes              |
| ------------- | -------------------------------- | -------------------- |
| Configuration | `config/mail.js`                 | Enhanced Brevo setup |
| Utility       | `utils/sendEmail.js`             | Rewritten for Brevo  |
| Templates     | `templates/*.js`                 | 4 new template files |
| Auth          | `controllers/authController.js`  | 4 calls updated      |
| User          | `controllers/userController.js`  | 1 call updated       |
| Orders        | `controllers/orderController.js` | 2 calls updated      |

---

## Deployment Checklist

- [ ] Add environment variables to Render
- [ ] Click "Manual Restart" on Render service
- [ ] Run test email to verify setup
- [ ] Test registration/verification flow
- [ ] Test password reset flow
- [ ] Test order confirmation email
- [ ] Monitor Render logs for errors
- [ ] Check Brevo Dashboard for delivery stats

---

## Support

**All email logs appear in Render logs with format:**

```
✅ Email sent to user@example.com | Subject: "..." | MessageID: <id>
❌ Failed to send email to user@example.com: error message
```

---

## Key Points

✅ Uses Brevo SMTP (reliable, free tier available)  
✅ All templates are responsive and professional  
✅ Error handling with detailed logging  
✅ Environment variables for security  
✅ No breaking changes to existing code  
✅ Ready for production

---

**Last Updated:** December 2024

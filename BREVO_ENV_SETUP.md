# Brevo Email Setup for Render Deployment

## Issue

SMTP is timing out when sending emails, and the Brevo API fallback is unavailable.

## Solution

Configure **one or both** of the following email providers in your Render environment:

### Option A: SMTP (Brevo Relay)

Set these environment variables in Render:

```
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-brevo-smtp-login-email@example.com
SMTP_PASS=your-brevo-smtp-api-key
FROM_EMAIL=noreply@yourcompany.com
```

**Where to get these values:**

1. Sign in to [Brevo Console](https://app.brevo.com)
2. Go to **Settings > SMTP & API**
3. Copy your **SMTP Login** (user) and **SMTP Key** (pass)
4. Set `FROM_EMAIL` to a verified sender email address

---

### Option B: Brevo HTTP API (Recommended Fallback)

Set this environment variable in Render:

```
BREVO_API_KEY=your-brevo-v3-api-key
```

**Where to get this value:**

1. Sign in to [Brevo Console](https://app.brevo.com)
2. Go to **Settings > SMTP & API**
3. Copy your **API Key (v3)**

---

## Configuration Priority

The backend uses this priority:

1. **SMTP** (primary) — tries Brevo SMTP relay
2. **Brevo API** (fallback) — if SMTP fails and `BREVO_API_KEY` is set
3. **Error** — if both fail

---

## Verify Configuration

### In Render Console

```bash
# View your environment variables (redacted for security)
printenv | grep -E "SMTP_|BREVO_|FROM_EMAIL"
```

### Via HTTP Endpoints

Once deployed, test these endpoints:

- **Check config status:**

  ```
  GET /api/debug/config
  ```

  Returns: which providers are configured (without exposing sensitive values)

- **Verify SMTP connectivity:**

  ```
  GET /api/debug/verify-smtp
  ```

  Returns: SMTP connection status (succeeds if SMTP credentials are correct)

- **Send test email:**

  ```
  POST /api/debug/test-email
  Content-Type: application/json

  {
    "to": "your-test-email@example.com"
  }
  ```

  Or set `DEV_TEST_EMAIL` env var and call without body.

---

## Troubleshooting

### "Connection timeout" when registering user

- **Cause:** SMTP connection to `smtp-relay.brevo.com:587` is timing out
- **Fix:**
  - Check `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` are set correctly
  - Verify Brevo account has SMTP relay enabled
  - Set `BREVO_API_KEY` as fallback
  - Check if Render has outbound SMTP restrictions (contact Render support)

### "No Brevo API fallback available"

- **Cause:** SMTP failed and `BREVO_API_KEY` is not set
- **Fix:** Add `BREVO_API_KEY` to Render environment variables

### Email arrives from wrong sender

- **Cause:** `FROM_EMAIL` not set or not verified in Brevo
- **Fix:**
  - Set `FROM_EMAIL` to a verified sender address
  - Go to **Brevo Console > Senders** and verify the address if needed

---

## Step-by-Step for Render

1. **Go to your Render dashboard**
2. **Select your backend service**
3. **Click "Environment" tab**
4. **Add these variables:**
   - `SMTP_HOST=smtp-relay.brevo.com`
   - `SMTP_PORT=587`
   - `SMTP_USER=<from Brevo SMTP settings>`
   - `SMTP_PASS=<from Brevo SMTP API key>`
   - `BREVO_API_KEY=<from Brevo API v3 key>` (optional but recommended)
   - `FROM_EMAIL=<verified sender email>`
5. **Save and redeploy**
6. **Test registration** — OTP email should arrive

---

## Testing Locally

```bash
cd backend

# Check config
curl http://localhost:5000/api/debug/config

# Verify SMTP
curl http://localhost:5000/api/debug/verify-smtp

# Send test email
curl -X POST http://localhost:5000/api/debug/test-email \
  -H "Content-Type: application/json" \
  -d '{"to":"your-email@example.com"}'
```

---

## Support

- **Brevo Docs:** https://developers.brevo.com/docs/send-transactional-email
- **Brevo Support:** https://www.brevo.com/help/
- **Render Docs:** https://render.com/docs/environment-variables

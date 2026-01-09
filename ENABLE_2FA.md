# Enabling 2FA for npm Publishing

Your publish failed because npm requires two-factor authentication. Here's how to fix it:

## Step 1: Enable 2FA on Your npm Account

1. Visit: https://www.npmjs.com/settings/teamaffixmb-jake/twofa/enable
2. Choose "Authorization and Publishing" (recommended)
3. Scan the QR code with an authenticator app:
   - Google Authenticator (iOS/Android)
   - Authy (iOS/Android/Desktop)
   - Microsoft Authenticator
   - 1Password
4. Enter the 6-digit code to confirm
5. **Save your recovery codes** in a secure place!

## Step 2: Publish with 2FA

```bash
cd /home/user/projects/global-info-map
npm publish
```

When prompted, enter the 6-digit code from your authenticator app.

## Troubleshooting

### "Invalid OTP"
- Make sure your system time is correct
- Wait for the next code to generate
- Try again with the new code

### "Already logged in"
If you're already logged in but 2FA is newly enabled:
```bash
npm logout
npm login
npm publish
```

## Security Tips

- ✅ Save your recovery codes in a password manager
- ✅ Enable 2FA on GitHub too for consistency
- ✅ Use "Authorization and Publishing" for maximum security
- ❌ Don't share your 2FA codes or recovery codes

## Success!

After enabling 2FA, your publish command should work:

```bash
$ npm publish
npm notice 
npm notice 📦  global-data-screensaver@5.1.0
npm notice === Tarball Details === 
npm notice Publishing to https://registry.npmjs.org/
This operation requires a one-time password.
Enter OTP: ______
+ global-data-screensaver@5.1.0
```

Your package will be live at:
https://www.npmjs.com/package/global-data-screensaver

Users can then install it with:
```bash
npm install -g global-data-screensaver
# or
npx global-data-screensaver
```


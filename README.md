# drite_web
Drite Guide Website

## Partner form email setup

The partner form posts to `/api/partner`, which is implemented as a Cloudflare Pages Function in `functions/api/partner.js`.

Set these environment variables in Cloudflare Pages:

- `RESEND_API_KEY`: your private Resend API key.
- `PARTNER_TO_EMAIL`: `support@driteguide.com`.
- `PARTNER_FROM_EMAIL`: a verified sender, for example `Drite Guide <support@driteguide.com>`.

Do not put the Resend API key in any HTML or JavaScript file.

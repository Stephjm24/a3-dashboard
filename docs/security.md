# Security

How the two experiences are protected, and what to keep in mind when changing them. The security audit of November 2026 checked everything below.

## A3 Workbench (GitHub Pages and the hosted copy)

- **No secrets.** The page has no server, database, login or API keys.
- **Escaped input.** Every value typed into the form, or loaded from `a3.json` or browser storage, is escaped before it is shown.
- **Content Security Policy.** [scripts/pages_site.py](../scripts/pages_site.py) adds a policy to the Pages copy that lets only the page's own script run (by its hash), plus the two PDF libraries. The hosted copy on claude.ai runs inside claude.ai's own sandbox.
- **Pinned libraries.** html2canvas and jsPDF load from cdn.jsdelivr.net with Subresource Integrity hashes.
- **Only two files published.** The Pages workflow publishes `index.html` and `a3.json`, nothing else from the repository.
- **Data.** On Pages, work stays in the person's browser. On the hosted copy, editors save to the page for everyone who can open it. Keep real or sensitive A3s off both.

## A3 Coach app

- **Sign-in.** One-time invite links (256-bit random tokens, 14 days) start a 30-day session. Only SHA-256 hashes of invite and session tokens are stored. The session cookie is `HttpOnly`, `SameSite=Lax` and, in production, `Secure` with the `__Host-` prefix.
- **Who sees what.** Every database query for A3s filters by the signed-in owner ([repository.ts](../src/lib/a3/repository.ts)). Another person's A3 address shows "not found".
- **No admin pages.** Invites are created only from the command line (`npm run invite`), which needs the database address.
- **No public API.** The app has no API routes, so it sends no CORS headers and browsers block cross-site reads. Server Actions reject requests whose `Origin` does not match the site.
- **Rate limits.** [rate-limit.ts](../src/lib/security/rate-limit.ts) limits invite attempts per address, and saves, uploads and new A3s per person. The counters live in memory, so move them to a shared store such as Redis before running more than one instance.
- **Input checks.** Every Server Action validates its input with zod. Uploads are capped at 2 MB, and Excel files are refused if they would unpack beyond 50 MB.
- **Headers.** [next.config.ts](../next.config.ts) sends a Content Security Policy, HSTS, `X-Frame-Options: DENY`, `nosniff`, a same-origin referrer policy and a restrictive permissions policy, and hides `X-Powered-By`.
- **Secrets.** `DATABASE_URL` and `APP_URL` come from the environment. `.env` files are git-ignored and kept out of the Docker image, and `scripts/check.py` fails CI if a key or token is committed.
- **Search engines.** Every page sends `noindex, nofollow` while the app is a private pilot.
- **Personal data requests.** `npm run user-data -- export <email>`, `delete <email> --confirm` and `purge` answer access and erasure requests and remove expired invites and sessions. See [compliance/DATA_RETENTION.md](compliance/DATA_RETENTION.md).
- **Production mode.** The Docker image runs `node server.js` with `NODE_ENV=production`: no dev server, no source maps, no detailed error pages.

## Checks to run after a dependency change

```sh
npm audit
npm outdated
```

`package.json` overrides `effect` and `uuid` to patched versions until Prisma and ExcelJS ship them. Remove each override once its parent package no longer needs it.

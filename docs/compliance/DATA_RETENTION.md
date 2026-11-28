# Data retention, rights requests and breaches

> **Status: DRAFT for review.** Periods marked "proposed" are suggestions for the owner to confirm, not decisions. Do not quote them in the privacy notice until confirmed.

## Retention schedule: A3 Coach

| Data | Table | Current behaviour (implemented) | Proposed rule |
| --- | --- | --- | --- |
| Unused invite (email, times) | `invites` | Expires after 14 days. Removed by `npm run user-data -- purge`. | Run `purge` monthly. |
| Used invite | `invites` | Kept and linked to the account | Delete with the account (the `delete` command does this) |
| Account (email, name) | `users` | Kept until deleted | Until the tester asks, or `[END OF TEST PHASE + X days]` (C6) |
| Session (hashed token) | `sessions` | Ends at sign-out or after 30 days. Expired rows removed at next sign-in or by `purge`. | Run `purge` monthly. |
| A3s and every version | `a3s`, `a3_versions` | Kept until the account is deleted | As the account |
| Coach drafts, turns, raw inputs, reviews | `drafts`, `coaching_turns`, `raw_inputs`, `reviews` | Not written yet (phase 3) | Decide in the phase 3 DPIA |
| Uploaded files | `uploads` | Not stored. Files are read in memory only. | Keep it that way unless a need is shown |
| Rate-limit counters (IP addresses) | memory | Up to 15 minutes, then gone | No change |
| Host logs and backups | host | Not configured yet | `[Record once the host is chosen (C3)]` |

## Answering a rights request

1. **Log it** in the rights log (a private spreadsheet outside this repository: date received, who, what was asked, date answered). Do not store the log in Git.
2. **Check identity.** Reply to the email address held on the account, or ask the operator to confirm. Do not ask for more information than needed.
3. **Respond within one month** of receipt. This can be extended by two further months for complex requests, if the person is told within the first month.
4. **Run the command** with the production `DATABASE_URL`:
   - Access or portability: `npm run user-data -- export person@example.com > export.json`. Send the file securely, then delete your local copy.
   - Erasure: `npm run user-data -- delete person@example.com --confirm`. Tell the person that backup copies remain until `[BACKUP RETENTION]` and are not restored into the live service.
   - Correction: the tester can edit their A3s. A name change can be made with a one-line SQL update, or by sending a new invite to the same address. Accepting it updates the name.
   - Restriction or objection: stop processing by deleting the account's sessions and not issuing new invites. Then discuss.
5. **Workbench:** the operator holds no Workbench data. Tell the person how to clear it in their browser. For the claude.ai copy, delete the A3 or comment on the page itself.
6. **Record the outcome** in the rights log.

## Personal data breaches

A breach is any loss, unauthorised access, disclosure or alteration of personal data, for example a leaked `DATABASE_URL`, a tester seeing another tester's A3, or a lost device with an export file.

1. **Contain:** rotate `DATABASE_URL` credentials, sign everyone out (`DELETE FROM sessions;`), take the app offline if needed.
2. **Assess** within 24 hours: what data, how many people, likely harm.
3. **Report to the ICO within 72 hours** of becoming aware, unless the breach is unlikely to result in a risk to people's rights and freedoms: https://ico.org.uk/for-organisations/report-a-breach/
4. **Tell affected testers** without undue delay if the risk to them is high.
5. **Record** every breach, including ones not reported, with facts, effects and remedial action (UK GDPR Article 33(5)).

Decision-maker: `[NAME OR ROLE]`. If the operator is an employer, follow its own incident process first and inform its data protection lead.

Security vulnerabilities reported by others: see [SECURITY.md](../../SECURITY.md).

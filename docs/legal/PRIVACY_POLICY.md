# Privacy notice: A3 Coach and A3 Workbench

> **Status: DRAFT for review. Not approved and not published.**
> Square-bracketed items such as `[OPERATOR NAME]` are facts the operator must supply. Items marked **(legal review)** need checking by someone qualified in UK data protection law before this notice is used. Do not add retention periods, recipients or purposes that have not been confirmed.
>
> The in-app copy is [src/app/privacy/page.tsx](../../src/app/privacy/page.tsx), served at `/privacy`. Keep the two in step. The Workbench explains its storage on its own Home page.

Last updated: `[DATE OF APPROVAL]`

This notice explains what personal data the A3 tools hold, why, and what you can do about it. It covers two separate tools:

- **A3 Coach**, the invite-only web app where each tester signs in and keeps their own A3s.
- **A3 Workbench**, a single public web page on GitHub Pages that keeps everything in your own browser.

Both are proofs of concept for a small group of invited testers. Please use synthetic or made-up examples. Do not enter patient information, other special category data or anything confidential.

## Who is responsible for your data

The controller is `[OPERATOR NAME: the person or organisation that runs A3 Coach for testers, for example the employer if it is run as work]`, `[POSTAL ADDRESS]`.

Contact for privacy questions and requests: `[PRIVACY CONTACT EMAIL]`.

`[If the controller is an organisation with a Data Protection Officer: DPO NAME AND CONTACT]`

`[ICO REGISTRATION NUMBER, if the controller is registered or has to pay the data protection fee]` **(legal review: whether the fee applies)**

## A3 Coach (the sign-in app)

### What we hold and why

| Data | Where it comes from | Why it is needed | Kept for |
| --- | --- | --- | --- |
| Your email address | The operator, when creating your invite | To create your one-time invite and match you to your account | While your account exists. An unused invite is deleted after it expires (14 days). |
| Your name | You, when you accept the invite | Shown as the owner of your A3s and at the top of My A3s | While your account exists |
| When your account and invites were created and used | The app | To show the invite was used once and to keep the account record | While your account exists |
| A sign-in session (a random token, stored only as a one-way hash, with its start and expiry time) | The app, when you sign in | To keep you signed in | Until you sign out or 30 days pass, whichever comes first |
| Your A3s: titles, text, numbers, the names and roles of any team members or mentor you type in, and every saved version | You | This is the service: writing, saving and reviewing your A3s | Until you or the operator delete them, or your account is deleted |
| Numbers you import from a CSV or Excel file | You | To add metric history to an A3 | As part of the A3. The file itself is read in memory and not stored. |
| Your IP address, held in server memory only | Your browser | To limit repeated sign-in attempts | Up to 15 minutes. Not written to the database. |
| Web server logs, which may include IP addresses, times and pages requested | Your browser, via the hosting provider | To run, secure and troubleshoot the service | `[HOSTING PROVIDER LOG RETENTION, to confirm once a host is chosen]` |

We do not use analytics, advertising, tracking pixels or social media plugins. The app does not send email. Invite links are passed to testers by the operator directly.

**Other people named in an A3.** If you add team members or a mentor, their names and roles are stored in your A3. Only add people who know they are named, and use roles rather than names where that is enough.

### Our lawful basis **(legal review)**

We rely on **legitimate interests** (UK GDPR Article 6(1)(f)): running a small, invite-only test of an A3 problem-solving tool and keeping it secure. Signing in and storing your A3s is what you asked for when you accepted the invite. We do not rely on consent, so there is no consent box.

`[If testers are the operator's employees or contractors and testing is part of their work, confirm whether "legitimate interests" or another basis fits, and record a legitimate interests assessment.]`

### Cookies and similar technologies

A3 Coach sets one cookie:

| Name | Purpose | Type | Duration |
| --- | --- | --- | --- |
| `__Host-a3_session` (`a3_session` on a local development copy) | Keeps you signed in. It holds a random token only. | Strictly necessary | 30 days, or until you sign out |

Because this cookie is strictly necessary to provide the sign-in you asked for, no consent banner is needed under the Privacy and Electronic Communications Regulations (regulation 6(4)). The app sets no other cookies and uses no browser storage. Fonts are served from the app itself, not from a third party.

### Who else can see it

- **Hosting.** `[HOSTING PROVIDER NAME AND COUNTRY: not yet chosen. The plan is a temporary container host such as Render with test data, then Microsoft Azure.]` hosts the app and its PostgreSQL database and processes the data on our behalf under its data processing terms.
- **Nobody else.** Each tester sees only their own A3s. There are no admin pages. The operator can reach the database directly to create invites and answer requests like the ones below.

### International transfers **(legal review)**

`[State where the app and database are hosted. If outside the UK, name the transfer mechanism, for example UK adequacy regulations for the EEA, or the UK International Data Transfer Addendum or the UK Extension to the EU–US Data Privacy Framework for a US provider.]`

### Planned AI coach

A later phase plans an AI coach that sends what you type in the coach chat and the A3 being worked on to a large language model (Claude, from Anthropic, through its API first and possibly Microsoft Foundry later). **This is not built and nothing is sent to any AI service today.** This notice will be updated, and testers told, before it is switched on.

## A3 Workbench (the public page)

- **Where your work is kept.** Everything you type is saved in your own browser's local storage on that device (keys beginning `a3wb-`). It is not sent to us or anyone else, and we cannot see it. It stays until you delete the A3 or clear your browser's site data. On a shared computer the next person can see it.
- **Cookies.** The Workbench sets no cookies. Its local storage is needed for the page to remember your work and view, which you asked for, so no consent banner is needed.
- **PDF download.** The first time you choose Download PDF, the page fetches two open-source libraries (html2canvas and jsPDF) from cdn.jsdelivr.net. jsDelivr receives your IP address and browser details, as with any web request, but not your A3.
- **Hosting.** GitHub Pages serves the page. GitHub receives your IP address and request details when you open it. See GitHub's privacy statement: https://docs.github.com/site-policy/privacy-policies/github-general-privacy-statement
- **Hosted copy on claude.ai.** The operator may also share a copy on claude.ai. There, A3s and comments are saved to the shared page and visible to everyone it is shared with, and Anthropic hosts that data under claude.ai's terms. `[Confirm whether the hosted copy is still in use.]`

## Your rights

You can ask us to:

- give you a copy of your data (access), including in a machine-readable form (portability)
- correct it (you can also edit your name or A3s yourself)
- delete it, including your whole account and every version of your A3s
- restrict or object to how we use it

Email `[PRIVACY CONTACT EMAIL]`. We will reply within one month. We may need to check it is you, for example by replying to the email address on your account.

When we delete your account, your data is removed from the live database straight away. Copies in the hosting provider's backups are removed when those backups expire, `[BACKUP RETENTION PERIOD, to confirm]`.

For the Workbench we hold nothing to delete: clear it yourself by deleting each A3 or clearing your browser's site data for `stephjm24.github.io`.

## Complaints

If you are unhappy with how we have used your data, please contact us first. You can also complain to the Information Commissioner's Office: https://ico.org.uk/make-a-complaint/ or 0303 123 1113.

## Changes to this notice

We will update this notice before any change to what we collect or who we share it with, including before the AI coach is turned on, and tell testers by `[HOW TESTERS WILL BE TOLD, for example email from the operator]`.

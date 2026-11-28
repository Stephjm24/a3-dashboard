import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = { title: "Privacy notice · A3 Coach" };

// In-app copy of docs/legal/PRIVACY_POLICY.md. Keep the two in step. Square
// brackets mark facts the operator has not yet confirmed: replace them, and
// remove the draft banner, only once the notice has been approved.
export default function PrivacyPage() {
  return (
    <article className="mx-auto w-full max-w-3xl px-6 py-10 text-sm leading-6 text-slate-800">
      <p className="mb-6 rounded-md border border-amber-300 bg-amber-50 px-4 py-3 text-amber-900">
        <strong>Draft for review.</strong> This notice has not been approved yet. Items in square brackets are still to be
        confirmed by the operator.
      </p>
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Privacy notice</h1>
      <p className="mt-2">
        A3 Coach is a proof of concept for a small group of invited testers. Please use synthetic or made-up examples. Do
        not enter patient information, other sensitive personal data or anything confidential.
      </p>

      <H2>Who is responsible for your data</H2>
      <p>
        The controller is [OPERATOR NAME], [POSTAL ADDRESS]. For privacy questions and requests, email [PRIVACY CONTACT
        EMAIL].
      </p>

      <H2>What we hold and why</H2>
      <div className="overflow-x-auto" tabIndex={0} role="region" aria-label="What we hold and why">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-slate-300">
              <Th>Data</Th>
              <Th>Why it is needed</Th>
              <Th>Kept for</Th>
            </tr>
          </thead>
          <tbody>
            <Row data="Your email address" why="To create your one-time invite and match you to your account" kept="While your account exists. An unused invite is deleted after it expires (14 days)." />
            <Row data="Your name" why="Shown as the owner of your A3s" kept="While your account exists" />
            <Row data="When your account and invites were created and used" why="To show the invite was used once" kept="While your account exists" />
            <Row data="A sign-in session (a random token, stored only as a one-way hash)" why="To keep you signed in" kept="Until you sign out or 30 days pass" />
            <Row
              data="Your A3s, including any team member or mentor names you type in, and every saved version"
              why="This is the service: writing, saving and reviewing your A3s"
              kept="Until you or the operator delete them, or your account is deleted"
            />
            <Row data="Numbers you import from a CSV or Excel file" why="To add metric history to an A3" kept="As part of the A3. The file itself is not stored." />
            <Row data="Your IP address, in server memory only" why="To limit repeated sign-in attempts" kept="Up to 15 minutes" />
            <Row data="Web server logs, which may include IP addresses" why="To run, secure and troubleshoot the service" kept="[HOSTING PROVIDER LOG RETENTION]" />
          </tbody>
        </table>
      </div>
      <p className="mt-3">
        We do not use analytics, advertising or tracking. The app does not send email. If you name other people in an A3,
        only add people who know they are named, and use roles rather than names where that is enough.
      </p>

      <H2>Our lawful basis</H2>
      <p>
        We rely on legitimate interests: running a small, invite-only test of an A3 tool and keeping it secure. Signing in
        and storing your A3s is what you asked for when you accepted the invite, so we do not ask for consent.
      </p>

      <H2>Cookies</H2>
      <p>
        A3 Coach sets one strictly necessary cookie, <code>__Host-a3_session</code>, which keeps you signed in for up to 30
        days or until you sign out. It holds a random token only. Because it is needed for the sign-in you asked for, there
        is no cookie banner. The app sets no other cookies, uses no browser storage and loads nothing from other sites.
      </p>

      <H2>Who else can see it</H2>
      <p>
        [HOSTING PROVIDER NAME AND COUNTRY] hosts the app and its database on our behalf. Each tester sees only their own
        A3s. The operator can reach the database directly to create invites and answer requests. [INTERNATIONAL TRANSFER
        DETAILS, if the host is outside the UK.]
      </p>

      <H2>Planned AI coach</H2>
      <p>
        A later phase plans an AI coach that would send your coach chat and A3 to an AI model (Claude, from Anthropic). It is
        not built, and nothing is sent to any AI service today. We will update this notice and tell testers before it is
        switched on.
      </p>

      <H2>Your rights</H2>
      <p>
        You can ask for a copy of your data, to correct it, to delete it (including your whole account and every version of
        your A3s), or to restrict or object to how we use it. Email [PRIVACY CONTACT EMAIL] and we will reply within one
        month. Deleting your account removes it from the live database straight away. Copies in the host&apos;s backups are
        removed when those backups expire, [BACKUP RETENTION PERIOD].
      </p>

      <H2>Complaints</H2>
      <p>
        Please contact us first. You can also complain to the Information Commissioner&apos;s Office at{" "}
        <a href="https://ico.org.uk/make-a-complaint/" className="font-medium text-blue-700 underline underline-offset-2">
          ico.org.uk/make-a-complaint
        </a>{" "}
        or on 0303 123 1113.
      </p>

      <p className="mt-8 text-xs text-slate-600">Last updated: [DATE OF APPROVAL]</p>
    </article>
  );
}

function H2({ children }: { children: ReactNode }) {
  return <h2 className="mt-8 mb-2 text-base font-semibold text-slate-900">{children}</h2>;
}

function Th({ children }: { children: ReactNode }) {
  return <th className="py-2 pr-4 font-semibold text-slate-900">{children}</th>;
}

function Row({ data, why, kept }: { data: string; why: string; kept: string }) {
  return (
    <tr className="border-b border-slate-200 align-top">
      <td className="py-2 pr-4">{data}</td>
      <td className="py-2 pr-4">{why}</td>
      <td className="py-2 pr-4">{kept}</td>
    </tr>
  );
}

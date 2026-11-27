import Link from "next/link";

export default function Home() {
  return (
    <div className="mx-auto flex w-full max-w-xl flex-1 flex-col justify-center gap-6 px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">A3 Coach</h1>
      <p className="text-slate-700">
        Describe a problem in your own words. A coach guides you through A3 thinking, one section at a time, and
        builds the A3 with you. You decide what goes in.
      </p>
      <div className="rounded-lg border border-slate-200 bg-white p-5 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Signing in</p>
        <p className="mt-1">
          Open the invite link you were sent. If you are already signed in, go to{" "}
          <Link href="/a3" className="font-medium text-blue-700 underline underline-offset-2">
            My A3s
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

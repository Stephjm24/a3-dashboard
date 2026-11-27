import { signOut } from "@/app/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button type="submit" className="text-sm text-slate-600 underline-offset-2 hover:underline">
        Sign out
      </button>
    </form>
  );
}

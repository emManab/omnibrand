import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/store/auth";
import { supabaseEnabled } from "@/lib/supabase";

export function LoginPage() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "in") await signIn(email, password);
      else await signUp(email, password, fullName || email.split("@")[0]);
      navigate("/account");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="font-display text-3xl font-semibold">
        {mode === "in" ? "Sign in" : "Create an account"}
      </h1>
      <p className="mt-2 text-sm text-muted">
        {supabaseEnabled
          ? "Accounts live in your Supabase project."
          : "Local demo mode. Admin: admin@calcuttapress.com / admin123"}
      </p>
      <form onSubmit={submit} className="mt-6 grid gap-3">
        {mode === "up" && (
          <input
            required
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="rounded-xl border border-line px-3 py-2.5"
          />
        )}
        <input
          required
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-line px-3 py-2.5"
        />
        <input
          required
          type="password"
          minLength={6}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-line px-3 py-2.5"
        />
        <button
          disabled={busy}
          className="rounded-full bg-brand py-2.5 text-sm font-semibold text-white"
        >
          {busy ? "Please wait…" : mode === "in" ? "Sign in" : "Create account"}
        </button>
      </form>
      <button
        className="mt-4 text-sm text-brand"
        onClick={() => setMode(mode === "in" ? "up" : "in")}
      >
        {mode === "in" ? "Need an account?" : "Already have an account?"}
      </button>
      <p className="mt-8 text-sm">
        <Link to="/admin" className="text-muted hover:text-ink">
          Production desk
        </Link>
      </p>
    </div>
  );
}

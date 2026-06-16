"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { loginSchema, type LoginInput } from "@/lib/validation/auth";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";

type Banner = { kind: "error"; message: string } | null;

/**
 * Admin login (login spec). Binds to the shared `loginSchema` (same as the server route),
 * posts to /api/auth/login, and reflects the returned state:
 *  - 401 → generic banner (no account-existence disclosure, FR-AUTH-002).
 *  - 429 → lockout banner (FR-AUTH-016).
 *  - 200 → full redirect to the intended path, or to forced change-password (FR-AUTH-012).
 */
export function LoginForm({ next }: { next: string }) {
  const [banner, setBanner] = React.useState<Banner>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: LoginInput) {
    setBanner(null);

    if (typeof navigator !== "undefined" && !navigator.cookieEnabled) {
      setBanner({
        kind: "error",
        message:
          "Cookies are required to sign in. Enable them in your browser and try again.",
      });
      return;
    }

    let res: Response;
    try {
      res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
    } catch {
      setBanner({
        kind: "error",
        message: "Can't reach the server — check your connection and try again.",
      });
      return;
    }

    if (res.ok) {
      const data = (await res.json().catch(() => ({}))) as {
        must_change_password?: boolean;
      };
      const target = data.must_change_password
        ? `/admin/change-password?next=${encodeURIComponent(next)}`
        : next;
      // Full navigation so the server components re-render with the new session cookie.
      window.location.assign(target);
      return;
    }

    if (res.status === 429) {
      setBanner({
        kind: "error",
        message: "Too many attempts. Please try again in about 15 minutes.",
      });
      return;
    }

    // 401 (and any other failure) → generic message, never per-field.
    setBanner({ kind: "error", message: "Invalid email or password." });
  }

  const submitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        {banner && (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive"
          >
            {banner.message}
          </div>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  autoComplete="username"
                  autoFocus
                  placeholder="you@zakirenterprise.com"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    disabled={submitting}
                    className="pr-10"
                    {...field}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="mt-1 w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Signing in…" : "Sign in"}
        </Button>
      </form>
    </Form>
  );
}

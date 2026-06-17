"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";

import { submitPasswordChange } from "@/app/admin/account/actions";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { useToast } from "@/src/components/ui/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form";
import {
  PasswordChecklist,
  passwordMeetsPolicy,
} from "./password-checklist";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password."),
    newPassword: z.string().min(1, "Enter a new password."),
    confirmPassword: z.string().min(1, "Re-enter the new password."),
  })
  .superRefine((data, ctx) => {
    if (!passwordMeetsPolicy(data.newPassword)) {
      ctx.addIssue({
        path: ["newPassword"],
        code: z.ZodIssueCode.custom,
        message: "Choose a stronger password.",
      });
    }
    if (data.confirmPassword && data.confirmPassword !== data.newPassword) {
      ctx.addIssue({
        path: ["confirmPassword"],
        code: z.ZodIssueCode.custom,
        message: "Passwords don't match.",
      });
    }
  });

type FormValues = z.infer<typeof formSchema>;

function ToggleEye({
  show,
  onToggle,
}: {
  show: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      tabIndex={-1}
      aria-label={show ? "Hide password" : "Show password"}
      className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  );
}

/**
 * Change password in forced (`must_change_password`, FR-AUTH-012) or voluntary
 * (FR-AUTH-010) mode. Enforces the §12 policy client-side (same rule as the server),
 * confirms the match, and on success the server revokes the user's other sessions while
 * keeping the current one (BR-6).
 */
export function ChangePasswordForm({
  forced,
  next,
}: {
  forced: boolean;
  next: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [banner, setBanner] = React.useState<string | null>(null);
  const [showCurrent, setShowCurrent] = React.useState(false);
  const [showNew, setShowNew] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { currentPassword: "", newPassword: "", confirmPassword: "" },
  });

  const newPasswordValue = form.watch("newPassword");
  const submitting = form.formState.isSubmitting;

  async function onSubmit(values: FormValues) {
    setBanner(null);
    let result;
    try {
      result = await submitPasswordChange({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
    } catch {
      setBanner("Can't reach the server — please try again.");
      return;
    }

    if (result.ok) {
      toast({
        variant: "success",
        title: "Password updated",
        description: "Your other devices have been signed out.",
      });
      if (forced) {
        window.location.assign(next);
      } else {
        router.push("/admin/account");
        router.refresh();
      }
      return;
    }

    if (result.reason === "invalid_current") {
      form.setError("currentPassword", {
        message: "That password is incorrect.",
      });
    } else if (result.reason === "unauthorized") {
      window.location.assign("/admin/login");
    } else {
      setBanner(result.messages?.[0] ?? "Choose a stronger password.");
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-4"
        noValidate
      >
        {forced && (
          <div className="rounded-md border border-border bg-secondary/60 px-3 py-2 text-[13px] text-foreground">
            For security, set a new password before continuing.
          </div>
        )}
        {banner && (
          <div
            role="alert"
            className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-[13px] font-medium text-destructive"
          >
            {banner}
          </div>
        )}

        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showCurrent ? "text" : "password"}
                    autoComplete="current-password"
                    autoFocus
                    disabled={submitting}
                    className="pr-10"
                    {...field}
                  />
                  <ToggleEye show={showCurrent} onToggle={() => setShowCurrent((s) => !s)} />
                </div>
              </FormControl>
              {forced && (
                <FormDescription>
                  The password you just signed in with.
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New password</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    type={showNew ? "text" : "password"}
                    autoComplete="new-password"
                    disabled={submitting}
                    className="pr-10"
                    {...field}
                  />
                  <ToggleEye show={showNew} onToggle={() => setShowNew((s) => !s)} />
                </div>
              </FormControl>
              <PasswordChecklist value={newPasswordValue} />
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Confirm new password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  autoComplete="new-password"
                  disabled={submitting}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <p className="text-[13px] text-muted-foreground">
          Updating your password signs you out of your other devices.
        </p>

        <Button type="submit" className="w-full" disabled={submitting}>
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Updating…" : "Update password"}
        </Button>
      </form>
    </Form>
  );
}

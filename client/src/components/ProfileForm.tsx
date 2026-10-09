"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch, ApiError, toFieldErrors } from "@/lib/api";
import FormField from "@/components/FormField";

type UserResponse = {
  user: {
    email: string;
    full_name: string | null;
    phone: string | null;
  };
};

type Message = { type: "success" | "error"; text: string } | null;

export default function ProfileForm() {
  const { getToken } = useAuth();
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<UserResponse>("/api/users/me", token);
        if (cancelled) return;
        setEmail(data.user.email);
        setFullName(data.user.full_name ?? "");
        setPhone(data.user.phone ?? "");
      } catch {
        if (!cancelled)
          setMessage({ type: "error", text: "Could not load your profile." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [getToken]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setErrors({});

    try {
      const token = await getToken();
      await apiFetch("/api/users/me", token, {
        method: "PUT",
        body: JSON.stringify({ fullName, phone }),
      });
      setMessage({ type: "success", text: "Profile saved." });
    } catch (err) {
      if (err instanceof ApiError) {
        setErrors(toFieldErrors(err.details));
        setMessage({ type: "error", text: err.message });
      } else {
        setMessage({ type: "error", text: "Something went wrong. Try again." });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-gray-500">Loading profile...</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField label="Email" name="email" value={email} readOnly hint="Managed by your account settings" />
      <FormField label="Full name" name="fullName" value={fullName} onChange={setFullName} error={errors.fullName} placeholder="Your full name" />
      <FormField label="Phone number" name="phone" value={phone} onChange={setPhone} error={errors.phone} placeholder="+919876543210" type="tel" />

      {message && (
        <p className={`text-sm ${message.type === "success" ? "text-green-700" : "text-red-600"}`}>
          {message.text}
        </p>
      )}

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-black px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "Saving..." : "Save changes"}
      </button>
    </form>
  );
}
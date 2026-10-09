"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@clerk/nextjs";
import { completeOnboarding } from "./_actions";

type Role = "rider" | "driver";

const options: { role: Role; title: string; text: string }[] = [
    { role: "rider", title: "I need a ride", text: "Book cabs & track your trips." },
    { role: "driver", title: "I want to drive", text: "Accept rides and earn money."}
];

export default function OnboardingPage() {
    const { user } = useUser();
    const { getToken } = useAuth();
    const router = useRouter();
    const [ loading, setLoading ] = useState<Role | null>(null);
    const [ error, setError ] = useState("");

    async function choose(role: Role) {
        setLoading(role);
        setError("");
        
        const res = await completeOnboarding(role);

        if ("error" in res && res.error) {
            setError(res.error);
            setLoading(null);
            return;
        }

        await user?.reload();

        await getToken({ skipCache: true });

        router.push(`/${role}`);
        router.refresh();
    }

    return (
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-2xl flex-col items-center justify-center gap-6 px-4">
            <h1 className="text-2xl font-bold">How will you use Cab Booking App?</h1>
            <p className="text-gray-600">This choice cannot be changed later.</p>

            <div className="grid w-full gap-4 sm:grid-cols-2">
                {options.map((o) => (
                <button
                    key={o.role}
                    onClick={() => choose(o.role)}
                    disabled={loading !== null}
                    className="rounded-xl border p-6 text-left transition hover:border-black disabled:opacity-50"
                >
                    <h2 className="text-lg font-semibold">
                    {loading === o.role ? "Saving..." : o.title}
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">{o.text}</p>
                </button>
                ))}
            </div>

            {error && <p className="text-sm text-red-600">{error}</p>}
        </main>
    );
}
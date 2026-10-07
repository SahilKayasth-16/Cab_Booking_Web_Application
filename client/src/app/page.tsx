import { Suspense } from "react";

type Health = {
  status: string;
  db: string;
};

async function getHealth(): Promise<Health> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/health`, {
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return { status: "error", db: "unreachable" };
  }
}

async function HealthBadge() {
  const health = await getHealth();
  const ok = health.status === "ok";

  return (
    <div
      className={`rounded-lg px-4 py-2 text-sm font-medium ${
        ok ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      API: {health.status} | DB: {health.db}
    </div>
  );
}

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50">
      <h1 className="text-3xl font-bold">Cab Booking App</h1>
      <Suspense
        fallback={
          <div className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-600">
            Checking API...
          </div>
        }
      >
        <HealthBadge />
      </Suspense>
    </main>
  );
}
import Link from "next/link";
import ApiTest from "@/components/ApiTest";

export default function DriverPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Driver Dashboard</h1>
      <p className="mt-2 text-gray-600">Ride requests come on Day 7.</p>
      <Link
        href="/driver/profile"
        className="mt-4 inline-block text-sm font-medium underline"
      >
        Complete your driver profile
      </Link>
      <ApiTest path="/api/driver/ping" />
    </main>
  );
}
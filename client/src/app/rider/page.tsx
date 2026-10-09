import Link from "next/link";
import ApiTest from "@/components/ApiTest";

export default function RiderPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="text-2xl font-bold">Rider Dashboard</h1>
      <p className="mt-2 text-gray-600">Ride booking comes on Day 6.</p>
      <Link
        href="/rider/profile"
        className="mt-4 inline-block text-sm font-medium underline"
      >
        Edit your profile
      </Link>
      <ApiTest path="/api/rider/ping" />
    </main>
  );
}
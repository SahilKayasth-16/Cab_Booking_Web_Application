import ApiTest from "@/components/ApiTest";

export default function RiderPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Rider Dashboard</h1>
      <p className="mt-2 text-gray-600">Ride booking comes on Day 6.</p>
      <ApiTest path="/api/rider/ping" />
    </main>
  );
}
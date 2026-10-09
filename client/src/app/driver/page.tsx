import ApiTest from "@/components/ApiTest";

export default function DriverPage() {
  return (
    <main className="mx-auto max-w-2xl p-8">
      <h1 className="text-2xl font-bold">Driver Dashboard</h1>
      <p className="mt-2 text-gray-600">Ride requests come on Day 7.</p>
      <ApiTest path="/api/driver/ping" />
    </main>
  );
}
import ProfileForm from "@/components/ProfileForm";
import VehicleForm from "@/components/VehicleForm";

export default function DriverProfilePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">Driver Profile</h1>
      <p className="mt-1 text-sm text-gray-600">
        Complete your details and vehicle information to start accepting rides.
      </p>

      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Personal details</h2>
        <ProfileForm />
      </section>

      <section className="mt-6 rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Vehicle and license</h2>
        <VehicleForm />
      </section>
    </main>
  );
}
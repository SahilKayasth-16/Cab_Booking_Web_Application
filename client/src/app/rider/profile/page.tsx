import ProfileForm from "@/components/ProfileForm";

export default function RiderProfilePage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-2xl font-bold">My Profile</h1>
      <p className="mt-1 text-sm text-gray-600">Manage your personal details.</p>

      <section className="mt-6 rounded-xl border bg-white p-6">
        <ProfileForm />
      </section>
    </main>
  );
}
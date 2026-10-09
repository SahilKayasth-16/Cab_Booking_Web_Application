"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { apiFetch, ApiError, toFieldErrors } from "@/lib/api";
import FormField from "@/components/FormField";

type DriverRow = {
  vehicle_make: string | null;
  vehicle_model: string | null;
  plate_number: string | null;
  license_number: string | null;
} | null;

type Message = { type: "success" | "error"; text: string } | null;

export default function VehicleForm() {
  const { getToken } = useAuth();
  const [vehicleMake, setVehicleMake] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [plateNumber, setPlateNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [complete, setComplete] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function applyDriver(d: DriverRow) {
    setVehicleMake(d?.vehicle_make ?? "");
    setVehicleModel(d?.vehicle_model ?? "");
    setPlateNumber(d?.plate_number ?? "");
    setLicenseNumber(d?.license_number ?? "");
    setComplete(
      Boolean(d?.vehicle_make && d?.vehicle_model && d?.plate_number && d?.license_number)
    );
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await getToken();
        const data = await apiFetch<{ driver: DriverRow }>("/api/drivers/me", token);
        if (!cancelled) applyDriver(data.driver);
      } catch {
        if (!cancelled)
          setMessage({ type: "error", text: "Could not load vehicle details." });
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
      const data = await apiFetch<{ driver: DriverRow }>("/api/drivers/me", token, {
        method: "PUT",
        body: JSON.stringify({ vehicleMake, vehicleModel, plateNumber, licenseNumber }),
      });
      applyDriver(data.driver);
      setMessage({ type: "success", text: "Vehicle details saved." });
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

  if (loading) return <p className="text-sm text-gray-500">Loading vehicle details...</p>;

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <span
        className={`inline-block rounded-full px-3 py-1 text-xs font-medium ${
          complete ? "bg-green-100 text-green-800" : "bg-amber-100 text-amber-800"
        }`}
      >
        {complete ? "Profile complete" : "Profile incomplete"}
      </span>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Vehicle make" name="vehicleMake" value={vehicleMake} onChange={setVehicleMake} error={errors.vehicleMake} placeholder="Maruti" />
        <FormField label="Vehicle model" name="vehicleModel" value={vehicleModel} onChange={setVehicleModel} error={errors.vehicleModel} placeholder="Swift Dzire" />
        <FormField label="Plate number" name="plateNumber" value={plateNumber} onChange={setPlateNumber} error={errors.plateNumber} placeholder="GJ05AB1234" />
        <FormField label="Driving license number" name="licenseNumber" value={licenseNumber} onChange={setLicenseNumber} error={errors.licenseNumber} placeholder="GJ0520200012345" />
      </div>

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
        {saving ? "Saving..." : "Save vehicle details"}
      </button>
    </form>
  );
}
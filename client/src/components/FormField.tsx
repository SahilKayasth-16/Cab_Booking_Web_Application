type Props = {
  label: string;
  name: string;
  value: string;
  onChange?: (value: string) => void;
  error?: string;
  hint?: string;
  type?: string;
  readOnly?: boolean;
  placeholder?: string;
  maxLength?: number;
};

export default function FormField({
  label,
  name,
  value,
  onChange,
  error,
  hint,
  type = "text",
  readOnly = false,
  placeholder,
  maxLength,
}: Props) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(e) => onChange?.(e.target.value)}
        className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-black ${
          readOnly ? "bg-gray-100 text-gray-500" : "bg-white"
        } ${error ? "border-red-500" : "border-gray-300"}`}
      />
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
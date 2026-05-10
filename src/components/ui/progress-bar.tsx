export function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-fhj-navy/10">
      <div
        className="h-full rounded-full bg-gradient-to-r from-fhj-gold-mid via-fhj-gold to-fhj-gold-light shadow-sm transition-all duration-500"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}


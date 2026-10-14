export const TOTAL_STEPS = 3;

export default function StepProgress({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-center justify-between text-[11px]">
        <span className="font-semibold uppercase tracking-wide text-luxol-orange">
          Signature Meat Box
        </span>
        <span className="text-neutral-500">
          Step {step} of {TOTAL_STEPS}
        </span>
      </div>
      <div
        role="progressbar"
        aria-label="Meat Box progress"
        aria-valuemin={1}
        aria-valuemax={TOTAL_STEPS}
        aria-valuenow={step}
        className="mt-2 h-1 w-full overflow-hidden rounded-full bg-neutral-200"
      >
        <div
          className="h-full rounded-full bg-luxol-green transition-all duration-500"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
    </div>
  );
}

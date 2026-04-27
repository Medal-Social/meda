import { Swatch } from './Swatch';
import { colorPrimitives } from './tokens-registry';

export type ColorScaleProps = {
  ramp: keyof typeof colorPrimitives;
};

export function ColorScale({ ramp }: ColorScaleProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="font-[var(--font-family-sans)] text-[20px] font-semibold capitalize text-[var(--foreground)]">
        {ramp}
      </h3>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-3">
        {colorPrimitives[ramp].map((stop) => (
          <Swatch key={stop} name={`${ramp}-${stop}`} cssVar={`--color-${ramp}-${stop}`} />
        ))}
      </div>
    </section>
  );
}

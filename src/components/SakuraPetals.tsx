import { createPetals } from "@/lib/petals";

const sizes = {
  1: "h-[18px] w-5 bg-[url(/images/petal1.png)]",
  2: "h-5 w-3.5 bg-[url(/images/petal2.png)]",
  3: "h-[15px] w-5 bg-[url(/images/petal3.png)]",
} as const;

type SakuraPetalsProps = {
  count?: number;
  seed?: number;
};

export function SakuraPetals({ count = 40, seed = 2023 }: SakuraPetalsProps) {
  const petals = createPetals(count, seed);
  const visibleOnMobile = Math.ceil(count / 2);

  return (
    <div
      data-testid="sakura-petals"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden motion-reduce:hidden"
    >
      {petals.map((petal, index) => (
        <span
          key={index}
          className={`absolute -top-5 animate-petal-fall ${sizes[petal.variant]} ${index < visibleOnMobile ? "block" : "hidden sm:block"}`}
          style={{ left: `${petal.left}%`, animationDelay: `${petal.delay}s` }}
        />
      ))}
    </div>
  );
}

export type HintKind = "anime" | "initials";

export function initials(name: string): string {
  return name
    .split(/[\s-]+/u)
    .map((word) => word.match(/\p{L}/u)?.[0])
    .filter((letter): letter is string => Boolean(letter))
    .map((letter) => `${letter.toLocaleUpperCase()}.`)
    .join(" ");
}

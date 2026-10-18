export type CharacterNames = {
  firstName: string;
  lastName: string;
  aliases: string[];
};

function normalize(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

const typoMinLength = 5;

function distance(a: string, b: string): number {
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i++) {
    const current = [i];
    for (let j = 1; j <= b.length; j++) {
      const substitution = previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1);
      current[j] = Math.min(previous[j] + 1, current[j - 1] + 1, substitution);
    }
    previous = current;
  }
  return previous[b.length];
}

function matches(attempt: string, name: string): boolean {
  const attemptWords = attempt.split(" ");
  const nameWords = name.split(" ");
  if (attemptWords.length !== nameWords.length) return false;
  let typos = 0;
  for (const [index, word] of nameWords.entries()) {
    if (word === attemptWords[index]) continue;
    if (word.length < typoMinLength || distance(word, attemptWords[index]) > 1) return false;
    typos++;
  }
  return typos <= 1;
}

export function isCorrectGuess(guess: string, names: CharacterNames): boolean {
  const attempt = normalize(guess);
  if (!attempt) return false;
  const fullNames = names.firstName && names.lastName
    ? [`${names.firstName} ${names.lastName}`, `${names.lastName} ${names.firstName}`]
    : [];
  return [names.firstName, names.lastName, ...fullNames, ...names.aliases]
    .map(normalize)
    .some((name) => name && matches(attempt, name));
}

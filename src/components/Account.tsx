"use client";

import { usePathname } from "next/navigation";
import { signInWithMal, signOutOfMal } from "@/auth/actions";
import type { Dictionary } from "@/i18n/dictionaries";

type AccountProps = {
  labels: Dictionary["account"];
  name?: string;
};

const buttonClass = "rounded px-2 py-1 text-sm text-mist hover:text-blossom";

export function Account({ labels, name }: AccountProps) {
  const pathname = usePathname();

  if (!name) {
    return (
      <form action={signInWithMal.bind(null, pathname)}>
        <button type="submit" className={buttonClass}>
          {labels.signIn}
        </button>
      </form>
    );
  }

  return (
    <form action={signOutOfMal.bind(null, pathname)} className="flex items-center gap-2">
      <span className="text-sm font-bold text-sakura">{name}</span>
      <button type="submit" className={buttonClass}>
        {labels.signOut}
      </button>
    </form>
  );
}

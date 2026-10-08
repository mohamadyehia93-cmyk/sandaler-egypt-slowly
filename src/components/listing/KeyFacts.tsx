import type { LucideIcon } from "lucide-react";

export interface KeyFact {
  icon: LucideIcon;
  label: string;
}

/** One horizontal row of facts that exist on the row; scrolls if it overflows. */
const KeyFacts = ({ facts }: { facts: KeyFact[] }) => {
  if (!facts.length) return null;
  return (
    <div className="border-b border-border">
      <ul className="max-w-[680px] lg:max-w-[1040px] mx-auto px-4 py-3 flex items-center overflow-x-auto hide-scrollbar divide-x divide-border rtl:divide-x-reverse">
        {facts.map((f, i) => (
          <li key={i} className="flex items-center gap-1.5 px-3 first:ps-0 last:pe-0 flex-shrink-0 text-sm text-foreground">
            <f.icon className="w-4 h-4 text-primary-dark" aria-hidden />
            <span className="whitespace-nowrap">{f.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default KeyFacts;

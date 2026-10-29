import { PageHeader, mCard } from "@/components/mobile/ui/primitives";
import { BanIcon, ChevronDownIcon, CrosshairIcon, ShieldCheckIcon, TrophyIcon, UsersIcon } from "@/components/mobile/ui/icons";

const icons: Record<string, React.ReactNode> = {
  fairPlay: <ShieldCheckIcon size={20} />,
  squad: <UsersIcon size={20} />,
  match: <CrosshairIcon size={20} />,
  disqualification: <BanIcon size={20} />,
};

/** Rules as an accordion — one section open at a time to start, numbered rules inside. */
export function MobileRules({
  title,
  subtitle,
  sections,
}: {
  title: string;
  subtitle: string;
  sections: { key: string; title: string; rules: string[] }[];
}) {
  return (
    <div className="md:hidden m-app">
      <PageHeader title={title} subtitle={subtitle} />

      <div className="px-4 space-y-2.5">
        {sections.map((s, i) => (
          <details key={s.key} open={i === 0} className={`m-details group ${mCard} overflow-hidden`}>
            <summary className="flex items-center gap-3 px-4 h-[68px] cursor-pointer select-none active:bg-m-raised">
              <span className="w-10 h-10 shrink-0 rounded-xl bg-m-raised text-m-text flex items-center justify-center">
                {icons[s.key]}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-m-display font-semibold text-[20px] leading-tight text-m-text">{s.title}</span>
                <span className="block text-[12px] text-m-faint">{s.rules.length} rules</span>
              </span>
              <ChevronDownIcon size={20} className="shrink-0 text-m-faint transition-transform group-open:rotate-180" />
            </summary>
            <ol className="border-t border-m-line divide-y divide-m-line">
              {s.rules.map((rule, j) => (
                <li key={j} className="flex gap-3 px-4 py-3">
                  <span className="w-6 h-6 shrink-0 mt-px rounded-md bg-m-red/15 text-m-red-text text-[12px] font-bold tabular-nums flex items-center justify-center">
                    {j + 1}
                  </span>
                  <p className="text-[14px] leading-relaxed text-m-dim">{rule}</p>
                </li>
              ))}
            </ol>
          </details>
        ))}

        <div className="flex items-center gap-3 rounded-2xl border border-m-green/30 bg-m-green/10 p-4">
          <TrophyIcon size={20} className="shrink-0 text-m-green-text" />
          <p className="text-[14px] font-medium text-m-text">Good luck to all participants! Play fair, play hard.</p>
        </div>
      </div>
    </div>
  );
}

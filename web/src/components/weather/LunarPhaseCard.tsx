import type { LunarPhaseData } from "@shared/types/weather";
import { Moon, Sunrise, Sunset } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface LunarPhaseCardProps {
  data: LunarPhaseData;
}

export function LunarPhaseCard({ data }: LunarPhaseCardProps) {
  return (
    <div className="rounded-2xl border border-transparent bg-white/80 p-4 backdrop-blur-md dark:border-white/10 dark:bg-slate-800">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-300">
        Fase lunar
      </p>

      <div className="mb-3 flex items-center gap-4">
        <MoonIcon phaseIndex={data.phaseIndex} />
        <div>
          <p className="text-xl font-semibold text-slate-800 dark:text-white">{data.phase}</p>
          <p className="text-base text-slate-500 dark:text-slate-300">
            Iluminación {data.illumination}%
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {data.moonrise && (
          <TimeRow icon={Moon} iconColor="text-indigo-400 dark:text-indigo-300" label="Moonrise" value={data.moonrise} />
        )}
        {data.moonset && (
          <TimeRow icon={Moon} iconColor="text-indigo-400 dark:text-indigo-300" label="Moonset" value={data.moonset} />
        )}
        {data.sunrise && (
          <TimeRow icon={Sunrise} iconColor="text-orange-500 dark:text-orange-300" label="Amanecer" value={formatTime(data.sunrise)} />
        )}
        {data.sunset && (
          <TimeRow icon={Sunset} iconColor="text-rose-500 dark:text-rose-300" label="Atardecer" value={formatTime(data.sunset)} />
        )}
      </div>
    </div>
  );
}

function TimeRow({ icon: Icon, iconColor, label, value }: { icon: React.ComponentType<{ size?: number; className?: string }>; iconColor: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-slate-100/60 px-3 py-2 dark:bg-slate-700">
      <Icon size={16} className={iconColor} />
      <span className="text-sm text-slate-500 dark:text-slate-300">{label}</span>
      <span className="ml-auto text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  );
}

function MoonIcon({ phaseIndex }: { phaseIndex: number }) {
  const { isDark } = useTheme();
  const darkFill = isDark ? "#64748B" : "#CBD5E1";
  const litFill = isDark ? "#FCD34D" : "#FDE68A";

  const svgs = [
    <circle key="0" cx="20" cy="20" r="16" fill={darkFill} />,
    <><circle key="1a" cx="20" cy="20" r="16" fill={darkFill} /><path key="1b" d="M20 4 A16 16 0 0 1 20 36 A10 16 0 0 0 20 4" fill={litFill} /></>,
    <><circle key="2a" cx="20" cy="20" r="16" fill={darkFill} /><path key="2b" d="M20 4 A16 16 0 0 1 20 36 A5 16 0 0 0 20 4" fill={litFill} /></>,
    <circle key="3" cx="20" cy="20" r="16" fill={litFill} />,
    <><circle key="4a" cx="20" cy="20" r="16" fill={darkFill} /><path key="4b" d="M20 4 A16 16 0 0 0 20 36 A5 16 0 0 1 20 4" fill={litFill} /></>,
    <><circle key="5a" cx="20" cy="20" r="16" fill={darkFill} /><path key="5b" d="M20 4 A16 16 0 0 0 20 36 A10 16 0 0 1 20 4" fill={litFill} /></>,
    <circle key="6" cx="20" cy="20" r="16" fill={darkFill} />,
    <circle key="7" cx="20" cy="20" r="16" fill={isDark ? "#475569" : "#94A3B8"} />,
  ];

  return (
    <svg viewBox="0 0 40 40" className="h-14 w-14">
      {svgs[phaseIndex] ?? svgs[0]}
    </svg>
  );
}

function formatTime(isoTime: string): string {
  try {
    const d = new Date(isoTime);
    return d.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" });
  } catch {
    return isoTime;
  }
}

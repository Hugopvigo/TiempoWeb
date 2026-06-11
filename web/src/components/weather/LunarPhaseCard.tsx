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
          <TimeRow icon={Moon} iconColor="text-indigo-400 dark:text-indigo-300" label="Salida luna" value={data.moonrise} />
        )}
        {data.moonset && (
          <TimeRow icon={Moon} iconColor="text-indigo-400 dark:text-indigo-300" label="Puesta luna" value={data.moonset} />
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
  const darkFill = isDark ? "#475569" : "#64748B";
  const litFill = isDark ? "#FCD34D" : "#FBBF24";

  // Right D-shape (lit right half), Left D-shape (lit left half)
  const rightD = "M20 4 A16 16 0 0 1 20 36 L20 4Z";
  const leftD  = "M20 4 A16 16 0 0 0 20 36 L20 4Z";

  const svgs: React.ReactNode[] = [
    // 0: Luna nueva — full dark
    <circle key="0" cx="20" cy="20" r="16" fill={darkFill} />,
    // 1: Creciente — dark bg, right D lit, dark ellipse leaves thin right sliver
    <g key="1">
      <circle cx="20" cy="20" r="16" fill={darkFill} />
      <path d={rightD} fill={litFill} />
      <ellipse cx="20" cy="20" rx="11" ry="16" fill={darkFill} />
    </g>,
    // 2: Cuarto creciente — dark bg, right D lit (half moon)
    <g key="2">
      <circle cx="20" cy="20" r="16" fill={darkFill} />
      <path d={rightD} fill={litFill} />
    </g>,
    // 3: Gibosa creciente — full lit, dark left D, lit ellipse leaves thin left dark sliver
    <g key="3">
      <circle cx="20" cy="20" r="16" fill={litFill} />
      <path d={leftD} fill={darkFill} />
      <ellipse cx="20" cy="20" rx="11" ry="16" fill={litFill} />
    </g>,
    // 4: Luna llena — full lit
    <circle key="4" cx="20" cy="20" r="16" fill={litFill} />,
    // 5: Gibosa menguante — full lit, dark right D, lit ellipse leaves thin right dark sliver
    <g key="5">
      <circle cx="20" cy="20" r="16" fill={litFill} />
      <path d={rightD} fill={darkFill} />
      <ellipse cx="20" cy="20" rx="11" ry="16" fill={litFill} />
    </g>,
    // 6: Cuarto menguante — dark bg, left D lit (half moon)
    <g key="6">
      <circle cx="20" cy="20" r="16" fill={darkFill} />
      <path d={leftD} fill={litFill} />
    </g>,
    // 7: Menguante — dark bg, left D lit, dark ellipse leaves thin left sliver
    <g key="7">
      <circle cx="20" cy="20" r="16" fill={darkFill} />
      <path d={leftD} fill={litFill} />
      <ellipse cx="20" cy="20" rx="11" ry="16" fill={darkFill} />
    </g>,
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

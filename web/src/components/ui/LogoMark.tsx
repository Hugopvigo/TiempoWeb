/** Marca del tiempo: sol cálido sobre dos olas, en la paleta del rediseño. */
export function LogoMark({ size = 30 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true" style={{ display: "block", flexShrink: 0 }}>
      <rect x="1" y="1" width="38" height="38" rx="12" fill="var(--ink)" />
      <circle cx="26" cy="13" r="6" fill="#FDBA74" />
      <path d="M6 25c4-3.6 7-3.6 10.5 0S23 28.6 27 25s6-3 8-1.6" fill="none" stroke="#7FB2F0" strokeWidth="3" strokeLinecap="round" />
      <path d="M6 32c4-3.6 7-3.6 10.5 0S23 35.6 27 32s6-3 8-1.6" fill="none" stroke="#7FB2F0" strokeWidth="3" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

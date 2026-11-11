export default function Logo({ small = false }) {
  return (
    <div className="logo" aria-label="SCR – Sustainability, Compliance & Risk">
      <svg viewBox="0 0 40 40" width={small ? 30 : 38} height={small ? 30 : 38} aria-hidden="true">
        <rect width="40" height="40" rx="10" fill="var(--brand)" />
        <path d="M8 29 L16 13 L21 22 L25 16 L32 29 Z" fill="none" stroke="#fff" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" />
      </svg>
      <div className="logo-text">
        <strong>SCR</strong>
        <span>Sustainability, Compliance &amp; Risk</span>
      </div>
    </div>
  );
}

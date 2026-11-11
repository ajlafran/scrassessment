export default function Logo({ light = false }) {
  return (
    <div className={`logo ${light ? "light" : ""}`} aria-label="SCR – Sustainability, Compliance & Risk">
      <strong>SCR<sup>®</sup></strong>
      <span>Sustainability, Compliance &amp; Risk</span>
    </div>
  );
}

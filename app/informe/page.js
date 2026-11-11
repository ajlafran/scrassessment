import SharedReport from "../../components/SharedReport";

export const metadata = {
  title: "Informe de diagnóstico – SCR",
  description: "Informe de diagnóstico de cumplimiento en Sustentabilidad, Compliance y Gestión de riesgos.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <SharedReport />;
}

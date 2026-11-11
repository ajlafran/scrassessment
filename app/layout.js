import "./globals.css";

export const metadata = {
  title: "SCR – Diagnóstico para proveedores mineros",
  description:
    "Evaluá en 10 minutos el nivel de cumplimiento de tu empresa en Sustentabilidad, Compliance y Gestión de riesgos, y recibí un plan de acción.",
};

export const viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

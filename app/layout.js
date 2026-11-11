import "./globals.css";

export const metadata = {
  title: "Mi página",
  description: "Mi página personal",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

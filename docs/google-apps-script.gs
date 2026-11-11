// Pegar en la planilla de Google: Extensiones → Apps Script. Luego Implementar → Nueva implementación
// → Tipo: Aplicación web → Ejecutar como: yo → Acceso: cualquier persona. Copiar la URL resultante.
// En Configuración del proyecto → Propiedades del script, crear SECRET con una clave larga a elección.
const HEADERS = ["Fecha", "Empresa", "Nombre", "Email", "Teléfono", "Puntaje", "Franja",
  "Sustentabilidad", "Compliance", "Gestión de riesgos", "Alertas críticas", "Respuestas (N.º pregunta: nivel 0-3)"];

function doPost(e) {
  const d = JSON.parse(e.postData.contents);
  const secret = PropertiesService.getScriptProperties().getProperty("SECRET");
  if (!secret || d.secret !== secret) return out({ ok: false, error: "no autorizado" });
  const sheet = SpreadsheetApp.getActiveSheet();
  if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);
  const dim = (n) => (d.dimensions.find((x) => x.name === n) || {}).score;
  sheet.appendRow([new Date(), d.company, d.name, d.email, d.phone, d.score, d.band,
    dim("Sustentabilidad"), dim("Compliance"), dim("Gestión de riesgos"),
    (d.alerts || []).join(", "), JSON.stringify(d.answers)]);
  return out({ ok: true });
}
function out(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

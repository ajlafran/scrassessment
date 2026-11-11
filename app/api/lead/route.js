// Recibe los datos del formulario y los reenvía al Google Apps Script que escribe en la planilla.
const bad = (msg, status = 400) => Response.json({ ok: false, error: msg }, { status });
const str = (v, max) => (typeof v === "string" ? v.trim().slice(0, max) : "");

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return bad("Solicitud inválida.");
  }
  if (body.website) return Response.json({ ok: true }); // campo trampa para bots

  const lead = {
    company: str(body.company, 120),
    name: str(body.name, 120),
    email: str(body.email, 160),
    phone: str(body.phone, 40),
    consent: body.consent === true,
  };
  const pf = body.profile && typeof body.profile === "object" ? body.profile : {};
  const profile = { sector: str(pf.sector, 120), size: str(pf.size, 60), urgency: str(pf.urgency, 120), target: str(pf.target, 120) };
  if (!lead.company || !lead.name || !lead.phone) return bad("Completá todos los campos.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) return bad("El mail no parece válido.");
  if (!lead.consent) return bad("Necesitamos tu consentimiento para contactarte.");

  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) {
    console.error("LEAD_WEBHOOK_URL no está configurada: el contacto no se guardó.");
    return bad("No pudimos enviar tus datos en este momento. Intentá de nuevo más tarde.", 503);
  }
  const payload = {
    secret: process.env.LEAD_WEBHOOK_SECRET ?? "",
    ...lead,
    score: Number(body.score) || 0,
    band: str(body.band, 40),
    profile,
    temperature: str(body.temperature, 20),
    tier: str(body.tier, 80),
    dimensions: Array.isArray(body.dimensions) ? body.dimensions.slice(0, 5) : [],
    alerts: Array.isArray(body.alerts) ? body.alerts.slice(0, 30) : [],
    answers: body.answers && typeof body.answers === "object" ? body.answers : {},
  };
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "text/plain" }, body: JSON.stringify(payload) });
    const out = await res.json().catch(() => null);
    if (!res.ok || !out?.ok) throw new Error(`webhook respondió ${res.status} ${JSON.stringify(out)}`);
    return Response.json({ ok: true });
  } catch (e) {
    console.error("Error enviando el contacto:", e);
    return bad("No pudimos enviar tus datos en este momento. Intentá de nuevo más tarde.", 502);
  }
}

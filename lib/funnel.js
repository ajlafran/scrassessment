export const SECTORS = [
  "Servicios industriales y mantenimiento", "Transporte y logística", "Construcción e ingeniería",
  "Insumos y equipos", "Tecnología y servicios profesionales", "Hotelería, catering y servicios generales", "Otro",
];
export const SIZES = ["1 a 10 personas", "11 a 50", "51 a 250", "Más de 250"];
export const URGENCIES = [
  "Estoy en proceso de calificación con una minera",
  "Lo necesito en los próximos 3 a 6 meses",
  "Solo estoy explorando",
];

export const profileComplete = (p) => !!(p && p.sector && p.size && p.urgency);

// Nivel de servicio sugerido según el puntaje (textos provisorios, a ajustar con el cliente)
export function serviceTier(score) {
  if (score < 40) return { id: "adecuacion", title: "Plan de adecuación integral",
    text: "Armamos con vos un plan para cerrar primero las brechas más críticas y llegar al nivel que exigen las mineras." };
  if (score < 80) return { id: "acompanamiento", title: "Acompañamiento para cerrar brechas",
    text: "Tu base está armada. Te ayudamos a completar lo que falta y a documentarlo para que se pueda auditar." };
  return { id: "auditoria", title: "Preparación para auditoría",
    text: "Estás cerca. Revisamos la evidencia y te preparamos para las auditorías y los cuestionarios de proveedores." };
}

// Qué tan urgente es contactar a esta persona: caliente, tibio o frío
export function temperature(profile, result) {
  const { score, alerts } = result;
  const [inProcess, soon, exploring] = URGENCIES;
  if (profile?.urgency === inProcess) return "Caliente";
  if (profile?.urgency === soon && (score < 60 || alerts.length > 0)) return "Caliente";
  if (profile?.urgency === exploring && score >= 60 && alerts.length === 0) return "Frío";
  return "Tibio";
}

export const gapTo = (score, target = 80) => Math.max(0, Math.round((target - score) * 10) / 10);

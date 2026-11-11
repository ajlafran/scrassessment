# SCR – Sustainability, Compliance & Risk

Diagnóstico online para proveedores mineros (Next.js). Diseño: `docs/superpowers/specs/`.

- `npm run dev` / `npm test` / `npm run build`
- Datos: `data/assessment.json` (se regenera con `scripts/extract-data.py`).
- Contactos: variables `LEAD_WEBHOOK_URL` y `LEAD_WEBHOOK_SECRET` en Vercel; script en `docs/google-apps-script.gs`.
- Botones de contacto: completar `lib/config.js` (WhatsApp y agenda).

# SCR – Sustainability, Compliance & Risk: diseño

Aprobado por el usuario en el chat (2026-11-11).

## Objetivo
Diagnóstico online para proveedores mineros que muestra su nivel de cumplimiento frente a los
estándares de la industria y capta contactos de quienes quieran contratar los planes de acción.

## Flujo
Portada → cuestionario (3 pasos: Sustentabilidad 8, Compliance 8, Riesgos 9; 4 niveles por pregunta)
→ resultado gratuito (puntaje 0–100, franja, puntaje por área, alertas críticas)
→ formulario de contacto con consentimiento → plan de acción priorizado + botones WhatsApp y Agendar reunión.

## Cálculo
Puntaje = Σ(peso × nivel/3) / Σ(peso) × 100, con nivel 0–3 (No cumple, Parcial, Satisfactorio, Total).
Franjas (las del Excel): 0–39,99 Deficiente · 40–59,99 Regular · 60–79,99 Bueno · 80–100 Satisfactorio.
Alertas críticas: "No cumple" en las preguntas 5 (salud y seguridad), 6 (derechos humanos),
10 (anticorrupción) y 12 (canal de denuncias).
Plan de acción: para cada pregunta con nivel < 3, el plan de ese nivel (hoja "Matriz de planes de acción").
Prioridad: Alta (No cumple), Media (Parcial), Baja (Satisfactorio).

## Datos
`data/assessment.json`, generado con `scripts/extract-data.py` desde el Excel. Los planes se unen por
N.º de pregunta; los temas salen de "Criterios por pregunta" (en la hoja de planes están corridos una fila).

## Contactos
El formulario envía a `/api/lead`, que reenvía a un Google Apps Script (`docs/google-apps-script.gs`)
que agrega una fila a la planilla. La URL va en la variable de entorno `LEAD_WEBHOOK_URL` (Vercel).
Las respuestas del usuario se guardan solo en su navegador hasta que envía el formulario.

## Pendientes de configuración
Número de WhatsApp y link de agenda (`lib/config.js`), texto legal del consentimiento, URL del script.
Los botones sin configurar no se muestran.

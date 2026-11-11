"""Genera data/assessment.json a partir del Excel del cuestionario.
Uso: python3 -I scripts/extract-data.py ruta/al/archivo.xlsx
Los planes se unen por N.º de pregunta; los nombres de tema salen de la hoja
'Criterios por pregunta' (en 'Matriz de planes de acción' están corridos una fila)."""
import json, sys, openpyxl

wb = openpyxl.load_workbook(sys.argv[1], data_only=True)
cues, crit, plan = wb["Cuestionario"], wb["Criterios por pregunta"], wb["Matriz de planes de acción"]

def rows(ws):
    out = {}
    for r in ws.iter_rows(values_only=True):
        if isinstance(r[0], (int, float)) and r[0] == int(r[0]) and r[1]:
            out[int(r[0])] = r
    return out

# La hoja de planes trae filas de encabezado numeradas distinto: se une solo por N.º
q, c, p = rows(cues), rows(crit), rows(plan)
questions = []
for n in sorted(q):
    if n not in c or n not in p:
        continue
    questions.append({
        "id": n,
        "dimension": q[n][1],
        "text": q[n][2],
        "weight": round(float(q[n][3]), 4),
        "topic": c[n][2],
        "criteria": [str(x) for x in c[n][3:7]],
        "plans": [str(x) for x in p[n][3:7]],
    })
assert len(questions) == 25, len(questions)
json.dump({"questions": questions}, open("data/assessment.json", "w"), ensure_ascii=False, indent=1)
print(len(questions), "preguntas")

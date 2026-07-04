# ROI-Rechner

Eigenständige, interaktive Webseite mit drei ROI-Rechnern für Vertriebsgespräche — nachgebaut aus dem Google Sheet "ROI-Rechner - VORLAGE":

1. **Workshop-Rechner** — High-Ticket-Sales (mind. 2 Tage)
2. **Webinar-Rechner (Termine)** — Erstgespräche für High-Ticket
3. **Webinar-Rechner (Bestellformular)** — Sales über Bestellformular (Produkt unter 1.000 €)

Alle drei Rechner sind live editierbar: Preis, Ad-Spend, Lead-Preis, Leads sowie sämtliche Performance-Quoten (Show-Up-Rate, Termin- und Abschlussquoten) lassen sich per Eingabefeld bzw. Regler anpassen. Der Funnel und die KPIs (Auftragsvolumen, Gewinn, Cashflow, ROAS) aktualisieren sich sofort.

## Nutzung

Reines statisches HTML/CSS/JS ohne Build-Schritt oder Abhängigkeiten. Einfach `index.html` im Browser öffnen, oder z. B. via GitHub Pages hosten:

Settings → Pages → Deploy from branch → `main` / `/ (root)`.

## Dateien

- `index.html` — Struktur & Tab-Navigation
- `style.css` — Design (aktuell ein neutrales Dark-Theme als Platzhalter — Farben/Fonts können jederzeit auf das gewünschte Design angepasst werden)
- `script.js` — Rechenlogik & Formeln (1:1 aus dem Google Sheet übernommen, siehe Kommentare im Code) sowie Rendering

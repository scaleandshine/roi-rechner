// ROI-Rechner: Workshop & Webinar (mit Terminen / mit Bestellformular)
// Formellogik 1:1 aus dem Google-Sheet "ROI-Rechner - VORLAGE" übernommen.

const fmtCurrency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const fmtCurrency2 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const fmtNumber = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const fmtPercent = (v) => `${(v * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })}%`;

function round(n) { return Math.round(n); }

function escapeAttr(str) {
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function infoBtn(tip) {
  return `<button type="button" class="fg-info-btn" data-tip="${escapeAttr(tip)}" aria-label="Erklärung">i</button>`;
}

const CALCULATORS = {
  workshop: {
    title: 'Workshop-Rechner',
    subtitle: 'High-Ticket-Sales (mind. 2 Tage)',
    fields: [
      { key: 'productPrice', label: 'Produkt-Preis (netto)', unit: '€', default: 4000, help: 'Der Netto-Verkaufspreis deines Haupt-Angebots (ohne MwSt.).' },
      { key: 'erfolgspaketPrice', label: 'Erfolgspaket-Preis (netto)', unit: '€', default: 19.95, step: 0.05, help: 'Preis für ein kleines Zusatzprodukt, das während des Workshops verkauft wird (z. B. Workbook, Action-Plan).' },
      { key: 'adSpend', label: 'Ad-Spend', unit: '€', default: 2000, help: 'Dein gesamtes Werbebudget für diesen Workshop (z. B. Meta oder Google Ads).' },
      { key: 'leadPrice', label: 'Lead-Preis', unit: '€', default: 15, step: 0.5, help: 'Was dich eine einzelne Anmeldung (Lead) im Schnitt kostet.' },
      { key: 'organicLeads', label: 'Organische Leads', unit: 'Leads', default: 100, help: 'Anmeldungen ohne bezahlte Werbung, z. B. über E-Mail-Liste, Social Media oder Empfehlungen.' },
      { key: 'otherProductRevenue', label: 'Umsatz Verkäufe anderes Produkt', unit: '€', default: 0, help: 'Zusätzlicher Umsatz durch ein weiteres Produkt während des Workshops. Falls nicht relevant, einfach bei 0 lassen.' },
    ],
    rates: [
      { key: 'showUpRateDay1', label: 'Show-Up Rate Tag 1', default: 0.25, benchmark: 0.25, help: 'Wie viel Prozent der angemeldeten Leads am ersten Workshop-Tag tatsächlich teilnehmen.' },
      { key: 'showUpRateDay2', label: 'Show-Up Rate Tag 2', default: 0.20, benchmark: 0.20, help: 'Wie viel Prozent der angemeldeten Leads am zweiten Workshop-Tag tatsächlich teilnehmen.' },
      { key: 'termineRate', label: 'Terminquote (nach Tag 2)', default: 0.075, benchmark: 0.10, help: 'Wie viel Prozent der Teilnehmer von Tag 2 sich anschließend für ein Beratungsgespräch eintragen.' },
      { key: 'salesRate', label: 'Abschlussquote (Termin → Sale)', default: 0.70, benchmark: 0.80, help: 'Wie viel Prozent der geführten Beratungsgespräche zu einem Kauf des Hauptangebots führen.' },
      { key: 'erfolgspaketRate', label: 'Erfolgspaket-Kaufquote', default: 0.10, benchmark: 0.10, help: 'Wie viel Prozent aller Leads das kleine Zusatzprodukt (Erfolgspaket) kaufen.' },
    ],
    compute(v) {
      const paidLeads = v.leadPrice > 0 ? round(v.adSpend / v.leadPrice) : 0;
      const totalLeads = paidLeads + v.organicLeads;
      const showUpDay1 = round(totalLeads * v.showUpRateDay1);
      const showUpDay2 = round(totalLeads * v.showUpRateDay2);
      const termine = round(showUpDay2 * v.termineRate);
      const sales = round(termine * v.salesRate);
      const salesErfolgspaket = round(totalLeads * v.erfolgspaketRate);
      const umsatzErfolgspaket = v.erfolgspaketPrice * salesErfolgspaket;
      const auftragsvolumen = sales * v.productPrice + umsatzErfolgspaket + v.otherProductRevenue;
      const cashflow = auftragsvolumen * 0.3;
      const gewinn = auftragsvolumen - v.adSpend;
      const roas = v.adSpend > 0 ? auftragsvolumen / v.adSpend : 0;
      return {
        funnel: [
          { label: 'Leads gesamt (bezahlt + organisch)', value: fmtNumber.format(totalLeads) },
          { label: 'Show-Ups Tag 1', value: fmtNumber.format(showUpDay1) },
          { label: 'Show-Ups Tag 2', value: fmtNumber.format(showUpDay2) },
          { label: 'Termine', value: fmtNumber.format(termine) },
          { label: 'High-Ticket Sales', value: fmtNumber.format(sales) },
          { label: 'Erfolgspaket-Verkäufe', value: fmtNumber.format(salesErfolgspaket) },
        ],
        kpis: [
          { label: 'Auftragsvolumen', value: fmtCurrency.format(auftragsvolumen), primary: true, help: 'Gesamter Umsatz aus High-Ticket-Sales, Erfolgspaket-Verkäufen und sonstigem Produktumsatz.' },
          { label: 'Gewinn', value: fmtCurrency.format(gewinn), negative: gewinn < 0, help: 'Auftragsvolumen minus Ad-Spend. Weitere Kosten (z. B. Personal, Tools) sind hier nicht eingerechnet.' },
          { label: 'Cashflow (30%)', value: fmtCurrency.format(cashflow), help: 'Angenommener sofort verfügbarer Cashflow-Anteil vom Auftragsvolumen (Richtwert: 30%).' },
          { label: 'ROAS', value: `${roas.toLocaleString('de-DE', { maximumFractionDigits: 2 })}x`, help: 'Return on Ad Spend: Auftragsvolumen geteilt durch Ad-Spend. Zeigt, wie oft sich dein Werbebudget vervielfacht.' },
        ],
      };
    },
  },

  webinarTermine: {
    title: 'Webinar-Rechner',
    subtitle: 'Erstgespräche für High-Ticket',
    fields: [
      { key: 'productPrice', label: 'Produkt-Preis (netto)', unit: '€', default: 2500, help: 'Der Netto-Verkaufspreis deines Haupt-Angebots (ohne MwSt.).' },
      { key: 'adSpend', label: 'Ad-Spend', unit: '€', default: 5000, help: 'Dein gesamtes Werbebudget für dieses Webinar (z. B. Meta oder Google Ads).' },
      { key: 'leadPrice', label: 'Lead-Preis', unit: '€', default: 15, step: 0.5, help: 'Was dich eine einzelne Anmeldung (Lead) im Schnitt kostet.' },
      { key: 'organicLeads', label: 'Organische Leads', unit: 'Leads', default: 50, help: 'Anmeldungen ohne bezahlte Werbung, z. B. über E-Mail-Liste, Social Media oder Empfehlungen.' },
    ],
    rates: [
      { key: 'showUpRate', label: 'Show-Up Rate', default: 0.30, benchmark: 0.35, help: 'Wie viel Prozent der angemeldeten Leads live im Webinar dabei sind.' },
      { key: 'erstgesprächeRate', label: 'Erstgespräche-Quote', default: 0.15, benchmark: 0.15, help: 'Wie viel Prozent der Webinar-Teilnehmer sich für ein Erstgespräch eintragen.' },
      { key: 'zweitgesprächeRate', label: 'Zweitgespräche-Quote', default: 0.30, benchmark: 0.30, help: 'Wie viel Prozent der Erstgespräche zu einem Zweitgespräch führen.' },
      { key: 'salesRate', label: 'Abschlussquote (Zweitgespräch → Sale)', default: 0.66, benchmark: 0.66, help: 'Wie viel Prozent der Zweitgespräche zu einem Kauf führen.' },
    ],
    compute(v) {
      const paidLeads = v.leadPrice > 0 ? round(v.adSpend / v.leadPrice) : 0;
      const totalLeads = paidLeads + v.organicLeads;
      const showUps = round(totalLeads * v.showUpRate);
      const erstgespräche = round(showUps * v.erstgesprächeRate);
      const zweitgespräche = round(erstgespräche * v.zweitgesprächeRate);
      const sales = round(zweitgespräche * v.salesRate);
      const auftragsvolumen = sales * v.productPrice;
      const cashflow = auftragsvolumen * 0.3;
      const gewinn = auftragsvolumen - v.adSpend;
      const roas = v.adSpend > 0 ? auftragsvolumen / v.adSpend : 0;
      return {
        funnel: [
          { label: 'Leads gesamt (bezahlt + organisch)', value: fmtNumber.format(totalLeads) },
          { label: 'Show-Ups im Webinar', value: fmtNumber.format(showUps) },
          { label: 'Erstgespräche', value: fmtNumber.format(erstgespräche) },
          { label: 'Zweitgespräche', value: fmtNumber.format(zweitgespräche) },
          { label: 'Sales', value: fmtNumber.format(sales) },
        ],
        kpis: [
          { label: 'Auftragsvolumen', value: fmtCurrency.format(auftragsvolumen), primary: true, help: 'Gesamter Umsatz aus allen High-Ticket-Sales.' },
          { label: 'Gewinn', value: fmtCurrency.format(gewinn), negative: gewinn < 0, help: 'Auftragsvolumen minus Ad-Spend. Weitere Kosten (z. B. Personal, Tools) sind hier nicht eingerechnet.' },
          { label: 'Cashflow (30%)', value: fmtCurrency.format(cashflow), help: 'Angenommener sofort verfügbarer Cashflow-Anteil vom Auftragsvolumen (Richtwert: 30%).' },
          { label: 'ROAS', value: `${roas.toLocaleString('de-DE', { maximumFractionDigits: 2 })}x`, help: 'Return on Ad Spend: Auftragsvolumen geteilt durch Ad-Spend. Zeigt, wie oft sich dein Werbebudget vervielfacht.' },
        ],
      };
    },
  },

  webinarBestellformular: {
    title: 'Webinar-Rechner',
    subtitle: 'Sales über Bestellformular (Produkt unter 1.000 €)',
    fields: [
      { key: 'productPrice', label: 'Produkt-Preis (netto)', unit: '€', default: 779, help: 'Der Netto-Verkaufspreis deines Angebots (ohne MwSt.).' },
      { key: 'adSpend', label: 'Ad-Spend', unit: '€', default: 5000, help: 'Dein gesamtes Werbebudget für dieses Webinar (z. B. Meta oder Google Ads).' },
      { key: 'leadPrice', label: 'Lead-Preis', unit: '€', default: 15, step: 0.5, help: 'Was dich eine einzelne Anmeldung (Lead) im Schnitt kostet.' },
      { key: 'organicLeads', label: 'Organische Leads', unit: 'Leads', default: 100, help: 'Anmeldungen ohne bezahlte Werbung, z. B. über E-Mail-Liste, Social Media oder Empfehlungen.' },
    ],
    rates: [
      { key: 'showUpRate', label: 'Show-Up Rate', default: 0.30, benchmark: 0.30, help: 'Wie viel Prozent der angemeldeten Leads live im Webinar dabei sind.' },
      { key: 'salesRate', label: 'Abschlussquote (Show-Up → Sale)', default: 0.10, benchmark: 0.10, help: 'Wie viel Prozent der Webinar-Teilnehmer direkt über das Bestellformular kaufen.' },
    ],
    compute(v) {
      const paidLeads = v.leadPrice > 0 ? round(v.adSpend / v.leadPrice) : 0;
      const totalLeads = paidLeads + v.organicLeads;
      const showUps = round(totalLeads * v.showUpRate);
      const sales = round(showUps * v.salesRate);
      const auftragsvolumen = sales * v.productPrice;
      const cashflow = auftragsvolumen * 0.3;
      const gewinn = auftragsvolumen - v.adSpend;
      const roas = v.adSpend > 0 ? auftragsvolumen / v.adSpend : 0;
      return {
        funnel: [
          { label: 'Leads gesamt (bezahlt + organisch)', value: fmtNumber.format(totalLeads) },
          { label: 'Show-Ups im Webinar', value: fmtNumber.format(showUps) },
          { label: 'Sales über Bestellformular', value: fmtNumber.format(sales) },
        ],
        kpis: [
          { label: 'Auftragsvolumen', value: fmtCurrency.format(auftragsvolumen), primary: true, help: 'Gesamter Umsatz aus allen Verkäufen über das Bestellformular.' },
          { label: 'Gewinn', value: fmtCurrency.format(gewinn), negative: gewinn < 0, help: 'Auftragsvolumen minus Ad-Spend. Weitere Kosten (z. B. Personal, Tools) sind hier nicht eingerechnet.' },
          { label: 'Cashflow (30%)', value: fmtCurrency.format(cashflow), help: 'Angenommener sofort verfügbarer Cashflow-Anteil vom Auftragsvolumen (Richtwert: 30%).' },
          { label: 'ROAS', value: `${roas.toLocaleString('de-DE', { maximumFractionDigits: 2 })}x`, help: 'Return on Ad Spend: Auftragsvolumen geteilt durch Ad-Spend. Zeigt, wie oft sich dein Werbebudget vervielfacht.' },
        ],
      };
    },
  },
};

const state = {};
for (const [calcKey, calc] of Object.entries(CALCULATORS)) {
  state[calcKey] = {};
  calc.fields.forEach(f => state[calcKey][f.key] = f.default);
  calc.rates.forEach(r => state[calcKey][r.key] = r.default);
}

let activeCalc = 'workshop';
const app = document.getElementById('app');

function renderCalc(calcKey) {
  const calc = CALCULATORS[calcKey];
  const v = state[calcKey];

  app.innerHTML = `
    <div class="calc-head">
      <h2>${calc.title}</h2>
      <p>${calc.subtitle}</p>
    </div>
    <div class="grid">
      <div class="col-inputs">
        <div class="card">
          <div class="fg-eyebrow"><span class="num">1</span>Deine Angaben</div>
          ${calc.fields.map(f => `
            <div class="field">
              <label>${f.label} ${f.help ? infoBtn(f.help) : ''}</label>
              <div class="input-wrap">
                <input type="number" step="${f.step || 1}" min="0" data-field="${f.key}" value="${v[f.key]}">
                <span class="unit">${f.unit}</span>
              </div>
            </div>
          `).join('')}
        </div>
        <div class="card">
          <div class="fg-eyebrow"><span class="num">2</span>Performance-Annahmen</div>
          ${calc.rates.map(r => `
            <div class="rate-field">
              <div class="rate-top">
                <label>${r.label} ${r.help ? infoBtn(r.help) : ''}</label>
                <span class="rate-value" data-rate-display="${r.key}">${fmtPercent(v[r.key])}</span>
              </div>
              <input type="range" min="0" max="100" step="0.5" data-rate="${r.key}" value="${v[r.key] * 100}">
              ${r.benchmark !== undefined ? `<div class="rate-bench">Branchen-Benchmark: ${fmtPercent(r.benchmark)}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="col-results">
        <div class="card">
          <div class="fg-eyebrow"><span class="num">3</span>Dein Funnel</div>
          <div class="funnel" id="funnel"></div>
        </div>
        <div class="kpis" id="kpis"></div>
      </div>
    </div>
  `;

  app.querySelectorAll('input[data-field]').forEach(input => {
    input.addEventListener('input', () => {
      const val = parseFloat(input.value);
      state[calcKey][input.dataset.field] = isNaN(val) ? 0 : val;
      update(calcKey);
    });
  });

  app.querySelectorAll('input[data-rate]').forEach(input => {
    input.addEventListener('input', () => {
      const rateKey = input.dataset.rate;
      const val = parseFloat(input.value) / 100;
      state[calcKey][rateKey] = val;
      app.querySelector(`[data-rate-display="${rateKey}"]`).textContent = fmtPercent(val);
      update(calcKey);
    });
  });

  update(calcKey);
}

function update(calcKey) {
  hideTooltip();
  const calc = CALCULATORS[calcKey];
  const result = calc.compute(state[calcKey]);

  const funnelEl = document.getElementById('funnel');
  funnelEl.innerHTML = result.funnel.map((step, i) => `
    ${i > 0 ? '<div class="funnel-arrow">↓</div>' : ''}
    <div class="funnel-step">
      <span class="fs-label">${step.label}</span>
      <span class="fs-value">${step.value}</span>
    </div>
  `).join('');

  const kpisEl = document.getElementById('kpis');
  kpisEl.innerHTML = result.kpis.map(kpi => `
    <div class="kpi ${kpi.primary ? 'primary' : ''}">
      <div class="kpi-label">${kpi.label} ${kpi.help ? infoBtn(kpi.help) : ''}</div>
      <div class="kpi-value ${kpi.negative ? 'negative' : ''}">${kpi.value}</div>
    </div>
  `).join('');
}

document.querySelectorAll('.fg-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.fg-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeCalc = tab.dataset.calc;
    renderCalc(activeCalc);
  });
});

// ---------- info tooltip (click-to-toggle, touch-friendly) ----------

const tooltipEl = document.createElement('div');
tooltipEl.className = 'fg-tooltip';
document.body.appendChild(tooltipEl);
let activeTipBtn = null;

function showTooltip(btn) {
  tooltipEl.textContent = btn.dataset.tip;
  tooltipEl.classList.add('visible');
  btn.classList.add('active');
  activeTipBtn = btn;

  const rect = btn.getBoundingClientRect();
  tooltipEl.style.top = `${rect.bottom + 8}px`;
  tooltipEl.style.left = `${rect.left}px`;

  requestAnimationFrame(() => {
    const tw = tooltipEl.offsetWidth;
    const vw = window.innerWidth;
    let left = rect.left;
    if (left + tw > vw - 12) left = vw - tw - 12;
    if (left < 12) left = 12;
    tooltipEl.style.left = `${left}px`;
  });
}

function hideTooltip() {
  tooltipEl.classList.remove('visible');
  if (activeTipBtn) activeTipBtn.classList.remove('active');
  activeTipBtn = null;
}

document.addEventListener('click', (e) => {
  const btn = e.target.closest('.fg-info-btn');
  if (btn) {
    e.stopPropagation();
    if (activeTipBtn === btn) {
      hideTooltip();
    } else {
      hideTooltip();
      showTooltip(btn);
    }
    return;
  }
  if (!e.target.closest('.fg-tooltip')) hideTooltip();
});

window.addEventListener('scroll', hideTooltip, true);
window.addEventListener('resize', hideTooltip);
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideTooltip(); });

renderCalc(activeCalc);

// ---------- Knowledge-Base Opt-in ----------

const KB_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbxxQ4sAikTmFebbJFCN9A6O8jAAkIIMXg4R7qSOlnHPcrDvdPNE_zVSeS15otYwnNfP/exec';
const KB_LEAD_API_URL = 'https://dashboard.scaleandshine.de/api/roi-rechner/lead';
const KB_DESTINATION_URL = '/roi-rechner/optimierung';

const kbUnlockBtn = document.getElementById('kb-unlock-btn');
const kbModalOverlay = document.getElementById('kb-modal-overlay');
const kbModalClose = document.getElementById('kb-modal-close');
const kbForm = document.getElementById('kb-form');
const kbSubmitBtn = document.getElementById('kb-submit-btn');
const kbError = document.getElementById('kb-error');

function openKbModal() {
  kbModalOverlay.hidden = false;
  document.getElementById('kb-vorname').focus();
}

function closeKbModal() {
  kbModalOverlay.hidden = true;
  kbError.hidden = true;
}

kbUnlockBtn.addEventListener('click', openKbModal);
kbModalClose.addEventListener('click', closeKbModal);
kbModalOverlay.addEventListener('click', (e) => {
  if (e.target === kbModalOverlay) closeKbModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !kbModalOverlay.hidden) closeKbModal();
});

kbForm.addEventListener('submit', (e) => {
  e.preventDefault();
  kbError.hidden = true;
  const vorname = document.getElementById('kb-vorname').value.trim();
  const email = document.getElementById('kb-email').value.trim();

  kbSubmitBtn.disabled = true;
  kbSubmitBtn.textContent = 'Wird freigeschaltet …';

  if (window.posthog) {
    posthog.capture('lead_submitted', { source: 'knowledge_base_optin' });
  }

  const body = JSON.stringify({ vorname, email });
  const opts = {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // vermeidet CORS-Preflight
    body,
  };

  // Google Sheet (Backup-Log) + Dashboard-API (Lead speichern, Knowledgebase-Mail an den Lead,
  // Benachrichtigung an leads@fityourbusiness.de) parallel anstoßen. Antworten sind fire-and-forget –
  // die Freischaltung der Seite hängt nicht von ihnen ab.
  Promise.allSettled([fetch(KB_WEBHOOK_URL, opts), fetch(KB_LEAD_API_URL, opts)]).finally(() => {
    window.location.href = KB_DESTINATION_URL;
  });
});

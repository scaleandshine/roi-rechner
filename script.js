// ROI-Rechner — Workshop & Webinar (mit Terminen / mit Bestellformular)
// Formellogik 1:1 aus dem Google-Sheet "ROI-Rechner - VORLAGE" übernommen.

const fmtCurrency = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
const fmtCurrency2 = new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 2 });
const fmtNumber = new Intl.NumberFormat('de-DE', { maximumFractionDigits: 0 });
const fmtPercent = (v) => `${(v * 100).toLocaleString('de-DE', { maximumFractionDigits: 1 })}%`;

function round(n) { return Math.round(n); }

const CALCULATORS = {
  workshop: {
    title: 'Workshop-Rechner',
    subtitle: 'High-Ticket-Sales (mind. 2 Tage)',
    fields: [
      { key: 'productPrice', label: 'Produkt-Preis (netto)', unit: '€', default: 4000 },
      { key: 'erfolgspaketPrice', label: 'Erfolgspaket-Preis (netto)', unit: '€', default: 19.95, step: 0.05 },
      { key: 'adSpend', label: 'Ad-Spend', unit: '€', default: 2000 },
      { key: 'leadPrice', label: 'Lead-Preis', unit: '€', default: 15, step: 0.5 },
      { key: 'organicLeads', label: 'Organische Leads', unit: 'Leads', default: 100 },
      { key: 'otherProductRevenue', label: 'Umsatz Verkäufe anderes Produkt', unit: '€', default: 0 },
    ],
    rates: [
      { key: 'showUpRateDay1', label: 'Show-Up Rate Tag 1', default: 0.25, benchmark: 0.25 },
      { key: 'showUpRateDay2', label: 'Show-Up Rate Tag 2', default: 0.20, benchmark: 0.20 },
      { key: 'termineRate', label: 'Terminquote (nach Tag 2)', default: 0.075, benchmark: 0.10 },
      { key: 'salesRate', label: 'Abschlussquote (Termin → Sale)', default: 0.70, benchmark: 0.80 },
      { key: 'erfolgspaketRate', label: 'Erfolgspaket-Kaufquote', default: 0.10, benchmark: 0.10 },
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
          { label: 'Auftragsvolumen', value: fmtCurrency.format(auftragsvolumen), primary: true },
          { label: 'Gewinn', value: fmtCurrency.format(gewinn), negative: gewinn < 0 },
          { label: 'Cashflow (30%)', value: fmtCurrency.format(cashflow) },
          { label: 'ROAS', value: `${roas.toLocaleString('de-DE', { maximumFractionDigits: 2 })}x` },
        ],
      };
    },
  },

  webinarTermine: {
    title: 'Webinar-Rechner',
    subtitle: 'Erstgespräche für High-Ticket',
    fields: [
      { key: 'productPrice', label: 'Produkt-Preis (netto)', unit: '€', default: 2500 },
      { key: 'adSpend', label: 'Ad-Spend', unit: '€', default: 5000 },
      { key: 'leadPrice', label: 'Lead-Preis', unit: '€', default: 15, step: 0.5 },
      { key: 'organicLeads', label: 'Organische Leads', unit: 'Leads', default: 50 },
    ],
    rates: [
      { key: 'showUpRate', label: 'Show-Up Rate', default: 0.30, benchmark: 0.35 },
      { key: 'erstgesprächeRate', label: 'Erstgespräche-Quote', default: 0.15, benchmark: 0.15 },
      { key: 'zweitgesprächeRate', label: 'Zweitgespräche-Quote', default: 0.30, benchmark: 0.30 },
      { key: 'salesRate', label: 'Abschlussquote (Zweitgespräch → Sale)', default: 0.66, benchmark: 0.66 },
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
          { label: 'Auftragsvolumen', value: fmtCurrency.format(auftragsvolumen), primary: true },
          { label: 'Gewinn', value: fmtCurrency.format(gewinn), negative: gewinn < 0 },
          { label: 'Cashflow (30%)', value: fmtCurrency.format(cashflow) },
          { label: 'ROAS', value: `${roas.toLocaleString('de-DE', { maximumFractionDigits: 2 })}x` },
        ],
      };
    },
  },

  webinarBestellformular: {
    title: 'Webinar-Rechner',
    subtitle: 'Sales über Bestellformular (Produkt unter 1.000 €)',
    fields: [
      { key: 'productPrice', label: 'Produkt-Preis (netto)', unit: '€', default: 779 },
      { key: 'adSpend', label: 'Ad-Spend', unit: '€', default: 5000 },
      { key: 'leadPrice', label: 'Lead-Preis', unit: '€', default: 15, step: 0.5 },
      { key: 'organicLeads', label: 'Organische Leads', unit: 'Leads', default: 100 },
    ],
    rates: [
      { key: 'showUpRate', label: 'Show-Up Rate', default: 0.30, benchmark: 0.30 },
      { key: 'salesRate', label: 'Abschlussquote (Show-Up → Sale)', default: 0.10, benchmark: 0.10 },
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
          { label: 'Auftragsvolumen', value: fmtCurrency.format(auftragsvolumen), primary: true },
          { label: 'Gewinn', value: fmtCurrency.format(gewinn), negative: gewinn < 0 },
          { label: 'Cashflow (30%)', value: fmtCurrency.format(cashflow) },
          { label: 'ROAS', value: `${roas.toLocaleString('de-DE', { maximumFractionDigits: 2 })}x` },
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
              <label>${f.label}</label>
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
                <label>${r.label}</label>
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
      <div class="kpi-label">${kpi.label}</div>
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

renderCalc(activeCalc);

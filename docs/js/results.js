/* ============================================================
   results.js – Renders the recommendation and to-do checklist
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const data = loadAssessment();

  if (!data) {
    // No assessment data – redirect to assessment
    document.getElementById('no-data-msg').hidden = false;
    document.getElementById('results-content').hidden = true;
    return;
  }

  const result = recommend(data);
  renderResultHero(result);
  renderKeyNumbers(result);
  renderReasons(result);
  renderConcerns(result);
  renderChapterDetails(result.chapter);
  renderChecklist(result.chapter);
  renderChapterComparison(result.chapter);
  renderPrintBtn();
});

// ── Hero box ─────────────────────────────────────────────────
function renderResultHero(result) {
  const info = CHAPTER_INFO[result.chapter];
  const el   = document.getElementById('result-hero');
  if (!el) return;

  const pct = result.confidence;

  el.innerHTML = `
    <div class="result-chapter-label">Our Recommendation</div>
    <div class="result-chapter-name">
      <span>${info.name}</span> &mdash; ${info.subtitle}
    </div>
    <p class="result-summary">${info.description}</p>
    <div class="result-tags">
      <span class="result-tag">⏱ ${info.duration}</span>
      <span class="result-tag">💰 Filing Fee: ${info.filingFee}</span>
      <span class="result-tag">Match Score: ${pct}%</span>
    </div>
  `;
}

// ── Key financial numbers ────────────────────────────────────
function renderKeyNumbers(result) {
  const d = result.derived;
  const el = document.getElementById('key-numbers');
  if (!el) return;

  const medianLabel = d.belowMedian
    ? '<span class="badge badge-green">Below median ✓</span>'
    : '<span class="badge badge-amber">Above median</span>';

  el.innerHTML = `
    <div class="card">
      <div class="card-subtitle">Annual Income</div>
      <div style="font-size:1.4rem;font-weight:800;color:var(--gray-900)">$${fmt(d.annualGross)}</div>
      <div class="text-sm text-muted mt-1">State median: $${fmt(d.stateMedian)} ${medianLabel}</div>
    </div>
    <div class="card">
      <div class="card-subtitle">Total Debt</div>
      <div style="font-size:1.4rem;font-weight:800;color:var(--gray-900)">$${fmt(d.totalDebt)}</div>
      <div class="text-sm text-muted mt-1">
        Unsecured: $${fmt(d.unsecuredDebt)} &bull; Secured: $${fmt(d.securedDebt)}
      </div>
    </div>
    <div class="card">
      <div class="card-subtitle">Monthly Disposable Income</div>
      <div style="font-size:1.4rem;font-weight:800;color:var(--gray-900)">$${fmt(d.monthlyDisposable)}</div>
      <div class="text-sm text-muted mt-1">Means Test Amount (×60): $${fmt(d.meansTestAmt)}</div>
    </div>
  `;
}

// ── Why this recommendation ──────────────────────────────────
function renderReasons(result) {
  const el = document.getElementById('reasons-list');
  if (!el || !result.reasons.length) return;

  el.innerHTML = result.reasons.map(r => `
    <li class="checklist-item" style="border-bottom:1px solid var(--gray-100);padding:.65rem 0">
      <span style="color:var(--green-500);font-size:1.1rem;flex-shrink:0">✓</span>
      <span style="font-size:.9rem;color:var(--gray-700)">${r}</span>
    </li>
  `).join('');
}

// ── Concerns & special flags ─────────────────────────────────
function renderConcerns(result) {
  const wrap = document.getElementById('concerns-wrap');
  const list  = document.getElementById('concerns-list');
  if (!wrap || !list || !result.concerns.length) {
    if (wrap) wrap.hidden = true;
    return;
  }
  wrap.hidden = false;
  list.innerHTML = result.concerns.map(c => `
    <li style="padding:.5rem 0;font-size:.875rem;color:var(--gray-700);border-bottom:1px solid var(--amber-100)">${c}</li>
  `).join('');
}

// ── Chapter detail cards ─────────────────────────────────────
function renderChapterDetails(chapter) {
  const info = CHAPTER_INFO[chapter];
  const el   = document.getElementById('chapter-details');
  if (!el) return;

  const prosHtml  = info.pros.map(p  => `<li style="padding:.35rem 0;font-size:.875rem;color:var(--gray-700);border-bottom:1px solid var(--gray-100)"><span style="color:var(--green-500);margin-right:.4rem">✓</span>${p}</li>`).join('');
  const consHtml  = info.cons.map(c  => `<li style="padding:.35rem 0;font-size:.875rem;color:var(--gray-700);border-bottom:1px solid var(--gray-100)"><span style="color:var(--red-700);margin-right:.4rem">✗</span>${c}</li>`).join('');
  const qualHtml  = info.whoQualifies.map(q => `<li style="padding:.35rem 0;font-size:.875rem;color:var(--gray-700);border-bottom:1px solid var(--gray-100)"><span style="color:var(--blue-700);margin-right:.4rem">→</span>${q}</li>`).join('');

  el.innerHTML = `
    <div class="grid-3">
      <div class="card card--green">
        <div class="card-title" style="color:var(--green-700)">Advantages</div>
        <ul style="list-style:none">${prosHtml}</ul>
      </div>
      <div class="card card--red" style="border-top-color:#ef4444">
        <div class="card-title" style="color:var(--red-700)">Disadvantages</div>
        <ul style="list-style:none">${consHtml}</ul>
      </div>
      <div class="card card--accent">
        <div class="card-title" style="color:var(--blue-700)">Who Qualifies</div>
        <ul style="list-style:none">${qualHtml}</ul>
      </div>
    </div>
  `;
}

// ── To-do checklist ──────────────────────────────────────────
function renderChecklist(chapter) {
  const todos    = TODO_TEMPLATES[chapter] || [];
  const saved    = loadTodoState();
  const phases   = ['before', 'during', 'after'];
  const labels   = { before: '📋 Before You File', during: '⚖️ During Your Case', after: '🌱 After Discharge' };

  const wrap = document.getElementById('checklist-wrap');
  if (!wrap) return;

  let html = '';
  phases.forEach(phase => {
    const items = todos.filter(t => t.phase === phase);
    if (!items.length) return;

    html += `
      <div style="margin-bottom:1.75rem">
        <h3 style="font-size:1rem;font-weight:700;color:var(--gray-800);margin-bottom:.75rem;
                   border-bottom:2px solid var(--gray-200);padding-bottom:.4rem">
          ${labels[phase]}
        </h3>
        <ul class="checklist" id="phase-${phase}">
          ${items.map(item => {
            const checked = !!saved[item.id];
            return `
              <li class="checklist-item${checked ? ' done' : ''}" id="wrap-${item.id}">
                <input type="checkbox" id="${item.id}" ${checked ? 'checked' : ''}
                       onchange="toggleTodo('${item.id}')" aria-label="${escHtml(item.text)}">
                <label for="${item.id}">
                  ${escHtml(item.text)}
                  ${item.note ? `<span class="task-note">${escHtml(item.note)}</span>` : ''}
                </label>
              </li>`;
          }).join('')}
        </ul>
      </div>
    `;
  });

  wrap.innerHTML = html;
  updateChecklistProgress(chapter);
}

function toggleTodo(id) {
  const state = loadTodoState();
  const checkbox = document.getElementById(id);
  if (!checkbox) return;

  state[id] = checkbox.checked;
  saveTodoState(state);

  const li = document.getElementById('wrap-' + id);
  if (li) li.classList.toggle('done', checkbox.checked);

  // Determine chapter from current recommendation
  const data = loadAssessment();
  if (data) {
    const result = recommend(data);
    updateChecklistProgress(result.chapter);
  }
}

function updateChecklistProgress(chapter) {
  const todos  = TODO_TEMPLATES[chapter] || [];
  const state  = loadTodoState();
  const done   = todos.filter(t => state[t.id]).length;
  const total  = todos.length;

  const pctEl  = document.getElementById('todo-pct');
  const barEl  = document.getElementById('todo-bar');
  const lblEl  = document.getElementById('todo-label');

  if (pctEl)  pctEl.textContent  = `${done} / ${total} completed`;
  if (barEl)  barEl.style.width  = (total ? Math.round(done / total * 100) : 0) + '%';
  if (lblEl)  lblEl.textContent  = total ? `${Math.round(done / total * 100)}%` : '0%';
}

// ── Chapter comparison table ─────────────────────────────────
function renderChapterComparison(recommended) {
  const el = document.getElementById('compare-table-wrap');
  if (!el) return;

  const rows = [
    ['Who it\'s for',       'Individuals with mostly unsecured debt', 'Individuals with regular income', 'Businesses or high-debt individuals'],
    ['Process length',      '3 – 6 months',  '3 – 5 years',   '1 – 3+ years'],
    ['Filing fee',          '$338',           '$313',          '$1,738'],
    ['Repayment plan',      'None',           'Required',      'Required'],
    ['Keep home/car',       'Possible (if current)', 'Yes – catch up arrears', 'Yes – restructure'],
    ['Discharge unsecured', 'Yes – fully discharged', 'After plan completion', 'After plan confirmation'],
    ['Income requirement',  'Must pass Means Test', 'Regular income required', 'No specific requirement'],
    ['Debt limits',         'None',           '~$465K unsec / ~$1.4M sec', 'None'],
    ['Credit report',       '10 years',       '7 years',       '10 years'],
    ['Refile waiting period','8 years (Ch.7)', '4 years (from Ch.7)', 'Varies'],
  ];

  const highlight = (ch) => ch === recommended
    ? 'style="background:var(--blue-50);font-weight:700"'
    : '';

  el.innerHTML = `
    <div style="overflow-x:auto">
    <table class="compare-table">
      <thead>
        <tr>
          <th style="min-width:160px"></th>
          <th ${highlight(7)}>Chapter 7</th>
          <th ${highlight(13)}>Chapter 13</th>
          <th ${highlight(11)}>Chapter 11</th>
        </tr>
      </thead>
      <tbody>
        ${rows.map(([label, c7, c13, c11]) => `
          <tr>
            <td class="label-col">${label}</td>
            <td ${highlight(7)}>${c7}</td>
            <td ${highlight(13)}>${c13}</td>
            <td ${highlight(11)}>${c11}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    </div>
    <p class="text-sm text-muted mt-2">
      Highlighted column = your recommended chapter. Debt limits and fees change periodically – verify with the U.S. Trustee Program.
    </p>
  `;
}

// ── Print button ─────────────────────────────────────────────
function renderPrintBtn() {
  const el = document.getElementById('print-btn');
  if (el) el.addEventListener('click', () => window.print());
}

// ── Helpers ──────────────────────────────────────────────────
function fmt(n) {
  return Math.round(n).toLocaleString('en-US');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

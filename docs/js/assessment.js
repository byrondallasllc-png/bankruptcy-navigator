/* ============================================================
   assessment.js – Multi-step wizard for Bankruptcy Navigator
   ============================================================ */

const TOTAL_STEPS = 5;
let currentStep = 1;

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildStateDropdown();
  updateStep(1);
  attachNavListeners();
  attachLiveValidation();
  prefillFromStorage();
});

// ── State dropdown ───────────────────────────────────────────
function buildStateDropdown() {
  const sel = document.getElementById('state');
  if (!sel) return;
  US_STATES.forEach(([code, name]) => {
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = name;
    sel.appendChild(opt);
  });
}

// ── Navigation ───────────────────────────────────────────────
function attachNavListeners() {
  document.querySelectorAll('.btn-next').forEach(btn => {
    btn.addEventListener('click', () => {
      if (validateStep(currentStep)) goToStep(currentStep + 1);
    });
  });
  document.querySelectorAll('.btn-back').forEach(btn => {
    btn.addEventListener('click', () => goToStep(currentStep - 1));
  });
  const submitBtn = document.getElementById('btn-submit');
  if (submitBtn) submitBtn.addEventListener('click', submitAssessment);
}

function goToStep(step) {
  if (step < 1 || step > TOTAL_STEPS) return;
  updateStep(step);
}

function updateStep(step) {
  currentStep = step;

  // Show/hide step panels
  document.querySelectorAll('.step-panel').forEach(panel => {
    panel.hidden = parseInt(panel.dataset.step) !== step;
  });

  // Update step dots
  document.querySelectorAll('.step-dot').forEach(dot => {
    const n = parseInt(dot.dataset.step);
    dot.classList.toggle('active', n === step);
    dot.classList.toggle('done',   n < step);
  });

  // Progress bar
  const pct = Math.round(((step - 1) / TOTAL_STEPS) * 100);
  const bar = document.getElementById('progress-bar');
  if (bar) bar.style.width = pct + '%';

  // Step counter
  const counter = document.getElementById('step-counter');
  if (counter) counter.textContent = `Step ${step} of ${TOTAL_STEPS}`;

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ── Validation ───────────────────────────────────────────────
function validateStep(step) {
  let valid = true;

  // Collect required fields for this step
  const panel = document.querySelector(`.step-panel[data-step="${step}"]`);
  if (!panel) return true;

  panel.querySelectorAll('[required]').forEach(field => {
    clearError(field);
    if (!field.value.trim()) {
      showError(field, 'This field is required.');
      valid = false;
    }
  });

  // Custom validations per step
  if (step === 2) {
    const income = document.getElementById('monthlyGrossIncome');
    if (income && parseFloat(income.value) < 0) {
      showError(income, 'Please enter 0 or a positive number.');
      valid = false;
    }
  }

  if (!valid) {
    // Scroll to first error
    const firstErr = panel.querySelector('.form-control.error');
    if (firstErr) firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  return valid;
}

function showError(field, msg) {
  field.classList.add('error');
  let errEl = field.parentElement.querySelector('.error-msg');
  if (!errEl) {
    errEl = document.createElement('span');
    errEl.className = 'error-msg';
    field.parentElement.appendChild(errEl);
  }
  errEl.textContent = msg;
  errEl.classList.add('visible');
}

function clearError(field) {
  field.classList.remove('error');
  const errEl = field.parentElement.querySelector('.error-msg');
  if (errEl) errEl.classList.remove('visible');
}

function attachLiveValidation() {
  document.querySelectorAll('.form-control[required]').forEach(field => {
    field.addEventListener('input', () => {
      if (field.value.trim()) clearError(field);
    });
  });
}

// ── Prefill from storage (back button support) ────────────────
function prefillFromStorage() {
  const saved = loadAssessment();
  if (!saved) return;
  Object.keys(saved).forEach(key => {
    const el = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
    if (!el) return;
    if (el.type === 'radio') {
      const radio = document.querySelector(`input[name="${key}"][value="${saved[key]}"]`);
      if (radio) radio.checked = true;
    } else if (el.type === 'checkbox') {
      el.checked = saved[key] === true || saved[key] === 'yes';
    } else {
      el.value = saved[key];
    }
  });
}

// ── Collect form data ────────────────────────────────────────
function collectFormData() {
  const data = {};
  const form = document.getElementById('assessment-form');
  if (!form) return data;

  // Text/number/select fields
  form.querySelectorAll('input[type="text"], input[type="number"], select, textarea').forEach(el => {
    if (el.id) data[el.id] = el.value;
  });

  // Radio buttons
  form.querySelectorAll('input[type="radio"]:checked').forEach(el => {
    data[el.name] = el.value;
  });

  // Checkboxes
  form.querySelectorAll('input[type="checkbox"]').forEach(el => {
    if (el.name) data[el.name] = el.checked ? 'yes' : 'no';
  });

  return data;
}

// ── Submit ───────────────────────────────────────────────────
function submitAssessment() {
  if (!validateStep(TOTAL_STEPS)) return;

  const data = collectFormData();
  saveAssessment(data);
  window.location.href = 'results.html';
}

// ── Currency input formatting ────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('input[data-currency]').forEach(input => {
    input.addEventListener('blur', () => {
      const val = parseFloat(input.value.replace(/[^0-9.]/g, ''));
      if (!isNaN(val)) input.value = Math.round(val);
    });
    input.addEventListener('input', () => {
      // Strip non-numeric except decimal
      input.value = input.value.replace(/[^0-9.]/g, '');
    });
  });
});

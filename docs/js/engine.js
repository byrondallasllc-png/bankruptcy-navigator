/* ============================================================
   engine.js – Bankruptcy Chapter Recommendation Engine
   ============================================================
   DISCLAIMER: This is an educational tool only. It provides
   a general indication based on simplified rules. Always
   consult a licensed bankruptcy attorney.
   ============================================================ */

// Chapter 13 debt limits (verify current figures with UST)
const CH13_UNSECURED_LIMIT = 465275;
const CH13_SECURED_LIMIT   = 1395875;

// Means-test thresholds (disposable income × 60 months)
const MEANS_TEST_CLEAR    = 7700;   // below → Ch.7 likely OK
const MEANS_TEST_FAIL     = 12850;  // above → Ch.7 presumed abusive

/**
 * Run the recommendation algorithm.
 * @param {Object} d – form data from the assessment wizard
 * @returns {Object} result with chapter, confidence, reasons, concerns, flags
 */
function recommend(d) {
  // ── Derived numbers ───────────────────────────────────────
  const monthlyGross = parseFloat(d.monthlyGrossIncome) || 0;
  const annualGross  = monthlyGross * 12;
  const householdSz  = parseInt(d.householdSize) || 1;
  const stateCode    = d.state || 'CA';

  const stateMedian  = getStateMedian(stateCode, householdSz);
  const belowMedian  = annualGross <= stateMedian;

  const unsecuredDebt = (parseFloat(d.creditCardDebt)  || 0)
                      + (parseFloat(d.medicalDebt)      || 0)
                      + (parseFloat(d.taxDebt)           || 0)
                      + (parseFloat(d.studentLoanDebt)   || 0);

  const securedDebt   = (parseFloat(d.mortgageBalance)  || 0)
                      + (parseFloat(d.carLoanBalance)    || 0);

  const totalDebt     = unsecuredDebt + securedDebt + (parseFloat(d.businessDebt) || 0);

  const monthlyExpenses = parseFloat(d.monthlyExpenses) || 0;
  const monthlyDisposable = Math.max(0, monthlyGross - monthlyExpenses);
  const meansTestAmt      = monthlyDisposable * 60;

  // ── Flags ─────────────────────────────────────────────────
  const isBusinessOwner     = d.isBusinessOwner === 'yes';
  const hasRegularIncome    = d.hasRegularIncome === 'yes';
  const wantsToSaveHome     = d.behindOnMortgage === 'yes' || d.facingForeclosure === 'yes';
  const wantsToSaveCar      = d.behindOnCar === 'yes';
  const priorBankruptcy     = d.priorBankruptcy === 'yes';
  const priorCh7            = d.priorBankruptcyChapter === '7';
  const exceedsUnsecLimit   = unsecuredDebt > CH13_UNSECURED_LIMIT;
  const exceedsSecLimit     = securedDebt   > CH13_SECURED_LIMIT;
  const exceedsCh13Limits   = exceedsUnsecLimit || exceedsSecLimit;

  // ── Scoring ───────────────────────────────────────────────
  let ch7Score  = 0;
  let ch13Score = 0;
  let ch11Score = 0;

  const ch7Reasons  = [];
  const ch13Reasons = [];
  const ch11Reasons = [];
  const concerns    = [];
  const flags       = {};

  // --- Chapter 11 signals ---
  if (isBusinessOwner) {
    ch11Score += 4;
    ch11Reasons.push('You are a business owner – Chapter 11 allows restructuring while continuing operations.');
  }
  if (exceedsCh13Limits) {
    ch11Score += 5;
    ch11Reasons.push(
      exceedsUnsecLimit
        ? `Your unsecured debt ($${fmt(unsecuredDebt)}) exceeds the Chapter 13 unsecured limit (~$465,275).`
        : `Your secured debt ($${fmt(securedDebt)}) exceeds the Chapter 13 secured limit (~$1,395,875).`
    );
  }

  // --- Chapter 13 signals ---
  if (hasRegularIncome) {
    ch13Score += 2;
    ch13Reasons.push('You have regular income, which is required for Chapter 13.');
  }
  if (wantsToSaveHome) {
    ch13Score += 4;
    ch13Reasons.push('You are behind on your mortgage or facing foreclosure – Chapter 13 lets you catch up on arrears and save your home.');
    flags.saveHome = true;
  }
  if (wantsToSaveCar) {
    ch13Score += 2;
    ch13Reasons.push('You are behind on car payments – Chapter 13 can cure the arrears and let you keep your vehicle.');
    flags.saveCar = true;
  }
  if (!belowMedian && meansTestAmt > MEANS_TEST_CLEAR) {
    ch13Score += 3;
    ch13Reasons.push('Your income is above the state median and you have meaningful disposable income, making Chapter 7 harder to qualify for.');
  }
  if (d.primaryGoal === 'save-home' || d.primaryGoal === 'restructure') {
    ch13Score += 2;
    ch13Reasons.push('Your stated goal aligns with Chapter 13\'s structured repayment approach.');
  }

  // --- Chapter 7 signals ---
  if (belowMedian) {
    ch7Score += 4;
    ch7Reasons.push(`Your income ($${fmt(annualGross)}/yr) is at or below the ${stateCode} median ($${fmt(stateMedian)}/yr) for a ${householdSz}-person household.`);
    flags.belowMedian = true;
  }
  if (!hasRegularIncome) {
    ch7Score += 2;
    ch7Reasons.push('Without regular income, the structured payments of Chapter 13 may be difficult to sustain.');
  }
  if (!wantsToSaveHome && !wantsToSaveCar) {
    ch7Score += 1;
    ch7Reasons.push('You are not trying to save a home or car from foreclosure/repossession, which is a key advantage of Chapter 13.');
  }
  if (meansTestAmt < MEANS_TEST_CLEAR) {
    ch7Score += 3;
    ch7Reasons.push('Your disposable income after expenses is low, which supports Chapter 7 eligibility under the Means Test.');
    flags.meansTestOk = true;
  }
  if (d.primaryGoal === 'eliminate-debt') {
    ch7Score += 2;
    ch7Reasons.push('Your goal of eliminating debt quickly aligns with Chapter 7\'s discharge process.');
  }
  if (d.willingToSurrenderAssets === 'yes') {
    ch7Score += 1;
    ch7Reasons.push('You indicated willingness to surrender non-exempt assets, which is consistent with Chapter 7.');
  }

  // --- Concerns to flag ---
  if (priorBankruptcy && priorCh7) {
    concerns.push('⚠️ You had a prior Chapter 7 discharge. You must wait 8 years from the prior filing date before filing Chapter 7 again.');
    ch7Score -= 5;
    ch13Score += 2;
    flags.priorCh7 = true;
  }
  if (priorBankruptcy && !priorCh7) {
    concerns.push('⚠️ Your prior bankruptcy may affect automatic stay protection and discharge eligibility. Discuss with your attorney.');
    flags.priorBankruptcy = true;
  }
  if ((parseFloat(d.taxDebt) || 0) > 0) {
    concerns.push('ℹ️ Tax debt: Most income tax debt is not dischargeable in Chapter 7 unless it is 3+ years old, was filed on time, and meets other IRS tests. Discuss with your attorney.');
    flags.taxDebt = true;
  }
  if ((parseFloat(d.studentLoanDebt) || 0) > 0) {
    concerns.push('ℹ️ Student loan debt is generally not dischargeable in bankruptcy except in cases of "undue hardship" (very rare). Explore Income-Driven Repayment plans as an alternative.');
    flags.studentLoan = true;
  }
  if (d.hasLawsuits === 'yes') {
    concerns.push('ℹ️ Active lawsuits: Filing bankruptcy will trigger an automatic stay, halting most pending lawsuits immediately.');
    flags.lawsuits = true;
  }
  if (d.hasGarnishment === 'yes') {
    concerns.push('ℹ️ Wage garnishment: Filing will stop garnishment immediately via the automatic stay.');
    flags.garnishment = true;
  }
  if (totalDebt < 5000) {
    concerns.push('ℹ️ Your total debt appears low. Consider whether alternatives (negotiation, debt consolidation, payment plans) might be preferable to bankruptcy.');
    flags.lowDebt = true;
  }

  // ── Determine recommendation ──────────────────────────────
  let chapter, primaryReasons, confidence;

  if (ch11Score >= 5 && (isBusinessOwner || exceedsCh13Limits)) {
    chapter        = 11;
    primaryReasons = ch11Reasons;
    confidence     = Math.min(95, 60 + ch11Score * 4);
  } else if (ch13Score > ch7Score + 1 || wantsToSaveHome) {
    chapter        = 13;
    primaryReasons = ch13Reasons;
    confidence     = Math.min(92, 55 + ch13Score * 4);
  } else if (ch7Score >= ch13Score) {
    chapter        = 7;
    primaryReasons = ch7Reasons;
    confidence     = Math.min(92, 55 + ch7Score * 4);
  } else {
    chapter        = 13;
    primaryReasons = ch13Reasons;
    confidence     = Math.min(85, 55 + ch13Score * 3);
  }

  // ── Build result object ───────────────────────────────────
  return {
    chapter,
    confidence,
    reasons:     primaryReasons,
    concerns,
    flags,
    scores:      { ch7: ch7Score, ch13: ch13Score, ch11: ch11Score },
    derived: {
      annualGross,
      stateMedian,
      belowMedian,
      unsecuredDebt,
      securedDebt,
      totalDebt,
      monthlyDisposable,
      meansTestAmt,
      exceedsCh13Limits,
    },
    inputData: d,
  };
}

// ── Helpers ──────────────────────────────────────────────────
function fmt(n) {
  return Math.round(n).toLocaleString('en-US');
}

/** Serialize assessment data to localStorage */
function saveAssessment(data) {
  localStorage.setItem('bn_assessment', JSON.stringify(data));
}

/** Load assessment data from localStorage */
function loadAssessment() {
  try {
    return JSON.parse(localStorage.getItem('bn_assessment') || 'null');
  } catch {
    return null;
  }
}

/** Save todo state (checked items) */
function saveTodoState(state) {
  localStorage.setItem('bn_todos', JSON.stringify(state));
}

/** Load todo state */
function loadTodoState() {
  try {
    return JSON.parse(localStorage.getItem('bn_todos') || '{}');
  } catch {
    return {};
  }
}

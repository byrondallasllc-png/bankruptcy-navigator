/* ============================================================
   data.js – Static reference data for Bankruptcy Navigator
   ============================================================ */

// ── State Median Income (Annual) ─────────────────────────────
// Source: Approximate UST figures (verify current figures at
// https://www.justice.gov/ust/means-testing).
// Format per state: [1-person, 2-person, 3-person, 4-person]
// For 5+ persons add EXTRA_PER_PERSON per additional person.
const EXTRA_PER_PERSON = 9000;

const STATE_MEDIANS = {
  'AL': [47991,  63988,  72854,  86785],
  'AK': [60468,  80536,  90604, 105208],
  'AZ': [56020,  74614,  83872,  98765],
  'AR': [42769,  56988,  65034,  78052],
  'CA': [66477,  88508, 100411, 117024],
  'CO': [65521,  87288, 100052, 115877],
  'CT': [67846,  90370, 103912, 120765],
  'DE': [63019,  83965,  96344, 111452],
  'DC': [78929, 105151, 122387, 141000],
  'FL': [52891,  70448,  80659,  93878],
  'GA': [53736,  71574,  82106,  95424],
  'HI': [71075,  94659, 108768, 126346],
  'ID': [52826,  70370,  80724,  93870],
  'IL': [60540,  80657,  92534, 107606],
  'IN': [51900,  69126,  79282,  92224],
  'IA': [56039,  74640,  85611,  99540],
  'KS': [54523,  72635,  83342,  96905],
  'KY': [48461,  64523,  74004,  86054],
  'LA': [45615,  60745,  69710,  81070],
  'ME': [57840,  77027,  88378, 102739],
  'MD': [73884,  98381, 112889, 131233],
  'MA': [74015,  98553, 113092, 131497],
  'MI': [53940,  71832,  82385,  95808],
  'MN': [67046,  89301, 102450, 119074],
  'MS': [39890,  53132,  60949,  70878],
  'MO': [51422,  68490,  78539,  91307],
  'MT': [52527,  69936,  80232,  93320],
  'NE': [58128,  77430,  88824, 103252],
  'NV': [55434,  73822,  84702,  98504],
  'NH': [72561,  96612, 110830, 128847],
  'NJ': [74140,  98773, 113291, 131700],
  'NM': [46348,  61698,  70795,  82317],
  'NY': [65326,  87009,  99836, 116095],
  'NC': [52696,  70165,  80488,  93604],
  'ND': [60752,  80898,  92820, 107920],
  'OH': [52407,  69784,  80070,  93107],
  'OK': [48688,  64834,  74389,  86490],
  'OR': [60553,  80675,  92560, 107634],
  'PA': [57752,  76923,  88260, 102617],
  'RI': [64714,  86168,  98876, 114966],
  'SC': [51016,  67934,  77952,  90654],
  'SD': [54765,  72937,  83676,  97289],
  'TN': [50419,  67143,  77033,  89575],
  'TX': [55087,  73349,  84148,  97866],
  'UT': [60016,  79922,  91689, 106618],
  'VT': [62096,  82738,  94943, 110384],
  'VA': [67291,  89628, 102845, 119618],
  'WA': [71671,  95437, 109505, 127322],
  'WV': [44097,  58726,  67385,  78365],
  'WI': [60081,  80012,  91804, 106762],
  'WY': [59295,  78944,  90561, 105287],
};

function getStateMedian(stateCode, householdSize) {
  const row = STATE_MEDIANS[stateCode];
  if (!row) return 60000; // fallback
  const size = Math.max(1, Math.min(parseInt(householdSize) || 1, 8));
  if (size <= 4) return row[size - 1];
  return row[3] + (size - 4) * EXTRA_PER_PERSON;
}

// ── Chapter information ──────────────────────────────────────
const CHAPTER_INFO = {
  7: {
    name: 'Chapter 7',
    subtitle: 'Liquidation / Fresh Start',
    color: 'green',
    duration: '3 – 6 months',
    filingFee: '$338',
    description:
      'Chapter 7 is the fastest form of bankruptcy. A court-appointed trustee reviews your assets, ' +
      'liquidates any non-exempt property to repay creditors, and discharges most remaining unsecured debts ' +
      '(credit cards, medical bills, personal loans). It stays on your credit report for 10 years.',
    pros: [
      'Fastest process – typically complete in 3–6 months',
      'Most unsecured debts fully discharged',
      'No repayment plan required',
      'Stops collection calls, garnishments, and lawsuits immediately',
    ],
    cons: [
      'Non-exempt assets may be liquidated',
      'Must pass the Means Test',
      'Cannot discharge student loans, alimony, child support, or most taxes',
      'Remains on credit report for 10 years',
      'Cannot refile for 8 years',
    ],
    whoQualifies: [
      'Income at or below state median for household size',
      'Primarily unsecured debt (credit cards, medical)',
      'Limited non-exempt assets',
      'No prior Chapter 7 discharge in last 8 years',
    ],
  },
  13: {
    name: 'Chapter 13',
    subtitle: 'Reorganization / Wage-Earner Plan',
    color: 'blue',
    duration: '3 – 5 years',
    filingFee: '$313',
    description:
      'Chapter 13 lets you keep your assets and catch up on mortgage or car arrears through a ' +
      'court-confirmed 3–5 year repayment plan. At the end of the plan, remaining eligible unsecured debts ' +
      'are discharged. It stays on your credit report for 7 years.',
    pros: [
      'Keep your home, car, and other assets',
      'Catch up on mortgage arrears and stop foreclosure',
      'Discharge remaining unsecured debt after plan completion',
      'More flexible for higher-income filers',
      'Remains on credit report for only 7 years',
    ],
    cons: [
      'Long commitment (3–5 years of payments)',
      'Must have regular, reliable income',
      'Monthly plan payments are mandatory',
      'More complex and costly legal fees',
      'Debt limits apply (see current UST thresholds)',
    ],
    whoQualifies: [
      'Regular, stable income',
      'Want to save home from foreclosure or car from repossession',
      'Unsecured debt below ~$465,275',
      'Secured debt below ~$1,395,875',
      'Income above Chapter 7 means-test threshold',
    ],
  },
  11: {
    name: 'Chapter 11',
    subtitle: 'Business Reorganization',
    color: 'amber',
    duration: '1 – 3+ years',
    filingFee: '$1,738',
    description:
      'Chapter 11 is used primarily by businesses but also by high-debt individuals whose debts exceed ' +
      'Chapter 13 limits. A reorganization plan is filed with the court, creditors vote, and the plan is ' +
      'confirmed by the judge. The Subchapter V small-business option simplifies the process for small businesses.',
    pros: [
      'Business continues operating during reorganization',
      'No debt limits (unlike Chapter 13)',
      'Flexible restructuring of large debts',
      'Subchapter V (small business) is faster and less expensive',
    ],
    cons: [
      'Extremely complex – experienced attorney essential',
      'High legal and professional fees',
      'Long process – can take years',
      'Court and creditor oversight throughout',
    ],
    whoQualifies: [
      'Business owners needing to restructure',
      'Individuals with debt exceeding Chapter 13 limits',
      'Those who need to reorganize rather than liquidate',
    ],
  },
};

// ── To-Do Templates ──────────────────────────────────────────
// id, text, note (optional), phase ('before'|'during'|'after')
const TODO_TEMPLATES = {
  7: [
    // === BEFORE FILING ===
    { id: 'c7-cc',       phase: 'before', text: 'Complete court-approved Credit Counseling course',
      note: 'Required within 180 days before filing. Cost: ~$15–$50. Must use an approved agency.' },
    { id: 'c7-docs',     phase: 'before', text: 'Gather all financial documents',
      note: '6 months of pay stubs, last 2 years of tax returns, bank statements, mortgage/loan statements.' },
    { id: 'c7-credlist', phase: 'before', text: 'List every creditor with name, address, and balance owed',
      note: 'Pull your free credit reports at AnnualCreditReport.com to catch all accounts.' },
    { id: 'c7-assets',   phase: 'before', text: 'Inventory all assets and their current market values',
      note: 'Include home, vehicles, bank accounts, retirement accounts, electronics, jewelry, etc.' },
    { id: 'c7-exempt',   phase: 'before', text: 'Research your state\'s exemption laws',
      note: 'Exemptions protect certain property. Your attorney will help maximize these.' },
    { id: 'c7-atty',     phase: 'before', text: 'Consult with a bankruptcy attorney',
      note: 'Average Ch. 7 attorney fee: $1,000–$3,500. Many offer free consultations.' },
    { id: 'c7-means',    phase: 'before', text: 'Complete the Means Test (Form 122A-1)',
      note: 'Compares your income to state median. Required to confirm Chapter 7 eligibility.' },

    // === FILING ===
    { id: 'c7-petition', phase: 'during', text: 'File the bankruptcy petition and schedules with the court',
      note: 'Forms include: B101 (Voluntary Petition), Schedules A/B–J, Statement of Financial Affairs.' },
    { id: 'c7-fee',      phase: 'during', text: 'Pay the $338 filing fee (or apply for waiver / installments)',
      note: 'Low-income filers may qualify for a fee waiver (Form B3B) or installment plan (Form B3A).' },
    { id: 'c7-stay',     phase: 'during', text: 'Notify creditors of the automatic stay',
      note: 'Filing immediately halts collections, calls, garnishments, and foreclosure actions.' },
    { id: 'c7-trustee',  phase: 'during', text: 'Attend the 341 Meeting of Creditors',
      note: 'Typically 20–40 days after filing. A brief ~10-min hearing; creditors rarely attend.' },
    { id: 'c7-coop',     phase: 'during', text: 'Cooperate with the trustee and provide any requested documents' },

    // === AFTER FILING ===
    { id: 'c7-debed',    phase: 'after',  text: 'Complete the Debtor Education course',
      note: 'Required before discharge. Covers personal financial management. Cost: ~$15–$50.' },
    { id: 'c7-discharge',phase: 'after',  text: 'Receive your Discharge Order',
      note: 'Usually issued 60–90 days after the 341 meeting. This legally eliminates your dischargeable debts.' },
    { id: 'c7-reports',  phase: 'after',  text: 'Pull all 3 credit reports and dispute inaccurate balances',
      note: 'Discharged accounts should show $0 balance. Dispute errors at Equifax, Experian, TransUnion.' },
    { id: 'c7-rebuild',  phase: 'after',  text: 'Begin credit rebuilding (see Resources page)',
      note: 'Open a secured credit card, make on-time payments, keep utilization low.' },
  ],

  13: [
    // === BEFORE FILING ===
    { id: 'c13-cc',       phase: 'before', text: 'Complete court-approved Credit Counseling course',
      note: 'Required within 180 days before filing from an approved agency.' },
    { id: 'c13-docs',     phase: 'before', text: 'Gather all financial documents',
      note: '6 months of pay stubs, last 2 years of tax returns, bank/mortgage/loan statements.' },
    { id: 'c13-credlist', phase: 'before', text: 'List every creditor with name, address, balance, and priority',
      note: 'Separate priority claims (taxes, domestic support) from secured and unsecured claims.' },
    { id: 'c13-budget',   phase: 'before', text: 'Create a detailed monthly budget (income vs. expenses)',
      note: 'Your plan payment is based on disposable income. Accuracy is critical.' },
    { id: 'c13-atty',     phase: 'before', text: 'Hire a bankruptcy attorney to draft your repayment plan',
      note: 'Ch. 13 is complex. Attorney fees average $3,000–$6,000 but are often paid through the plan.' },
    { id: 'c13-plan',     phase: 'before', text: 'Draft and review your 36–60 month repayment plan',
      note: 'Plan must pay priority claims in full, protect secured assets, and pay disposable income to unsecured.' },

    // === FILING ===
    { id: 'c13-petition', phase: 'during', text: 'File the bankruptcy petition, schedules, and proposed plan',
      note: 'You have 14 days from filing the petition to file the full plan if not filed simultaneously.' },
    { id: 'c13-fee',      phase: 'during', text: 'Pay the $313 filing fee (or request installments)',
      note: 'Cannot be waived in Chapter 13 but may be paid in up to 4 installments.' },
    { id: 'c13-payments', phase: 'during', text: 'Begin making plan payments to the trustee within 30 days of filing',
      note: 'Payments start BEFORE plan confirmation. Failure to pay can result in dismissal.' },
    { id: 'c13-341',      phase: 'during', text: 'Attend the 341 Meeting of Creditors',
      note: 'Held 21–50 days after filing. Creditors have 70 days to file objections.' },
    { id: 'c13-confirm',  phase: 'during', text: 'Attend the Plan Confirmation Hearing',
      note: 'Court confirms (approves) your plan. Your attorney argues for confirmation if objections arise.' },
    { id: 'c13-taxes',    phase: 'during', text: 'File all required tax returns during the plan',
      note: 'Must stay current on tax filings and payments throughout the plan period.' },
    { id: 'c13-continue', phase: 'during', text: 'Continue making all monthly plan payments on time',
      note: 'Missing payments can get your case dismissed. Contact your attorney ASAP if income changes.' },

    // === AFTER PLAN ===
    { id: 'c13-debed',    phase: 'after',  text: 'Complete the Debtor Education course',
      note: 'Required before discharge. Must be taken from an approved provider.' },
    { id: 'c13-cert',     phase: 'after',  text: 'File Certification of Plan Completion with the court' },
    { id: 'c13-discharge',phase: 'after',  text: 'Receive your Discharge Order',
      note: 'Remaining eligible unsecured debts are discharged after you complete the plan.' },
    { id: 'c13-reports',  phase: 'after',  text: 'Pull all 3 credit reports and dispute inaccurate entries',
      note: 'Ch. 13 stays on report 7 years from filing date. Verify all accounts show correct status.' },
    { id: 'c13-rebuild',  phase: 'after',  text: 'Begin credit rebuilding (see Resources page)' },
  ],

  11: [
    { id: 'c11-atty',     phase: 'before', text: 'Retain an experienced Chapter 11 bankruptcy attorney',
      note: 'Chapter 11 is highly complex. Legal fees can range from $15,000 to $100,000+.' },
    { id: 'c11-cc',       phase: 'before', text: 'Complete credit counseling (individuals only)',
      note: 'Not required for business entities, but required for individual filers.' },
    { id: 'c11-docs',     phase: 'before', text: 'Prepare comprehensive financial statements and records',
      note: 'Balance sheet, income statement, cash flow projections, full creditor list.' },
    { id: 'c11-subv',     phase: 'before', text: 'Determine if Subchapter V (small business) applies',
      note: 'Subchapter V is faster and cheaper for businesses with under ~$3M in debt.' },
    { id: 'c11-petition', phase: 'during', text: 'File the petition, schedules, and Statement of Financial Affairs',
      note: 'Fee: $1,738. Must also file list of 20 largest unsecured creditors.' },
    { id: 'c11-dip',      phase: 'during', text: 'Operate as Debtor-in-Possession (DIP) and follow court rules',
      note: 'Must open DIP bank accounts, file monthly operating reports, and get court approval for major decisions.' },
    { id: 'c11-341',      phase: 'during', text: 'Attend the 341 Meeting of Creditors' },
    { id: 'c11-committee',phase: 'during', text: 'Engage with creditors\' committee (if formed)',
      note: 'Larger cases may have an official unsecured creditors\' committee that negotiates plan terms.' },
    { id: 'c11-disclosure',phase: 'during', text: 'File and obtain court approval for Disclosure Statement',
      note: 'The Disclosure Statement describes the reorganization plan and must be approved before creditor voting.' },
    { id: 'c11-plan',     phase: 'during', text: 'File your Plan of Reorganization',
      note: 'Creditors vote on the plan. Court confirms if it meets legal requirements.' },
    { id: 'c11-confirm',  phase: 'during', text: 'Attend Plan Confirmation Hearing',
      note: '"Cramdown" may be available if some creditor classes reject the plan.' },
    { id: 'c11-implement',phase: 'during', text: 'Implement the confirmed plan and make required payments' },
    { id: 'c11-final',    phase: 'after',  text: 'Obtain Final Decree closing the case',
      note: 'Filed after substantially consummating the plan. Court reviews and closes the case.' },
    { id: 'c11-reports',  phase: 'after',  text: 'Pull credit reports and verify accuracy' },
    { id: 'c11-rebuild',  phase: 'after',  text: 'Begin financial and credit rebuilding' },
  ],
};

// ── Post-Bankruptcy Resources ────────────────────────────────
const RESOURCES = {
  creditMonitoring: [
    { name: 'AnnualCreditReport.com', desc: 'Official site for free weekly credit reports from all 3 bureaus (Equifax, Experian, TransUnion)', tag: 'Free', url: '#' },
    { name: 'Credit Karma', desc: 'Free credit monitoring with score alerts and TransUnion / Equifax updates', tag: 'Free', url: '#' },
    { name: 'Experian Free', desc: 'Free FICO score + credit monitoring directly from Experian', tag: 'Free', url: '#' },
  ],
  securedCards: [
    { name: 'Discover it® Secured', desc: 'No annual fee, earns cash back, automatic review for unsecured upgrade after 7 months', tag: 'Recommended', url: '#' },
    { name: 'Capital One Platinum Secured', desc: 'Low minimum deposit ($49–$200), automatic credit limit review after 6 months', tag: 'Recommended', url: '#' },
    { name: 'OpenSky® Secured Visa', desc: 'No credit check required, reports to all 3 bureaus', tag: 'No Check', url: '#' },
    { name: 'Chime Credit Builder', desc: 'No annual fee, no credit check, no minimum security deposit – uses your own money', tag: 'No Check', url: '#' },
  ],
  creditBuilderLoans: [
    { name: 'Self (formerly Self Lender)', desc: 'Credit-builder loan that reports to all 3 bureaus. Funds are saved in a CD – you get them at the end', tag: 'Popular', url: '#' },
    { name: 'Local Credit Unions', desc: 'Many credit unions offer small credit-builder loans ($300–$1,000) at low interest rates', tag: 'Low Rate', url: '#' },
  ],
  education: [
    { name: 'NFCC – National Foundation for Credit Counseling', desc: 'Free and low-cost credit counseling, budgeting help, and debt management plans', tag: 'Free', url: '#' },
    { name: 'Consumer Financial Protection Bureau (CFPB)', desc: 'Official government guides on rebuilding credit and managing debt', tag: 'Gov', url: '#' },
    { name: 'USCourts.gov – Bankruptcy Basics', desc: 'Official federal court guide to the bankruptcy process, forms, and FAQs', tag: 'Official', url: '#' },
    { name: 'Khan Academy – Personal Finance', desc: 'Free video course covering budgeting, credit, investing, and building wealth', tag: 'Free', url: '#' },
  ],
  legal: [
    { name: 'Legal Services Corporation', desc: 'Find free legal help for low-income individuals including bankruptcy assistance', tag: 'Free Legal', url: '#' },
    { name: 'NACBA – National Assoc. of Consumer Bankruptcy Attorneys', desc: 'Directory to find qualified bankruptcy attorneys in your area', tag: 'Find Atty', url: '#' },
    { name: 'Upsolve.org', desc: 'Free tool to help low-income filers complete Chapter 7 paperwork without an attorney', tag: 'Free Tool', url: '#' },
  ],
};

// ── US States list ───────────────────────────────────────────
const US_STATES = [
  ['AL','Alabama'],['AK','Alaska'],['AZ','Arizona'],['AR','Arkansas'],
  ['CA','California'],['CO','Colorado'],['CT','Connecticut'],['DE','Delaware'],
  ['DC','District of Columbia'],['FL','Florida'],['GA','Georgia'],['HI','Hawaii'],
  ['ID','Idaho'],['IL','Illinois'],['IN','Indiana'],['IA','Iowa'],
  ['KS','Kansas'],['KY','Kentucky'],['LA','Louisiana'],['ME','Maine'],
  ['MD','Maryland'],['MA','Massachusetts'],['MI','Michigan'],['MN','Minnesota'],
  ['MS','Mississippi'],['MO','Missouri'],['MT','Montana'],['NE','Nebraska'],
  ['NV','Nevada'],['NH','New Hampshire'],['NJ','New Jersey'],['NM','New Mexico'],
  ['NY','New York'],['NC','North Carolina'],['ND','North Dakota'],['OH','Ohio'],
  ['OK','Oklahoma'],['OR','Oregon'],['PA','Pennsylvania'],['RI','Rhode Island'],
  ['SC','South Carolina'],['SD','South Dakota'],['TN','Tennessee'],['TX','Texas'],
  ['UT','Utah'],['VT','Vermont'],['VA','Virginia'],['WA','Washington'],
  ['WV','West Virginia'],['WI','Wisconsin'],['WY','Wyoming'],
];

export interface LmsLesson {
  id: string;
  partId: 'part-1' | 'part-2' | 'part-3' | 'ai-lab';
  title: string;
  duration: string;
  durationMinutes: number;
  instructor: string;
  domain: string;
  description: string;
  keyTakeaways: string[];
  handoutName: string;
  handoutSize: string;
  sampleTranscript: string;
  videoPoster: string;
}

export interface LmsModule {
  id: string;
  partId: 'part-1' | 'part-2' | 'part-3' | 'ai-lab';
  moduleNumber: number;
  title: string;
  description: string;
  lessons: LmsLesson[];
}

export interface LmsMcqQuestion {
  id: string;
  partId: 'part-1' | 'part-2' | 'part-3';
  domain: string;
  difficulty: 'Foundation' | 'Moderate' | 'Advanced';
  question: string;
  options: string[];
  correctIndex: number;
  rationale: string;
  iiaStandardReference: string;
}

export interface LmsResource {
  id: string;
  title: string;
  category: 'Standards' | 'Mind Maps' | 'Templates' | 'Formula Sheets' | 'AI Workpapers';
  fileType: 'PDF' | 'XLSX' | 'DOCX';
  fileSize: string;
  description: string;
  downloadsCount: number;
}

export const LMS_MODULES: LmsModule[] = [
  {
    id: 'p1-m1',
    partId: 'part-1',
    moduleNumber: 1,
    title: 'Domain I: Purpose & Mandatory GIAS Foundations',
    description: 'Core purpose, authority, and global structure of the newly enacted Global Internal Audit Standards (GIAS).',
    lessons: [
      {
        id: 'p1-l1',
        partId: 'part-1',
        title: 'Orientation & Transition to the New GIAS Framework',
        duration: '48 mins',
        durationMinutes: 48,
        instructor: 'CA Gurvinder Pal Singh',
        domain: 'Purpose of Internal Auditing',
        description: 'Comprehensive orientation on the architecture of the new Global Internal Audit Standards, key departures from the 2017 IPPF, and exam focus areas.',
        keyTakeaways: [
          'Difference between mandatory Domain Requirements and non-mandatory Considerations for Implementation',
          'Role of the Audit Committee and governing board under Principle 1',
          'Mandatory clauses in the Internal Audit Charter and approval protocols'
        ],
        handoutName: 'GIAS_vs_IPPF_Crosswalk_Matrix_2026.pdf',
        handoutSize: '2.4 MB',
        sampleTranscript: 'Welcome to BNC ELEVATE CIA Part 1 Masterclass. Today we dissect the architectural transition to the Global Internal Audit Standards. The IIA restructured the framework into 5 distinct domains...',
        videoPoster: '/hero-bg.jpg'
      },
      {
        id: 'p1-l2',
        partId: 'part-1',
        title: 'Principle 1 & 2: Objectivity, Independence & Dual Reporting',
        duration: '54 mins',
        durationMinutes: 54,
        instructor: 'CA Gurvinder Pal Singh',
        domain: 'Ethics & Professionalism',
        description: 'Master the nuances of functional vs administrative reporting, impairment safeguards, and practical scenarios tested by the IIA.',
        keyTakeaways: [
          'Functional reporting to the Audit Committee vs administrative reporting to the CEO',
          'Safeguards against objectivity impairments when auditing former operational responsibilities',
          'When consulting engagements trigger independence review mechanisms'
        ],
        handoutName: 'Independence_Impairment_Case_Scenarios.pdf',
        handoutSize: '1.8 MB',
        sampleTranscript: 'In this session, we analyze question traps regarding dual reporting lines. Remember, approval of the internal audit charter and budget rests strictly with the governing board...',
        videoPoster: '/hero-bg.jpg'
      },
      {
        id: 'p1-l3',
        partId: 'part-1',
        title: 'Principle 3, 4 & 5: Competency, Due Professional Care & QAIP',
        duration: '62 mins',
        durationMinutes: 62,
        instructor: 'CA Gurvinder Pal Singh',
        domain: 'Managing Internal Audit',
        description: 'In-depth coverage of Continuing Professional Education (CPE), Quality Assurance and Improvement Program (QAIP), and external quality assessments.',
        keyTakeaways: [
          'Five-year mandatory external quality assessment (EQA) cycle and reviewer qualifications',
          'Ongoing internal monitoring vs periodic self-assessments',
          'Use of the statement "Conforms with the Global Internal Audit Standards"'
        ],
        handoutName: 'QAIP_Checklist_and_Audit_Charter_Template.pdf',
        handoutSize: '3.1 MB',
        sampleTranscript: 'The QAIP is tested on every single Part 1 exam without exception. You must understand who qualifies as an independent external reviewer...',
        videoPoster: '/hero-bg.jpg'
      }
    ]
  },
  {
    id: 'p1-m2',
    partId: 'part-1',
    moduleNumber: 2,
    title: 'Domain II: Governance, Risk Management & Internal Control',
    description: 'COSO Internal Control - Integrated Framework, Three Lines Model, and enterprise risk appetite.',
    lessons: [
      {
        id: 'p1-l4',
        partId: 'part-1',
        title: 'COSO 2013 Framework: 5 Components & 17 Principles',
        duration: '58 mins',
        durationMinutes: 58,
        instructor: 'CA Gurvinder Pal Singh',
        domain: 'Internal Control',
        description: 'Deconstruct Control Environment, Risk Assessment, Control Activities, Information & Communication, and Monitoring with practical audit tests.',
        keyTakeaways: [
          'CRIME mnemonic: Control Environment, Risk Assessment, Info & Comm, Monitoring, Existing Activities',
          'Evaluating deficiencies: Material Weakness vs Significant Deficiency',
          'Audit procedures to substantiate operating effectiveness'
        ],
        handoutName: 'COSO_17_Principles_Quick_Recall_Sheet.pdf',
        handoutSize: '1.5 MB',
        sampleTranscript: 'COSO is the backbone of internal control questions. Never confuse a preventive control with a detective control in segregation of duties questions...',
        videoPoster: '/hero-bg.jpg'
      },
      {
        id: 'p1-l5',
        partId: 'part-1',
        title: 'The IIA Three Lines Model & Fraud Risk Governance',
        duration: '50 mins',
        durationMinutes: 50,
        instructor: 'CA Gurvinder Pal Singh',
        domain: 'Governance & Fraud',
        description: 'Understanding the updated Three Lines Model (replacing Three Lines of Defense), fraud triangle mechanics, and internal audit’s fraud responsibilities.',
        keyTakeaways: [
          'Internal audit’s role is to evaluate fraud controls, not to detect all fraud guarantees',
          'The Fraud Triangle: Pressure/Incentive, Opportunity, Rationalization',
          'Whistleblower mechanisms and forensic escalation protocols'
        ],
        handoutName: 'IIA_Three_Lines_Model_Summary_Guide.pdf',
        handoutSize: '1.2 MB',
        sampleTranscript: 'The modern IIA Three Lines Model emphasizes collaboration and value preservation. The governing board, management first and second line, and internal audit as the third line...',
        videoPoster: '/hero-bg.jpg'
      }
    ]
  },
  {
    id: 'p2-m1',
    partId: 'part-2',
    moduleNumber: 1,
    title: 'Part 2: Managing the Engagement & Statistical Sampling',
    description: 'Execution of assurance engagements, risk-based engagement planning, and audit sampling methodologies.',
    lessons: [
      {
        id: 'p2-l1',
        partId: 'part-2',
        title: 'Risk-Based Engagement Planning & Scope Setting',
        duration: '52 mins',
        durationMinutes: 52,
        instructor: 'CA Gurvinder Pal Singh',
        domain: 'Engagement Planning',
        description: 'Creating the engagement work program, establishing preliminary objectives, and drafting scope exclusion notices.',
        keyTakeaways: [
          'Walkthrough interviews and process mapping flowcharts',
          'Establishing test criteria: Policies, laws, benchmarks, industry best practice',
          'Budgeting staff hours and specialized resource allocation'
        ],
        handoutName: 'Engagement_Work_Program_Template.xlsx',
        handoutSize: '1.1 MB',
        sampleTranscript: 'In Part 2, the exam tests execution from start to finish. Engagement objectives must align with management’s operational objectives for the audited activity...',
        videoPoster: '/hero-bg.jpg'
      },
      {
        id: 'p2-l2',
        partId: 'part-2',
        title: 'Audit Sampling: Attribute vs Variable vs Monetary Unit (MUS)',
        duration: '65 mins',
        durationMinutes: 65,
        instructor: 'CA Gurvinder Pal Singh',
        domain: 'Audit Evidence & Testing',
        description: 'Master sampling risk (Type I & Type II errors), confidence levels, tolerable misstatement, and MUS interval calculation.',
        keyTakeaways: [
          'Attribute sampling for internal controls testing (rate of occurrence)',
          'Variable sampling for financial account balance verification',
          'Monetary Unit Sampling (MUS) calculation: Sample size = (BV × Reliability Factor) / Tolerable Error'
        ],
        handoutName: 'Audit_Sampling_Formulas_Cheat_Sheet.pdf',
        handoutSize: '950 KB',
        sampleTranscript: 'Sampling questions frequently test the relationship between sample size and tolerable deviation rate. If tolerable deviation decreases, sample size must increase...',
        videoPoster: '/hero-bg.jpg'
      }
    ]
  },
  {
    id: 'p3-m1',
    partId: 'part-3',
    moduleNumber: 1,
    title: 'Part 3: Business Acumen, IT Audit & Cybersecurity',
    description: 'Strategic management, financial ratios, information security, and business continuity planning.',
    lessons: [
      {
        id: 'p3-l1',
        partId: 'part-3',
        title: 'IT General Controls (ITGC) & Cybersecurity Governance',
        duration: '60 mins',
        durationMinutes: 60,
        instructor: 'CA Gurvinder Pal Singh',
        domain: 'Information Technology',
        description: 'User access management, change management, backup/restore procedures, and ISO 27001 / NIST cybersecurity frameworks.',
        keyTakeaways: [
          'Segregation of duties in IT: Developers vs System Administrators vs Database Admins',
          'Disaster Recovery Plan (DRP) vs Business Continuity Plan (BCP)',
          'Recovery Time Objective (RTO) vs Recovery Point Objective (RPO)'
        ],
        handoutName: 'ITGC_Audit_Checklist_Guide.pdf',
        handoutSize: '2.8 MB',
        sampleTranscript: 'Part 3 has the highest technical breadth. We cover logical access, privileged user monitoring, and multi-factor authentication requirements...',
        videoPoster: '/hero-bg.jpg'
      },
      {
        id: 'p3-l2',
        partId: 'part-3',
        title: 'Financial Analysis, Liquidity Ratios & Capital Budgeting',
        duration: '55 mins',
        durationMinutes: 55,
        instructor: 'CA Gurvinder Pal Singh',
        domain: 'Financial Management',
        description: 'Essential ratios (Current, Quick, ROE, DuPont), Net Present Value (NPV), and Internal Rate of Return (IRR) for non-finance auditors.',
        keyTakeaways: [
          'Working capital cycle and inventory turnover velocity',
          'EBITDA interest coverage ratio and debt covenant compliance',
          'NPV decision rules vs Payback Period limitations'
        ],
        handoutName: 'Financial_Ratios_Formula_Compendium.pdf',
        handoutSize: '1.4 MB',
        sampleTranscript: 'Many candidates fear financial calculations. We will break every ratio down into simple logical questions without needing advanced math...',
        videoPoster: '/hero-bg.jpg'
      }
    ]
  },
  {
    id: 'ai-m1',
    partId: 'ai-lab',
    moduleNumber: 1,
    title: 'Executive AI Audit Lab: Modern LLM & Automation Workflows',
    description: 'Exclusive hands-on masterclass series for automating workpapers, prompt engineering for risk assessments, and continuous audit scripts.',
    lessons: [
      {
        id: 'ai-l1',
        partId: 'ai-lab',
        title: 'Automated Risk-Control Matrix (RCM) Generation with Generative AI',
        duration: '45 mins',
        durationMinutes: 45,
        instructor: 'CA Gurvinder Pal Singh & Tech Lead',
        domain: 'AI Tools in Audit',
        description: 'How to structure structured prompts with standard compliance frameworks to generate audit programs in under 5 minutes.',
        keyTakeaways: [
          'Zero-shot vs Few-shot prompting for audit procedures',
          'Enforcing confidentiality and zero-data retention settings on enterprise LLMs',
          'Validating AI-generated testing steps for hallucination checks'
        ],
        handoutName: 'BNC_AI_Prompt_Engineering_Library_for_Auditors.pdf',
        handoutSize: '4.2 MB',
        sampleTranscript: 'In this AI Lab, we demonstrate live automation of an inventory procurement audit program using structured prompts...',
        videoPoster: '/hero-bg.jpg'
      },
      {
        id: 'ai-l2',
        partId: 'ai-lab',
        title: 'Anomaly Detection & Journal Entry Testing using Python & AI',
        duration: '50 mins',
        durationMinutes: 50,
        instructor: 'BNC Analytics Team',
        domain: 'Data Analytics & ML',
        description: 'Using Benford’s Law, round-amount filters, weekend posting flags, and automated risk scoring on large transaction datasets.',
        keyTakeaways: [
          'Automating high-risk journal entry flags (weekend entries, round numbers, unusual accounts)',
          'Benford’s law first-digit and second-digit variance testing',
          'Exporting automated workpaper evidence directly into audit management software'
        ],
        handoutName: 'Journal_Entry_Testing_Python_Template.ipynb',
        handoutSize: '820 KB',
        sampleTranscript: 'Data analytics is no longer optional for senior auditors. We will run an automated script across 100,000 journal entries in 3 seconds...',
        videoPoster: '/hero-bg.jpg'
      }
    ]
  }
];

export const LMS_TEST_BANK_QUESTIONS: LmsMcqQuestion[] = [
  {
    id: 'q-101',
    partId: 'part-1',
    domain: 'Foundations of Internal Auditing (GIAS)',
    difficulty: 'Moderate',
    question: 'According to the Global Internal Audit Standards (GIAS), which of the following is an essential responsibility that rests STRICTLY with the governing board / audit committee rather than the Chief Audit Executive (CAE)?',
    options: [
      'Establishing the operational budget allocations for audit travel expenses',
      'Approving the Internal Audit Charter and the risk-based internal audit plan',
      'Selecting the specific audit sampling technique for operational reviews',
      'Conducting annual performance reviews of senior internal audit team leads'
    ],
    correctIndex: 1,
    rationale: 'Under Domain III (Governing the Internal Audit Function) of the Global Internal Audit Standards, approving the Internal Audit Charter, the risk-based audit plan, and the CAE appointment/remuneration are non-delegable responsibilities of the governing board / audit committee. Operational staffing and sampling techniques are operational responsibilities of the CAE.',
    iiaStandardReference: 'GIAS Domain III, Principle 6 & 7'
  },
  {
    id: 'q-102',
    partId: 'part-1',
    domain: 'Ethics & Professionalism',
    difficulty: 'Advanced',
    question: 'An internal auditor previously worked as the accounts payable supervisor 9 months prior to joining the internal audit activity. The CAE is scheduling the annual procurement and cash disbursement audit. How must the CAE proceed?',
    options: [
      'Assign the auditor to audit accounts payable because their intimate familiarity enhances audit efficiency',
      'Assign the auditor to lead the review provided a peer senior auditor independently reviews their workpapers',
      'Refrain from assigning the auditor to audit accounts payable activities for which they had operational responsibility within the past year',
      'Permit the auditor to perform tests of controls, but prohibit them from testing substantive sample payments'
    ],
    correctIndex: 2,
    rationale: 'GIAS Standard 2.1 (Objectivity) explicitly establishes that objectivity is presumed to be impaired if an internal auditor provides assurance services for an activity for which the auditor had operational responsibility within the previous year (12-month cooling-off rule). The auditor cannot participate in assurance engagements covering accounts payable.',
    iiaStandardReference: 'GIAS Domain II, Standard 2.1 (Safeguarding Objectivity)'
  },
  {
    id: 'q-103',
    partId: 'part-1',
    domain: 'Internal Control & COSO',
    difficulty: 'Foundation',
    question: 'Which of the following is the BEST example of a preventive control rather than a detective control?',
    options: [
      'Monthly bank reconciliation performed by an accountant who does not handle cash receipts',
      'Automated system block preventing purchase orders from being issued without dual management sign-off',
      'Quarterly physical inventory count compared against the perpetual inventory ledger',
      'Internal audit review of travel expense reports following reimbursement'
    ],
    correctIndex: 1,
    rationale: 'Preventive controls deter errors or fraud before they occur. An automated system block that stops an unapproved purchase order from being created prevents an unauthorized transaction. Bank reconciliations, physical inventory counts, and post-payment expense reviews are detective controls because they uncover errors after they have happened.',
    iiaStandardReference: 'COSO Internal Control - Control Activities Principle 10'
  },
  {
    id: 'q-201',
    partId: 'part-2',
    domain: 'Audit Sampling & Evidence',
    difficulty: 'Advanced',
    question: 'An internal auditor is testing credit approvals using attribute sampling. If the auditor decides to REDUCE the tolerable deviation rate from 8% to 4% while holding the confidence level constant at 95%, what will happen to the required sample size?',
    options: [
      'The sample size will decrease significantly',
      'The sample size will increase',
      'The sample size will remain unchanged because confidence level was held constant',
      'The sample size will decrease by exactly 50%'
    ],
    correctIndex: 1,
    rationale: 'Tolerable deviation rate has an INVERSE relationship with sample size. When an auditor is willing to tolerate FEWER errors (lower rate of 4% vs 8%), the auditor requires a LARGER sample size to achieve the same statistical assurance.',
    iiaStandardReference: 'IIA Practice Guide - Audit Sampling'
  },
  {
    id: 'q-301',
    partId: 'part-3',
    domain: 'Information Technology & Cybersecurity',
    difficulty: 'Moderate',
    question: 'In disaster recovery and business continuity planning, which metric defines the MAXIMUM acceptable age of data that must be recovered from backup storage for normal operations to resume?',
    options: [
      'Recovery Time Objective (RTO)',
      'Recovery Point Objective (RPO)',
      'Mean Time Between Failures (MTBF)',
      'Maximum Tolerable Downtime (MTD)'
    ],
    correctIndex: 1,
    rationale: 'Recovery Point Objective (RPO) dictates the acceptable data loss tolerance measured in time (e.g. 1 hour, 24 hours of data loss). RTO defines how quickly systems must be restored back online, while MTD is the total allowable outage duration before severe organizational damage occurs.',
    iiaStandardReference: 'GTAG - Business Continuity & IT Disaster Recovery'
  }
];

export const LMS_RESOURCES: LmsResource[] = [
  {
    id: 'res-1',
    title: 'GIAS 2026 Master Study Compendium & IPPF Crosswalk',
    category: 'Standards',
    fileType: 'PDF',
    fileSize: '4.8 MB',
    description: 'Comprehensive 120-page synthesis of the new Global Internal Audit Standards with exam notes and transition traps.',
    downloadsCount: 1842
  },
  {
    id: 'res-2',
    title: 'BNC CIA 3-Part Formula & Quantitative Quick-Recall Sheet',
    category: 'Formula Sheets',
    fileType: 'PDF',
    fileSize: '1.2 MB',
    description: 'Essential equations: Attribute sampling, MUS intervals, Dupont ratios, EOQ, NPV, and Breakeven analysis.',
    downloadsCount: 2410
  },
  {
    id: 'res-3',
    title: 'Standard Internal Audit Charter & Engagement Work Program (IIA Aligned)',
    category: 'Templates',
    fileType: 'DOCX',
    fileSize: '890 KB',
    description: 'Ready-to-use corporate templates for audit charters, notification memos, and risk-control matrices.',
    downloadsCount: 1690
  },
  {
    id: 'res-4',
    title: 'BNC AI Prompt Engineering Playbook for Internal Auditors',
    category: 'AI Workpapers',
    fileType: 'PDF',
    fileSize: '3.6 MB',
    description: '50+ curated system prompts to automate audit workpaper documentation, sample testing, and CAE executive memos.',
    downloadsCount: 3120
  },
  {
    id: 'res-5',
    title: 'COSO 2013 17 Principles & 3 Lines Model Visual Mind Map',
    category: 'Mind Maps',
    fileType: 'PDF',
    fileSize: '2.1 MB',
    description: 'High-resolution diagram linking COSO components to common CIA exam scenario questions.',
    downloadsCount: 2895
  }
];

export const UPCOMING_LIVE_CLASSES = [
  {
    id: 'live-1',
    title: 'GIAS Domain III Deep-Dive: Board Governance & Ethics Traps',
    instructor: 'CA Gurvinder Pal Singh',
    date: 'Saturday, Nov 8, 2026',
    time: '7:00 PM - 9:30 PM IST',
    meetingId: '849-2910-3841',
    passcode: 'BNC-CIA-LIVE',
    topics: ['Audit Committee interactions', 'Charter mandatory clauses', 'Real Big 4 case studies']
  },
  {
    id: 'live-2',
    title: 'Part 2 Mastery: Monetary Unit Sampling (MUS) & High-Probability MCQs',
    instructor: 'CA Gurvinder Pal Singh',
    date: 'Sunday, Nov 9, 2026',
    time: '6:30 PM - 9:00 PM IST',
    meetingId: '892-1049-7721',
    passcode: 'BNC-CIA-LIVE',
    topics: ['Sampling risk calculation', 'Tolerable vs expected misstatement', 'Live MCQ speed drill']
  },
  {
    id: 'live-3',
    title: 'AI Audit Lab: Deploying LLMs for Risk & Control Matrix Automation',
    instructor: 'BNC AI Audit Practice Lead',
    date: 'Friday, Nov 14, 2026',
    time: '7:30 PM - 9:30 PM IST',
    meetingId: '912-3841-0023',
    passcode: 'BNC-AI-LAB',
    topics: ['Data security guardrails', 'Procurement RCM generation', 'Audit workpaper formatting']
  }
];

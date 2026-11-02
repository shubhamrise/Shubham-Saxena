import { PackagePlan, ExamPart, QuizQuestion, FeeItem } from '../types';

export const PACKAGES: PackagePlan[] = [
  {
    id: 'basic',
    name: 'Basic Self-Paced',
    tagline: 'Ideal for independent learners seeking comprehensive materials & guidance',
    priceINR: 40000,
    priceUSD: 490,
    installmentINR: 21000,
    features: [
      'Full preparation support for all 3 CIA exam parts',
      'End-to-end guidance for IIA membership & CCMS registration',
      'Proprietary BNC CIA study materials & structured recorded lectures',
      '18 months unrestricted LMS portal access',
      'BNC CIA Test Bank with 5,000+ MCQs ($499 Value)',
      'Chapter-wise quizzes & 2 full mock simulation exams per part',
      'Career guidance & assistance exploring internal audit vacancies',
      'Practical work experience validation guidance for IIA certification',
      'Post-CIA placement network assistance'
    ],
    deliverables: {
      hours: '120+ Hrs Recorded',
      mode: 'Self-Study + LMS',
      lmsAccess: '18 Months',
      booksIncluded: true,
      aiTraining: false,
      mocksCount: '6 Full Mocks (2/part)',
      placementSupport: true
    }
  },
  {
    id: 'premium',
    name: 'Premium Live Interactive',
    tagline: 'Our flagship instructor-led cohort with weekend live classes & doubt clearing',
    badge: 'MOST POPULAR',
    isPopular: true,
    priceINR: 60000,
    priceUSD: 735,
    installmentINR: 31500,
    features: [
      'Everything included in the Basic Package, PLUS:',
      '150+ Hours Live instructor-led sessions every Friday & Saturday',
      'Interactive doubt-clearing workshops with senior CIA & CA faculty',
      'Live exam strategy sessions, time management & MCQ walkthroughs',
      'Post-class HD recording uploaded immediately to your student portal',
      'Class repeat privilege at zero extra charge if you miss a cycle',
      'Physical printed copy of BNC CIA Test Bank & Books couriered to doorstep',
      'Priority 1-on-1 exam booking & verification concierge',
      'Resume review & mock interview sessions for Big 4 & MNC audit roles'
    ],
    deliverables: {
      hours: '150+ Hrs Live + Recordings',
      mode: 'Live Weekend Classes',
      lmsAccess: '18 Months',
      booksIncluded: true,
      aiTraining: false,
      mocksCount: '6 Full Mocks + Weekly Quizzes',
      placementSupport: true
    }
  },
  {
    id: 'premium-plus',
    name: 'Premium Plus with AI Audit',
    tagline: 'Executive program combining live CIA prep with real-world AI audit toolkits',
    badge: 'FLAGSHIP INNOVATION',
    priceINR: 75000,
    priceUSD: 915,
    installmentINR: 39500,
    features: [
      'Everything in the Premium Live Package, PLUS:',
      'Hands-on AI Tools Training tailored for Internal Audit & Risk Management',
      'Practical exposure to LLM workflows for audit workpaper documentation',
      'Automated risk assessment, anomaly detection & data sampling using AI',
      'Modern tech-enabled audit workflows to 5x your on-the-job productivity',
      'BNC Executive Certificate in "AI-Enabled Internal Auditing"',
      'Direct interview referrals to GCC, banking & boutique consulting partners',
      'Lifetime alumni masterclass invites & CPE guidance'
    ],
    deliverables: {
      hours: '180+ Hrs (150 Live + 30 AI Lab)',
      mode: 'Live Classes + AI Lab',
      lmsAccess: '24 Months Extended',
      booksIncluded: true,
      aiTraining: true,
      mocksCount: '8 Full Mocks + AI Case Studies',
      placementSupport: true
    }
  }
];

export const EXAM_PARTS: ExamPart[] = [
  {
    id: 'part-1',
    partNumber: 1,
    title: 'Internal Audit Fundamentals',
    questions: 125,
    durationMinutes: 150,
    description: 'Covers core foundations of the profession, IPPF standards, mandatory guidance, corporate governance, and fraud prevention mechanisms. Qualifies for standalone IAP designation.',
    domains: [
      {
        name: 'Foundations of Internal Auditing',
        weightage: 35,
        topics: [
          'Global Internal Audit Standards (GIAS) & IPPF structure',
          'Internal audit charter purpose, authority, and responsibility',
          'Independence of the internal audit activity & individual objectivity',
          'Due professional care, continuing professional education (CPE)'
        ]
      },
      {
        name: 'Ethics and Professionalism',
        weightage: 20,
        topics: [
          'Integrity, objectivity, confidentiality, and competency standards',
          'Ethical dilemmas & code of conduct enforcement',
          'Conflicts of interest identification & resolution'
        ]
      },
      {
        name: 'Governance, Risk Management, and Control (GRC)',
        weightage: 30,
        topics: [
          'Corporate governance frameworks and board audit committee relations',
          'COSO Internal Control - Integrated Framework & Three Lines Model',
          'Enterprise Risk Management (ERM) concepts and risk appetite'
        ]
      },
      {
        name: 'Fraud Risks & Controls',
        weightage: 15,
        topics: [
          'Fraud indicators, red flags, and fraud risk assessment',
          'Evaluating fraud prevention and detection controls',
          'Forensic audit techniques & whistleblower mechanisms'
        ]
      }
    ]
  },
  {
    id: 'part-2',
    partNumber: 2,
    title: 'Internal Audit Engagement',
    questions: 100,
    durationMinutes: 120,
    description: 'Focuses on the end-to-end execution of audit engagements from initial risk-based planning and data testing to supervision and formal stakeholder communication.',
    domains: [
      {
        name: 'Engagement Planning',
        weightage: 50,
        topics: [
          'Engagement objectives, scope, risk assessment & preliminary survey',
          'Developing detailed audit programs and work procedures',
          'Resource allocation, staff scheduling & budget management'
        ]
      },
      {
        name: 'Information Gathering, Analysis & Evaluation',
        weightage: 40,
        topics: [
          'Audit sampling techniques (statistical vs non-statistical)',
          'Data analytics, CAATs, and substantive testing',
          'Workpaper documentation, sufficiency and reliability of audit evidence'
        ]
      },
      {
        name: 'Engagement Supervision & Communication',
        weightage: 10,
        topics: [
          'Engagement review procedures & supervisory controls',
          'Exit conferences, draft reports & executive summaries',
          'Recommendations, management action plans & tracking implementation'
        ]
      }
    ]
  },
  {
    id: 'part-3',
    partNumber: 3,
    title: 'Internal Audit Function',
    questions: 100,
    durationMinutes: 120,
    description: 'Addresses the strategic leadership of the internal audit activity, annual audit plans, quality assurance & improvement programs (QAIP), and enterprise IT security.',
    domains: [
      {
        name: 'Engagement Results & Monitoring',
        weightage: 45,
        topics: [
          'Formal reporting criteria, rating systems & distribution',
          'Monitoring progress & following up on unmitigated residual risk',
          'Communicating acceptance of risk to executive management & the board'
        ]
      },
      {
        name: 'Internal Audit Operations',
        weightage: 25,
        topics: [
          'Organizing the department structure & staff competencies',
          'Coordinating with external assurance providers and compliance teams',
          'Budgeting, billing, and performance measurement of audit activities'
        ]
      },
      {
        name: 'Internal Audit Plan',
        weightage: 15,
        topics: [
          'Dynamic risk-based annual internal audit plan development',
          'Aligning audit priorities with corporate strategic objectives',
          'Board approval process & ongoing plan adjustments'
        ]
      },
      {
        name: 'Quality of the Internal Audit Function (QAIP)',
        weightage: 15,
        topics: [
          'Internal ongoing and periodic quality assessments',
          'External independent quality assessment review (required every 5 years)',
          'Statement of conformance with Global Internal Audit Standards'
        ]
      }
    ]
  }
];

export const SAMPLE_QUIZ: QuizQuestion[] = [
  {
    id: 1,
    part: 'Part 1: Fundamentals',
    domain: 'Foundations of Internal Auditing',
    question: 'According to the IIA Global Internal Audit Standards, who is primarily responsible for establishing and maintaining organizational independence for the internal audit activity?',
    options: [
      'The Chief Audit Executive (CAE) through communication with executive management',
      'The Board of Directors (or Audit Committee), with direct reporting lines from the CAE',
      'The External Audit Firm during annual statutory review',
      'The Chief Financial Officer (CFO) to whom the CAE administratively reports'
    ],
    correctIndex: 1,
    explanation: 'The Board (Audit Committee) carries ultimate governance responsibility for ensuring organizational independence by approving the internal audit charter, appointing/removing the CAE, and approving the annual risk-based audit plan.'
  },
  {
    id: 2,
    part: 'Part 2: Practice',
    domain: 'Engagement Planning & Execution',
    question: 'When an internal auditor discovers an automated control exception during testing where transactions exceeding $100,000 lacked secondary approvals, the auditor should first:',
    options: [
      'Immediately notify law enforcement of suspected criminal wrongdoing',
      'Expand the sample size or utilize data analytics across the entire population to determine financial impact and root cause',
      'Issue an adverse audit opinion for the entire division before completing field work',
      'Discard the finding if management assures the auditor that it was an isolated software bug'
    ],
    correctIndex: 1,
    explanation: 'Standard audit methodology dictates that upon finding a control breakdown, the auditor must assess the condition, determine root cause, evaluate compensating controls, and quantify potential exposure across the full population using CAATs or expanded sampling.'
  },
  {
    id: 3,
    part: 'Part 3: Strategy',
    domain: 'Quality Assurance & Improvement Program (QAIP)',
    question: 'In accordance with IIA Standards, how frequently must an internal audit activity undergo an external quality assessment by an independent, qualified reviewer from outside the organization?',
    options: [
      'Annually alongside the statutory financial statement audit',
      'Every three years following the board rotation cycle',
      'At least once every five years',
      'Only when requested by banking regulators or credit rating agencies'
    ],
    correctIndex: 2,
    explanation: 'Standard 1312 mandates that an external assessment of the internal audit activity must be conducted at least once every five years by a qualified, independent assessor or assessment team from outside the organization.'
  }
];

export const IIA_FEES: FeeItem[] = [
  {
    name: 'CIA Application Fee',
    category: 'cia-member',
    standardUSD: 90.00,
    offerUSD: 72.00,
    offerTaxUSD: 84.96,
    standardINRApprox: 7100,
    notes: 'Valid for 3 years from candidate approval date'
  },
  {
    name: 'CIA Part 1 Exam Registration',
    category: 'cia-member',
    standardUSD: 232.50,
    offerUSD: 186.00,
    offerTaxUSD: 219.48,
    standardINRApprox: 18300,
    notes: '125 questions, 150 minutes'
  },
  {
    name: 'CIA Part 2 Exam Registration',
    category: 'cia-member',
    standardUSD: 210.00,
    offerUSD: 168.00,
    offerTaxUSD: 198.24,
    standardINRApprox: 16500,
    notes: '100 questions, 120 minutes'
  },
  {
    name: 'CIA Part 3 Exam Registration',
    category: 'cia-member',
    standardUSD: 210.00,
    offerUSD: 168.00,
    offerTaxUSD: 198.24,
    standardINRApprox: 16500,
    notes: '100 questions, 120 minutes'
  },
  {
    name: 'IAP Student Application Fee',
    category: 'iap-student',
    standardUSD: 65.00,
    offerUSD: 45.00,
    offerTaxUSD: 53.10,
    standardINRApprox: 4400,
    notes: 'For currently enrolled students'
  },
  {
    name: 'IAP / Part 1 Student Exam Fee',
    category: 'iap-student',
    standardUSD: 245.00,
    offerUSD: 165.00,
    offerTaxUSD: 194.70,
    standardINRApprox: 16250,
    notes: 'Counts towards full CIA within 4 years'
  },
  {
    name: 'CIA Application (Post-IAP Pathway)',
    category: 'iap-student',
    standardUSD: 0.00,
    offerUSD: 0.00,
    offerTaxUSD: 0.00,
    standardINRApprox: 0,
    notes: '100% Waived when advancing from IAP'
  }
];

export const ELIGIBILITY_PATHWAYS = [
  {
    id: 'master',
    title: "Master's Degree Holders",
    badge: 'ACCELERATED 1-YEAR EXP',
    qualification: 'M.Com, MBA, MS, M.Sc or equivalent postgraduate degree',
    entryRequirement: 'Zero experience required to enroll & sit for all 3 exams',
    toCertify: 'Pass all 3 CIA exams + 12 months internal audit or risk experience',
    idealPlan: 'Premium Live Package',
    savingsTip: 'Enroll now and complete all exams within 6-9 months before your first annual appraisal.'
  },
  {
    id: 'bachelor',
    title: "Bachelor's Degree Holders",
    badge: 'MOST COMMON PATHWAY',
    qualification: 'B.Com, BBA, B.Sc, B.Tech, BA or equivalent graduate degree',
    entryRequirement: 'Zero experience required to enroll & clear exams',
    toCertify: 'Pass all 3 CIA exams + 24 months internal audit or related control experience',
    idealPlan: 'Premium Live Package',
    savingsTip: 'Related experience in external audit, compliance, risk, QA or accounting counts toward IIA verification.'
  },
  {
    id: 'student',
    title: 'University / Final-Year Students',
    badge: 'IAP FAST TRACK',
    qualification: 'Enrolled undergraduate or postgraduate college students',
    entryRequirement: 'No degree proof required upfront; student ID verification',
    toCertify: 'Earn the IAP credential on Part 1 alone, then transition to full CIA with fee waiver',
    idealPlan: 'Basic or Premium Package',
    savingsTip: 'Save over $150 on IIA examination fees via the official student candidate discount program.'
  },
  {
    id: 'challenge',
    title: 'Chartered Accountants & CPAs',
    badge: 'ONE EXAM SITTING',
    qualification: 'Active CA (ICAI), CPA (AICPA), CISA (ISACA), ACCA or CMA members',
    entryRequirement: 'Proof of active membership in recognized professional body',
    toCertify: 'Take 1 single comprehensive Challenge Exam (150 questions) to earn full CIA',
    idealPlan: 'Premium Live Package',
    savingsTip: 'BNC Global provides specialized Challenge Exam modules covering only the differential syllabus.'
  }
];

export const TESTIMONIALS = [
  {
    name: 'Ananya Sharma, CIA',
    role: 'Senior Internal Auditor',
    company: 'Deloitte India (Risk Advisory)',
    quote: 'BNC Global’s live classes on weekends were a game changer. The faculty breaks down complex IPPF and GRC concepts into memorable real-world audit scenarios. Passed all 3 parts within 7 months on my first attempt!',
    batch: 'Batch 2025'
  },
  {
    name: 'Rohan Mehta, CIA',
    role: 'Assistant Manager - Internal Audit',
    company: 'Barclays Global Service Centre',
    quote: 'The BNC CIA Test Bank of 5,000+ MCQs matches the exact difficulty and cognitive depth of the real Pearson VUE testing environment. Highly recommend the Premium Live interactive cohort.',
    batch: 'Batch 2024'
  },
  {
    name: 'Priya Venkatesh, CIA',
    role: 'Risk & Compliance Lead',
    company: 'Grant Thornton Bharat',
    quote: 'As a working professional, the recorded LMS sessions and dedicated doubt support gave me total flexibility. BNC Global also verified my work experience smoothly with the IIA.',
    batch: 'Batch 2025'
  }
];

export const FAQS = [
  {
    q: 'Is there negative marking on the CIA exam? Do all questions have equal weightage?',
    a: 'There is NO negative marking on the CIA exam. You should answer every single question. Individual questions are scaled based on statistical psychometric difficulty, and candidates need a scaled score of 600 points (out of 750) to pass.'
  },
  {
    q: 'Do I need active IIA India membership before booking exams?',
    a: 'Yes! You must activate your IIA India membership before paying exam registration fees in the CCMS portal. Members save up to 40% on exam fees compared to non-member rates. IIA fees are paid directly to the institute.'
  },
  {
    q: 'Can I purchase a package in installments or EMI?',
    a: 'Yes, BNC Global offers flexible 2-part zero-interest installment options for our training programs. You can choose this directly in the checkout modal or contact our student support desk.'
  },
  {
    q: 'Can my employer reimburse the CIA course and exam fee?',
    a: 'Yes! Major professional service firms (Big 4, Grant Thornton, BDO, RSM) and multinational corporations actively reimburse both training fees and IIA exam costs upon passing or during enrollment. BNC Global provides tax invoices with GST for your corporate claims.'
  },
  {
    q: 'What is the IAP and why should beginners consider it?',
    a: 'The Internal Audit Practitioner (IAP) is a permanent designation awarded by the IIA upon passing Part 1 alone. It requires no prior university degree or experience, allowing university students to gain an international credential on their resume immediately.'
  },
  {
    q: 'How long do I have to clear all 3 parts of the CIA exam?',
    a: 'Once your CIA application is accepted in the CCMS, you have 3 years to pass all 3 parts. You can take the parts in any order that suits your preparation schedule.'
  }
];

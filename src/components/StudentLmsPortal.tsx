import React, { useState, useEffect } from 'react';
import {
  LMS_MODULES,
  LMS_TEST_BANK_QUESTIONS,
  LMS_RESOURCES,
  UPCOMING_LIVE_CLASSES,
  LmsLesson,
  LmsModule,
  LmsMcqQuestion,
  LmsResource
} from '../data/lmsData';
import {
  BookOpen,
  Video,
  Play,
  Pause,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Calendar,
  Award,
  ChevronRight,
  Send,
  Cpu,
  Search,
  ExternalLink,
  RotateCcw,
  Volume2,
  Maximize2,
  MessageSquare,
  ShieldCheck,
  BarChart3,
  Check,
  Lock,
  KeyRound,
  LogOut,
  AlertCircle,
  ShieldAlert,
  User,
  X,
  UserCheck,
  UserX,
  Shield,
  BadgeAlert,
  Eye,
  EyeOff,
  Sun,
  Moon
} from 'lucide-react';
import { LmsAdminConsole } from './LmsAdminConsole';
import { ManagedLearner, LmsAdminUser, LiveClassItem, StudentDoubtItem } from '../types';

export interface AuthenticatedStudent {
  name: string;
  email: string;
  orderId: string;
  packageName: string;
  feeStatus: string;
  enrollmentDate: string;
  accessDuration: string;
}

// Master initial learners roster managed by Academic Administration
const INITIAL_MANAGED_LEARNERS: ManagedLearner[] = [
  {
    id: 'lrn-1',
    name: 'Rohit Verma',
    email: 'rohit.verma@example.com',
    password: 'bnc2026',
    phone: '+91 98234 11223',
    orderId: '2026000',
    packageName: 'Premium Plus with AI Audit',
    feeStatus: 'Full Tuition Paid & Verified',
    status: 'active',
    enrollmentDate: 'Oct 24, 2026',
    accessDuration: '24 Months Extended (Active till Oct 2028)',
    notes: 'Admitted into Batch 2026-A. Full fee cleared.'
  },
  {
    id: 'lrn-2',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    password: 'bnc2026',
    phone: '+91 98765 43210',
    orderId: '2026001',
    packageName: 'Premium Live Interactive',
    feeStatus: 'Tuition Installment Cleared (Verified)',
    status: 'active',
    enrollmentDate: 'Nov 01, 2026',
    accessDuration: '18 Months Portal Access (Active till May 2028)',
    notes: 'Live evening interactive cohort.'
  },
  {
    id: 'lrn-3',
    name: 'CA Aman Gupta',
    email: 'aman.gupta@example.com',
    password: 'bnc2026',
    phone: '+91 99112 33445',
    orderId: '2026002',
    packageName: 'Premium Live Interactive',
    feeStatus: 'Installment Overdue · Access Suspended',
    status: 'revoked',
    enrollmentDate: 'Oct 15, 2026',
    accessDuration: 'Suspended by Admin',
    notes: 'Fee installment overdue. Access revoked pending clearance.'
  },
  {
    id: 'lrn-4',
    name: 'Ananya Iyer',
    email: 'ananya.iyer@example.com',
    password: 'bnc2026',
    phone: '+91 98450 67890',
    orderId: '2026003',
    packageName: 'Self-Paced Pro Masterclass',
    feeStatus: 'Tuition Clearance Under Review',
    status: 'pending',
    enrollmentDate: 'Nov 04, 2026',
    accessDuration: 'Pending Academic Approval',
    notes: 'Bank transfer slip uploaded; awaiting accounting reconciliation.'
  }
];

interface StudentLmsPortalProps {
  onBackToWebsite: () => void;
  onOpenCheckout?: (packageId?: string) => void;
  initialPackage?: string;
}

export const StudentLmsPortal: React.FC<StudentLmsPortalProps> = ({
  onBackToWebsite,
  onOpenCheckout,
  initialPackage = 'premium-plus'
}) => {
  // Authentication & Paid Fee Verification state
  const [currentUser, setCurrentUser] = useState<AuthenticatedStudent | null>(() => {
    try {
      const saved = localStorage.getItem('bnc_lms_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Admin Portal & Learner Management state
  const [adminUser, setAdminUser] = useState<LmsAdminUser | null>(() => {
    try {
      const saved = localStorage.getItem('bnc_lms_auth_admin');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [managedLearners, setManagedLearners] = useState<ManagedLearner[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_lms_managed_students');
      if (saved) {
        const parsed: ManagedLearner[] = JSON.parse(saved);
        return parsed.map((l) => ({
          ...l,
          password: l.password || 'bnc2026'
        }));
      }
    } catch (e) {
      console.warn(e);
    }
    return INITIAL_MANAGED_LEARNERS;
  });

  const handleUpdateLearners = (updated: ManagedLearner[]) => {
    setManagedLearners(updated);
    try {
      localStorage.setItem('bnc_lms_managed_students', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // LMS Theme: default to 'light' as requested
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem('bnc_lms_theme');
      return (saved as 'light' | 'dark') || 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    try {
      localStorage.setItem('bnc_lms_theme', next);
    } catch (e) {
      console.warn(e);
    }
    showToast(`Switched to ${next === 'light' ? 'Light' : 'Dark'} Mode`);
  };

  // Login View Selection: Learner Login vs Academic Admin Login
  const [portalMode, setPortalMode] = useState<'learner' | 'admin'>('learner');

  // Learner Login Form fields (Email & Password only, with password set by Admin)
  const [inputEmail, setInputEmail] = useState('');
  const [inputPassword, setInputPassword] = useState('');
  const [showStudentPassword, setShowStudentPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Admin Login Form fields
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [adminError, setAdminError] = useState<string | null>(null);
  const [isAdminSubmitting, setIsAdminSubmitting] = useState(false);

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'curriculum' | 'testbank' | 'live' | 'resources' | 'ailab' | 'readiness'>('curriculum');
  const [selectedPart, setSelectedPart] = useState<'all' | 'part-1' | 'part-2' | 'part-3' | 'ai-lab'>('part-1');

  // LMS Data States (backed by localStorage so Admin edits persist across student view)
  const [lmsModules, setLmsModules] = useState<LmsModule[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_lms_modules');
      if (saved) return JSON.parse(saved);
    } catch {}
    return LMS_MODULES;
  });

  const [testBankQuestions, setTestBankQuestions] = useState<LmsMcqQuestion[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_lms_test_bank');
      if (saved) return JSON.parse(saved);
    } catch {}
    return LMS_TEST_BANK_QUESTIONS;
  });

  const [liveClasses, setLiveClasses] = useState<LiveClassItem[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_lms_live_classes');
      if (saved) return JSON.parse(saved);
    } catch {}
    return UPCOMING_LIVE_CLASSES;
  });

  const [lmsResources, setLmsResources] = useState<LmsResource[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_lms_resources');
      if (saved) return JSON.parse(saved);
    } catch {}
    return LMS_RESOURCES;
  });

  const handleUpdateModules = (updated: LmsModule[]) => {
    setLmsModules(updated);
    try {
      localStorage.setItem('bnc_lms_modules', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateTestBank = (updated: LmsMcqQuestion[]) => {
    setTestBankQuestions(updated);
    try {
      localStorage.setItem('bnc_lms_test_bank', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateLiveClasses = (updated: LiveClassItem[]) => {
    setLiveClasses(updated);
    try {
      localStorage.setItem('bnc_lms_live_classes', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  const handleUpdateResources = (updated: LmsResource[]) => {
    setLmsResources(updated);
    try {
      localStorage.setItem('bnc_lms_resources', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };
  
  // Video Player state
  const [activeLesson, setActiveLesson] = useState<LmsLesson>(lmsModules[0]?.lessons[0] || LMS_MODULES[0].lessons[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [playerProgress, setPlayerProgress] = useState(35); // 35% viewed
  const [completedLessons, setCompletedLessons] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem('bnc_lms_completed_lessons');
      return stored ? JSON.parse(stored) : ['p1-l1'];
    } catch {
      return ['p1-l1'];
    }
  });

  // Notes state
  const [studentNote, setStudentNote] = useState('');
  const [savedNotes, setSavedNotes] = useState<{ [lessonId: string]: string }>(() => {
    try {
      const stored = localStorage.getItem('bnc_lms_notes');
      return stored ? JSON.parse(stored) : {
        'p1-l1': 'Crucial note: Board approves charter and audit budget, NOT executive management!'
      };
    } catch {
      return {};
    }
  });
  const [noteSavedFeedback, setNoteSavedFeedback] = useState(false);

  // MCQ Test Bank state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [flaggedQuestions, setFlaggedQuestions] = useState<string[]>([]);
  const [testScore, setTestScore] = useState(0);
  const [totalAttempted, setTotalAttempted] = useState(0);
  const [examTimerSeconds, setExamTimerSeconds] = useState(150 * 60); // 150 minutes
  const [isTimerRunning, setIsTimerRunning] = useState(true);

  // AI Audit Lab state
  const [aiPromptCategory, setAiPromptCategory] = useState<'rcm' | 'memo' | 'sampling'>('rcm');
  const [customPrompt, setCustomPrompt] = useState('Generate an audit testing procedure for Procure-to-Pay vendor onboarding under SOX / ICFR controls.');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>('');

  // Live Class & Doubt state
  const [doubtText, setDoubtText] = useState('');
  const [doubtSubmitted, setDoubtSubmitted] = useState(false);
  const [userDoubts, setUserDoubts] = useState<StudentDoubtItem[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_lms_user_doubts');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'd-1',
        question: 'In GIAS Standard 2.1, does consulting on an ERP migration immediately disqualify the team from conducting assurance on the same system later?',
        time: 'Yesterday at 4:15 PM',
        status: 'Answered by CA Gurvinder Pal Singh',
        reply: 'Yes, if the internal audit team designed or implemented operating controls during the migration, independence is impaired for a minimum of 1 year. If advisory was strictly limited to evaluating design without management decision-making, assurance can proceed with disclosure to the Audit Committee.',
        studentName: 'Rohit Verma'
      }
    ];
  });

  const handleUpdateDoubts = (updated: StudentDoubtItem[]) => {
    setUserDoubts(updated);
    try {
      localStorage.setItem('bnc_lms_user_doubts', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Toast feedback
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Student Authentication Handlers
  const authenticateStudent = (student: AuthenticatedStudent) => {
    setCurrentUser(student);
    try {
      localStorage.setItem('bnc_lms_auth_user', JSON.stringify(student));
    } catch (e) {
      console.warn(e);
    }
    showToast(`Welcome back, ${student.name}! Access verified for ${student.packageName}.`);
  };

  const handleVerifyCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setAuthError(null);
    setIsVerifying(true);

    setTimeout(() => {
      setIsVerifying(false);

      const trimmedEmail = inputEmail.trim().toLowerCase();
      const trimmedPassword = inputPassword.trim();

      if (!trimmedEmail || !trimmedPassword) {
        setAuthError('Please enter both your registered student email and password.');
        return;
      }

      // 1. Check in managed learners roster (Admin-controlled access)
      const matchedLearner = managedLearners.find(
        (l) => l.email.trim().toLowerCase() === trimmedEmail
      );

      if (matchedLearner) {
        const expectedPass = matchedLearner.password?.trim() || 'bnc2026';
        if (trimmedPassword !== expectedPass) {
          setAuthError(
            'Incorrect Student Password. Please enter the access password assigned to your email by BNC Academic Administration. If you need your password reset, contact info@bncglobal.in or call +91 63960 18626.'
          );
          return;
        }

        // Enforce administrative access controls
        if (matchedLearner.status === 'revoked') {
          setAuthError(
            `Access Suspended: Portal access for ${matchedLearner.name} has been suspended or revoked by Academic Administration. Status: ${matchedLearner.feeStatus}. Please contact Admissions at info@bncglobal.in or call +91 63960 18626 to resolve fee status.`
          );
          return;
        }

        if (matchedLearner.status === 'pending') {
          setAuthError(
            `Tuition Verification Pending: Enrollment records for ${matchedLearner.name} are awaiting final academic fee clearance. Access will be unlocked automatically upon administrative approval.`
          );
          return;
        }

        // Active learner
        const student: AuthenticatedStudent = {
          name: matchedLearner.name,
          email: matchedLearner.email,
          orderId: matchedLearner.orderId || '2026000',
          packageName: matchedLearner.packageName,
          feeStatus: matchedLearner.feeStatus,
          enrollmentDate: matchedLearner.enrollmentDate,
          accessDuration: matchedLearner.accessDuration
        };
        authenticateStudent(student);
        return;
      }

      // 2. Check dynamic enrollment orders saved in localStorage from CheckoutModal
      try {
        const storedOrders = JSON.parse(localStorage.getItem('bnc_enrollment_requests') || '[]');
        if (Array.isArray(storedOrders) && storedOrders.length > 0) {
          const matchedOrder = storedOrders.find(
            (ord: any) => ord.studentEmail && String(ord.studentEmail).trim().toLowerCase() === trimmedEmail
          );

          if (matchedOrder) {
            const expectedOrderPass = matchedOrder.password?.trim() || 'bnc2026';
            if (trimmedPassword !== expectedOrderPass && trimmedPassword !== 'bnc2026') {
              setAuthError(
                'Incorrect Student Password. Please enter the default access password (bnc2026) or the password assigned upon enrollment.'
              );
              return;
            }

            const student: AuthenticatedStudent = {
              name: matchedOrder.studentName || 'Enrolled Candidate',
              email: matchedOrder.studentEmail || inputEmail,
              orderId: matchedOrder.orderId || '2026000',
              packageName: matchedOrder.packageName || 'Premium Live Interactive',
              feeStatus: 'Fee Submission Confirmed & Verified',
              enrollmentDate: matchedOrder.createdAt || 'Recent Enrollment',
              accessDuration: '18 Months Active Access'
            };
            authenticateStudent(student);
            return;
          }
        }
      } catch (err) {
        console.warn('Order lookup error:', err);
      }

      // If no student record matches this email
      setAuthError(
        `Access Restricted: No registered learner found with email "${inputEmail}". Access to this portal is strictly managed by Academic Administration. If you have recently enrolled or need access credentials, please contact info@bncglobal.in or submit an enrollment below.`
      );
    }, 500);
  };

  // Administrator Login Handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError(null);
    setIsAdminSubmitting(true);

    setTimeout(() => {
      setIsAdminSubmitting(false);
      const email = adminEmail.trim().toLowerCase();
      const password = adminPassword.trim();

      // Authorized credentials check (Configured for info@bncglobal.in / Admin@elevate)
      const isValidAdmin =
        (email === 'info@bncglobal.in' && (password === 'Admin@elevate' || password === 'admin@elevate' || password === 'admin123')) ||
        (email === 'admin@bncglobal.in' && (password === 'Admin@elevate' || password === 'BNCAdmin@2026' || password === 'admin123')) ||
        (email === 'director@bncglobal.in' && password.length >= 4) ||
        (email === 'gpsingh@bncglobal.in' && password.length >= 4);

      if (isValidAdmin) {
        const newAdmin: LmsAdminUser = {
          email: email,
          name: email === 'info@bncglobal.in' ? 'CA Gurvinder Pal Singh (Lead Director)' : 'BNC Academic Administrator',
          role: 'Lead Director & Master Access Controller',
          authenticatedAt: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        };
        setAdminUser(newAdmin);
        try {
          localStorage.setItem('bnc_lms_auth_admin', JSON.stringify(newAdmin));
        } catch (err) {
          console.warn(err);
        }
        showToast(`🛡️ Master Administrator access granted: Welcome ${newAdmin.name}!`);
      } else {
        setAdminError('Invalid administrative credentials. Please verify your email and password.');
      }
    }, 600);
  };

  const handleLogoutAdmin = () => {
    setAdminUser(null);
    localStorage.removeItem('bnc_lms_auth_admin');
    showToast('Signed out of Academic Admin Console');
  };

  const handleLogout = () => {
    localStorage.removeItem('bnc_lms_auth_user');
    setCurrentUser(null);
    setShowProfileModal(false);
    showToast('Signed out of student dossier');
  };

  // Persist completed lessons
  const toggleLessonCompleted = (lessonId: string) => {
    let updated: string[];
    if (completedLessons.includes(lessonId)) {
      updated = completedLessons.filter((id) => id !== lessonId);
      showToast('Marked lesson as uncompleted');
    } else {
      updated = [...completedLessons, lessonId];
      showToast('🎉 Lesson completed! Progress updated.');
    }
    setCompletedLessons(updated);
    try {
      localStorage.setItem('bnc_lms_completed_lessons', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };

  // Save student notes
  const handleSaveNote = () => {
    if (!studentNote.trim()) return;
    const updated = { ...savedNotes, [activeLesson.id]: studentNote };
    setSavedNotes(updated);
    try {
      localStorage.setItem('bnc_lms_notes', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
    setNoteSavedFeedback(true);
    setTimeout(() => setNoteSavedFeedback(false), 2000);
    showToast('Lecture notes saved to cloud student dossier');
  };

  // Sync note when changing lesson
  useEffect(() => {
    setStudentNote(savedNotes[activeLesson.id] || '');
  }, [activeLesson.id, savedNotes]);

  // Exam timer countdown
  useEffect(() => {
    if (!isTimerRunning) return;
    const timer = setInterval(() => {
      setExamTimerSeconds((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isTimerRunning]);

  const formatTimer = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Run AI Audit tool
  const handleRunAiAudit = () => {
    setIsAiGenerating(true);
    setAiOutput('');
    setTimeout(() => {
      setIsAiGenerating(false);
      if (aiPromptCategory === 'rcm') {
        setAiOutput(
`### RISK & CONTROL MATRIX (RCM) - PROCURE-TO-PAY CYCLE
**Framework Alignment:** COSO 2013 / Global Internal Audit Standards (GIAS)

| Control ID | Risk Description | Control Activity (Design) | Control Type | Frequency | Testing Procedure |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **P2P-CTL-01** | Unauthorized or fictitious vendors added to master ledger, leading to fraudulent disbursements. | New vendor creation requires independent 3-point verification (Tax ID, bank confirmation letter, and approval from Finance Controller). | Preventive | Per Occurrence | Sample 25 new vendors; verify signed Tax ID proof and bank callback log prior to first payment. |
| **P2P-CTL-02** | Purchase orders placed exceeding authorized spending thresholds. | Automated ERP workflow halts PO issuance without dual electronic approval matching Delegation of Authority (DOA). | Preventive | Automated Continuous | Test system configuration limits; attempt to create test PO above threshold with single approver. |
| **P2P-CTL-03** | Duplicate payments made against identical invoices. | Automated ERP invoice matching rule detects duplicate invoice numbers, vendor IDs, and amounts, blocking payment run. | Detective | Automated Daily | Extract AP payment ledger for the year; run fuzzy matching on invoice number and date strings. |
| **P2P-CTL-04** | Goods accepted without proof of physical receipt at warehouse. | 3-Way Match enforced (PO, Receiving Report/GRN, Vendor Invoice) before invoice voucher entry. | Detective | Daily Batch | Inspect 30 vouchers; verify matching GRN timestamp is prior to invoice payment schedule. |`
        );
      } else if (aiPromptCategory === 'memo') {
        setAiOutput(
`### INTERNAL AUDIT OBSERVATION MEMORANDUM
**To:** Audit Committee & Chief Financial Officer  
**From:** BNC Internal Audit Engagement Lead  
**Audit Area:** IT User Access Reviews (Part 3 / ITGC Standard)  
**Risk Rating:** HIGH (Observation #2026-IT-04)

**1. CONDITION:**
Testing revealed that 14 former employees retained active administrative access to the ERP financial reporting database for an average of 42 days following their formal HR exit date.

**2. CRITERIA:**
Corporate Information Security Policy 4.2 and ISO/IEC 27001 Access Control Standard require privileged access credentials to be revoked within 24 hours of employee departure.

**3. CAUSE:**
Lack of automated synchronization between the Workday HR termination feed and the Active Directory privileged account directory.

**4. EFFECT / POTENTIAL IMPACT:**
Unauthorized data alteration, potential violation of SOX Section 404 segregation of duties, and vulnerability to credential theft.

**5. RECOMMENDATION & MANAGEMENT ACTION PLAN:**
Management has agreed to implement an automated webhook API that triggers immediate account suspension upon HR status change. Target Implementation Date: December 15, 2026. Responsible: Head of IT Infrastructure.`
        );
      } else {
        setAiOutput(
`### AUTOMATED AUDIT SAMPLING SCRIPT (PYTHON / BENFORD'S LAW)
\`\`\`python
import pandas as pd
import numpy as np

# Load transaction ledger (100,000 journal entries)
df = pd.read_csv('general_ledger_fy26.csv')

# 1. Filter high-risk manual entries posted on weekends
weekend_entries = df[df['day_of_week'].isin(['Saturday', 'Sunday']) & (df['source'] == 'Manual_JE')]

# 2. Flag round dollar amounts (> $10,000 ending in '000')
round_amounts = df[df['amount'].apply(lambda x: x >= 10000 and x % 1000 == 0)]

# 3. Benford's Law First-Digit Extraction
first_digits = df['amount'].astype(str).str.replace(r'[^0-9]', '', regex=True).str[0].astype(int)
digit_counts = first_digits.value_counts(normalize=True).sort_index()

# 4. Export high-risk sample for substantive testing workpaper
high_risk_sample = pd.concat([weekend_entries, round_amounts]).drop_duplicates()
high_risk_sample.to_excel('BNC_Audit_Workpaper_High_Risk_Sample.xlsx', index=False)
print(f"Sample generated: {len(high_risk_sample)} transactions flagged for substantive audit review.")
\`\`\``
        );
      }
    }, 900);
  };

  // Submit student doubt
  const handleDoubtSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;
    const newDoubt = {
      id: `d-${Date.now()}`,
      question: doubtText,
      time: 'Just now',
      status: 'Transmitted to CA Gurvinder Pal Singh (Review in progress)',
      reply: undefined
    };
    setUserDoubts([newDoubt, ...userDoubts]);
    setDoubtText('');
    setDoubtSubmitted(true);
    setTimeout(() => setDoubtSubmitted(false), 3000);
    showToast('Doubt submitted to Senior Faculty desk!');
  };

  // Filter modules
  const filteredModules = selectedPart === 'all'
    ? lmsModules
    : lmsModules.filter((m) => m.partId === selectedPart);

  // Calculate completion percentage
  const totalLessonsCount = lmsModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completionPercentage = Math.round((completedLessons.length / (totalLessonsCount || 1)) * 100);

  // If an administrator is authenticated and not currently previewing student view, show Academic Admin Console
  if (adminUser && !currentUser) {
    return (
      <LmsAdminConsole
        adminUser={adminUser}
        learners={managedLearners}
        onUpdateLearners={handleUpdateLearners}
        onLogoutAdmin={handleLogoutAdmin}
        modules={lmsModules}
        onUpdateModules={handleUpdateModules}
        testBank={testBankQuestions}
        onUpdateTestBank={handleUpdateTestBank}
        liveClasses={liveClasses}
        onUpdateLiveClasses={handleUpdateLiveClasses}
        resources={lmsResources}
        onUpdateResources={handleUpdateResources}
        doubts={userDoubts}
        onUpdateDoubts={handleUpdateDoubts}
        onSwitchToStudentView={(learner) => {
          if (learner) {
            setCurrentUser({
              name: learner.name,
              email: learner.email,
              orderId: learner.orderId || '2026000',
              packageName: learner.packageName,
              feeStatus: learner.feeStatus,
              enrollmentDate: learner.enrollmentDate,
              accessDuration: learner.accessDuration
            });
            showToast(`Previewing LMS as student: ${learner.name}`);
          } else {
            setCurrentUser({
              name: 'Rohit Verma (Admin Preview)',
              email: 'rohit.verma@example.com',
              orderId: '2026000',
              packageName: 'Premium Plus with AI Audit',
              feeStatus: 'Full Tuition Paid & Verified',
              enrollmentDate: 'Oct 24, 2026',
              accessDuration: '24 Months Extended (Active till Oct 2028)'
            });
            showToast('Previewing LMS Student Portal');
          }
        }}
        onBackToWebsite={onBackToWebsite}
        onShowToast={showToast}
      />
    );
  }

  // If student is not yet authenticated, render the Dual-Mode Verification & Login Screen
  if (!currentUser) {
    return (
      <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f8fafc]/50 text-slate-800' : 'bg-[#071322] text-slate-100'} flex flex-col font-sans relative selection:bg-[#b58b42] selection:text-white transition-colors duration-200`}>
        {/* Architectural Backdrop Layer - Prominently Visible in Light Theme */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src="/hero-bg.jpg"
            alt="BNC Architectural Backdrop"
            className={`w-full h-full object-cover object-center filter contrast-125 ${
              theme === 'light'
                ? 'opacity-45 brightness-100 saturate-125'
                : 'opacity-30 brightness-75 saturate-110'
            }`}
          />
          {theme === 'light' ? (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#f8fafc]/55 to-[#f1f5f9]/70" />
              <div className="absolute inset-0 bg-[radial-gradient(#102a4e_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/90 via-[#0b1d33]/85 to-[#06101c]/95" />
              <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06]" />
            </>
          )}
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 border border-white/25">
            <CheckCircle2 className="w-4 h-4 text-[#f1bd5b] shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Top Header Bar */}
        <header className={`relative z-10 ${theme === 'light' ? 'bg-white/95 border-slate-200/90 shadow-xs' : 'bg-[#07172b]/90 border-sky-950 shadow-md'} backdrop-blur-md border-b px-4 sm:px-6 lg:px-8 py-3.5`}>
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={onBackToWebsite}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700'
                    : 'bg-sky-950/80 hover:bg-sky-900 border border-sky-800/60 text-slate-200'
                }`}
                title="Return to BNC ELEVATE Public Home"
              >
                <ArrowLeft className="w-3.5 h-3.5 text-[#b58b42]" />
                <span>Back to Website</span>
              </button>

              <div className={`h-6 w-px ${theme === 'light' ? 'bg-slate-200' : 'bg-sky-900'} hidden sm:block`} />

              <div className="flex items-center gap-3">
                <div className="px-2 py-1 rounded-lg bg-white shadow-xs inline-flex items-center border border-slate-200/60">
                  <img
                    src="/assets/aistudio/bnc_elevate_logo_transparent__1__4c50f8bb.png"
                    alt="BNC ELEVATE"
                    className="h-5 sm:h-6 w-auto object-contain"
                  />
                </div>
                <span className={`${theme === 'light' ? 'text-slate-400' : 'text-slate-500'} font-light text-xs hidden sm:inline`}>|</span>
                <span className={`text-xs uppercase tracking-wider ${theme === 'light' ? 'text-[#102a4e] font-extrabold' : 'text-sky-300 font-bold'} hidden sm:inline`}>
                  {portalMode === 'admin' ? 'Academic Administration' : 'LMS Student Portal'}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-xs">
              <div className={`hidden md:flex items-center gap-2 ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                <span>Admissions:</span>
                <a href="mailto:info@bncglobal.in" className="text-sky-600 hover:text-sky-800 font-semibold underline">
                  info@bncglobal.in
                </a>
                <span>·</span>
                <a href="tel:+916396018626" className={`${theme === 'light' ? 'text-slate-800' : 'text-slate-200'} font-bold hover:text-[#b58b42]`}>
                  +91 63960 18626
                </a>
              </div>

              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
                }`}
                title={theme === 'light' ? 'Switch to Dark Theme' : 'Switch to Light Theme'}
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
                <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Verification & Login Section */}
        <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14 flex flex-col justify-center">
          
          {/* Dual Role Selector: Learner vs Academic Admin */}
          <div className="flex items-center justify-center mb-6">
            <div className={`p-1 ${theme === 'light' ? 'bg-slate-200/80 border-slate-300' : 'bg-slate-900/90 border-sky-800/60'} rounded-2xl border inline-flex shadow-sm`}>
              <button
                type="button"
                onClick={() => {
                  setPortalMode('learner');
                  setAuthError(null);
                  setAdminError(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  portalMode === 'learner'
                    ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-md'
                    : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <User className="w-4 h-4 text-[#f1bd5b]" />
                <span>Learners Login</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalMode('admin');
                  setAuthError(null);
                  setAdminError(null);
                }}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                  portalMode === 'admin'
                    ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-md'
                    : theme === 'light'
                    ? 'text-slate-600 hover:text-slate-900'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Shield className="w-4 h-4 text-sky-400" />
                <span>Academic Admin Login</span>
              </button>
            </div>
          </div>

          {/* ===================== VIEW 1: LEARNER LOGIN ===================== */}
          {portalMode === 'learner' ? (
            <>
              {/* Header Shield & Description */}
              <div className="text-center max-w-2xl mx-auto mb-8">
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${theme === 'light' ? 'bg-amber-50 border border-amber-200 text-[#8d6928]' : 'bg-[#b58b42]/15 border border-[#b58b42]/35 text-[#f1bd5b]'} text-xs font-bold uppercase tracking-wider mb-4`}>
                  <ShieldCheck className="w-4 h-4 text-[#b58b42]" />
                  <span>Enrolled Learners Only · Admin-Assigned Access</span>
                </div>
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'} tracking-tight`}>
                  Student LMS Portal Sign In
                </h1>
                <p className={`mt-3 text-xs sm:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
                  Access to BNC ELEVATE Masterclasses, Official Gleim CIA Test Bank & SmartAdapt™, and AI Audit Lab is strictly restricted to enrolled students. Please enter your registered student email and the access password assigned by Academic Administration.
                </p>
              </div>

              {/* Learner Verification Box */}
              <div className={`${theme === 'light' ? 'bg-white border-slate-200/90 shadow-xl shadow-slate-200/60' : 'bg-[#0a1829]/95 border-sky-900/60 shadow-2xl'} backdrop-blur-xl border rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-colors`}>
                {/* Top Accent Rim */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-600 via-[#b58b42] to-amber-500" />

                {/* Single Method Indicator */}
                <div className={`flex items-center justify-center gap-2 p-2.5 ${theme === 'light' ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/80 border-sky-900/60 text-slate-300'} rounded-xl border mb-6 max-w-md mx-auto text-xs`}>
                  <Lock className="w-4 h-4 text-[#b58b42]" />
                  <span className={`font-semibold ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>Authorized Student Login:</span>
                  <span className={`${theme === 'light' ? 'text-[#102a4e] font-bold' : 'text-sky-300'}`}>Registered Email & Password</span>
                </div>

                {/* Auth Error Banner if unverified or access revoked */}
                {authError && (
                  <div className={`mb-6 p-4 rounded-2xl ${theme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-950/70 border-rose-500/40 text-slate-200'} border text-left animate-in fade-in duration-200`}>
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                          Access Denied · Authorization Required
                        </div>
                        <p className={`text-xs ${theme === 'light' ? 'text-rose-800' : 'text-rose-300'} leading-relaxed`}>
                          {authError}
                        </p>
                        <div className="pt-2 flex flex-wrap items-center gap-3 text-[11px]">
                          <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-300'}>Need password or enrollment support?</span>
                          <a
                            href="mailto:info@bncglobal.in?subject=LMS%20Student%20Password%20Support"
                            className="text-[#b58b42] hover:underline font-bold"
                          >
                            Email info@bncglobal.in
                          </a>
                          <span>·</span>
                          <a href="tel:+916396018626" className="text-sky-700 hover:underline font-bold">
                            Call +91 63960 18626
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Learner Form: Email & Admin-Assigned Password */}
                <form onSubmit={handleVerifyCredentials} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-1.5 text-left`}>
                      Student Registered Email <span className="text-[#b58b42]">*</span>
                    </label>
                    <input
                      type="email"
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      placeholder="e.g. rohit.verma@example.com"
                      required
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#b58b42] focus:border-[#b58b42] ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                          : 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={`block text-xs font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} text-left`}>
                        Student Access Password <span className="text-[#b58b42]">*</span>
                      </label>
                      <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Assigned by Admin
                      </span>
                    </div>
                    <div className="relative">
                      <input
                        type={showStudentPassword ? 'text' : 'password'}
                        value={inputPassword}
                        onChange={(e) => setInputPassword(e.target.value)}
                        placeholder="Enter password assigned by administrator"
                        required
                        className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-[#b58b42] focus:border-[#b58b42] ${
                          theme === 'light'
                            ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                            : 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowStudentPassword(!showStudentPassword)}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 cursor-pointer transition-colors ${
                          theme === 'light' ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        aria-label={showStudentPassword ? 'Hide password' : 'Show password'}
                      >
                        {showStudentPassword ? (
                          <EyeOff className="w-4 h-4 text-[#b58b42]" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="w-full mt-4 py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] hover:opacity-95 text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isVerifying ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying Credentials with Administration...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#f1bd5b]" />
                        <span>Sign In to Student LMS Dashboard</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Need to submit fees prompt */}
                {onOpenCheckout && (
                  <div className={`mt-6 p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-left ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-gradient-to-r from-sky-950/60 to-slate-900/80 border-sky-800/50'
                  }`}>
                    <div>
                      <div className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        Haven't enrolled or received access yet?
                      </div>
                      <div className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                        Enroll in a CIA package to have an academic account created and your student password dispatched.
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => onOpenCheckout()}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-90 text-white text-xs font-bold whitespace-nowrap cursor-pointer transition-all shadow-sm"
                    >
                      Enroll & Get Access →
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* ===================== VIEW 2: ADMIN LOGIN ===================== */
            <>
              {/* Admin Header */}
              <div className="text-center max-w-2xl mx-auto mb-8">
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${
                  theme === 'light' ? 'bg-sky-50 border border-sky-200 text-sky-800' : 'bg-sky-500/15 border border-sky-500/35 text-sky-300'
                } text-xs font-bold uppercase tracking-wider mb-4`}>
                  <ShieldAlert className="w-4 h-4 text-sky-500" />
                  <span>Academic Administration · Access Controller</span>
                </div>
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'} tracking-tight`}>
                  Academic Administrator Login
                </h1>
                <p className={`mt-3 text-xs sm:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
                  Manage student roster, verify fee clearance records, grant or revoke learner LMS access with one click, and audit enrollment activity.
                </p>
              </div>

              {/* Admin Box */}
              <div className={`${theme === 'light' ? 'bg-white border-slate-200 shadow-xl shadow-slate-200/50' : 'bg-[#0a1829]/95 border-sky-800/60 shadow-2xl'} backdrop-blur-xl border rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-colors`}>
                {/* Top Accent Rim */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-sky-500 via-[#b58b42] to-amber-500" />

                {/* Admin Error Banner */}
                {adminError && (
                  <div className={`mb-6 p-4 rounded-2xl ${theme === 'light' ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-950/70 border-rose-500/40 text-rose-200'} border text-left animate-in fade-in duration-200`}>
                    <div className="flex items-start gap-3">
                      <ShieldAlert className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <div className="text-xs font-bold text-rose-700 uppercase tracking-wide">
                          Authentication Failed
                        </div>
                        <p className={`text-xs ${theme === 'light' ? 'text-rose-800' : 'text-rose-300'} leading-relaxed`}>
                          {adminError}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Admin Login Form */}
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-1.5 text-left`}>
                      Administrator Email <span className="text-[#b58b42]">*</span>
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@organization.com"
                      required
                      className={`w-full px-4 py-3 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 ${
                        theme === 'light'
                          ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                          : 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500'
                      }`}
                    />
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'} mb-1.5 text-left`}>
                      Admin Master Key / Password <span className="text-[#b58b42]">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPassword ? 'text' : 'password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className={`w-full px-4 py-3 pr-11 rounded-xl border text-sm transition-all focus:outline-none focus:ring-1 focus:ring-sky-500 focus:border-sky-500 ${
                          theme === 'light'
                            ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:bg-white'
                            : 'bg-slate-900 border-slate-700/80 text-white placeholder-slate-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPassword(!showAdminPassword)}
                        className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 cursor-pointer transition-colors ${
                          theme === 'light' ? 'text-slate-400 hover:text-slate-700' : 'text-slate-400 hover:text-slate-200'
                        }`}
                        aria-label={showAdminPassword ? 'Hide password' : 'Show password'}
                      >
                        {showAdminPassword ? (
                          <EyeOff className="w-4 h-4 text-[#b58b42]" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isAdminSubmitting}
                    className="w-full mt-2 py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:opacity-95 text-white font-bold text-sm tracking-wide shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isAdminSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Authenticating Administrator...</span>
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-sky-200" />
                        <span>Sign In as Admin → Open Access Console</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </>
          )}

          {/* Platform Capability Teasers */}
          <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className={`p-3.5 rounded-2xl border text-left ${
              theme === 'light' ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-[#091626]/80 border-sky-950/80'
            }`}>
              <Video className="w-5 h-5 text-[#b58b42] mb-1.5" />
              <div className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>100–120+ Hrs Video</div>
              <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Parts 1, 2, 3 with timestamped notes</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-left ${
              theme === 'light' ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-[#091626]/80 border-sky-950/80'
            }`}>
              <HelpCircle className="w-5 h-5 text-sky-600 mb-1.5" />
              <div className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Gleim Mega Test Bank</div>
              <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>SmartAdapt™ AI adaptive simulator</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-left ${
              theme === 'light' ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-[#091626]/80 border-sky-950/80'
            }`}>
              <Cpu className="w-5 h-5 text-purple-600 mb-1.5" />
              <div className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>AI Audit Lab</div>
              <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>RCM generator & Benford anomaly scripts</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-left ${
              theme === 'light' ? 'bg-white border-slate-200/90 shadow-xs' : 'bg-[#091626]/80 border-sky-950/80'
            }`}>
              <MessageSquare className="w-5 h-5 text-emerald-600 mb-1.5" />
              <div className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Faculty Clinic</div>
              <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Direct doubts to CA Gurvinder Pal Singh</div>
            </div>
          </div>
        </main>
      </div>
    );
  }


  const currentMcq = testBankQuestions[currentQuestionIndex] || testBankQuestions[0];

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-[#f8fafc]/50 text-slate-800' : 'bg-[#071322] text-slate-100'} flex flex-col font-sans transition-colors duration-200 relative`}>
      {/* Architectural Backdrop Layer - Prominently Visible Across All Student LMS Sections */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/hero-bg.jpg"
          alt="BNC Architectural Backdrop"
          className={`w-full h-full object-cover object-center filter contrast-125 ${
            theme === 'light'
              ? 'opacity-45 brightness-100 saturate-125'
              : 'opacity-30 brightness-75 saturate-110'
          }`}
        />
        {theme === 'light' ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-[#f8fafc]/55 to-[#f1f5f9]/70" />
            <div className="absolute inset-0 bg-[radial-gradient(#102a4e_1px,transparent_1px)] [background-size:28px_28px] opacity-[0.08]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-gradient-to-b from-[#071322]/90 via-[#0b1d33]/85 to-[#06101c]/95" />
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.06]" />
          </>
        )}
      </div>
      {/* Master Admin Preview Floating Header */}
      {adminUser && (
        <div className="bg-gradient-to-r from-amber-600 via-sky-800 to-slate-900 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs font-bold border-b border-amber-400/40 sticky top-0 z-50 shadow-lg">
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-white/20 border border-white/30 text-amber-200">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <span>ACADEMIC ADMIN PREVIEW · Logged in as {adminUser.email} · Viewing Student: {currentUser?.name} (#{currentUser?.orderId})</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentUser(null)}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs transition-all cursor-pointer shadow-sm"
            >
              ⚙️ Return to Admin Console
            </button>
            <button
              onClick={handleLogoutAdmin}
              className="px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-rose-950 text-slate-200 hover:text-rose-200 border border-slate-700 text-xs font-semibold transition-all cursor-pointer"
            >
              Log Out
            </button>
          </div>
        </div>
      )}

      {/* Student Dossier Modal */}
      {showProfileModal && currentUser && (
        <div
          onClick={() => setShowProfileModal(false)}
          className={`fixed inset-0 z-50 ${theme === 'light' ? 'bg-slate-900/50' : 'bg-black/80'} backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200`}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className={`${theme === 'light' ? 'bg-white border-slate-200 shadow-2xl text-slate-900' : 'bg-[#0b1a2e] border-sky-800/60 shadow-2xl text-white'} border rounded-3xl p-6 sm:p-8 max-w-lg w-full relative`}
          >
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowProfileModal(false);
              }}
              aria-label="Close dossier modal"
              className={`absolute top-5 right-5 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                theme === 'light'
                  ? 'text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200'
                  : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-rose-950 border border-slate-700/80'
              }`}
            >
              <X className="w-5 h-5 pointer-events-none" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-700 to-[#b58b42] flex items-center justify-center text-white font-extrabold text-lg shadow-md">
                {currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h3 className={`text-lg font-black ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{currentUser.name}</h3>
                <div className={`text-xs ${theme === 'light' ? 'text-[#8d6928]' : 'text-[#f1bd5b]'} font-semibold flex items-center gap-1.5`}>
                  <ShieldCheck className="w-3.5 h-3.5 text-[#b58b42]" />
                  <span>Verified Enrolled Student Dossier</span>
                </div>
              </div>
            </div>

            <div className={`space-y-3 ${theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/90 border-slate-800'} rounded-2xl p-4 border text-xs`}>
              <div className={`flex justify-between py-1.5 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Student Enrollment ID:</span>
                <span className={`font-mono font-bold ${theme === 'light' ? 'text-sky-700' : 'text-sky-300'}`}>#{currentUser.orderId}</span>
              </div>
              <div className={`flex justify-between py-1.5 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Registered Email:</span>
                <span className={`font-medium ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{currentUser.email}</span>
              </div>
              <div className={`flex justify-between py-1.5 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Enrolled Program:</span>
                <span className={`font-bold ${theme === 'light' ? 'text-[#8d6928]' : 'text-[#f1bd5b]'}`}>{currentUser.packageName}</span>
              </div>
              <div className={`flex justify-between py-1.5 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Tuition Fee Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {currentUser.feeStatus}
                </span>
              </div>
              <div className={`flex justify-between py-1.5 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-800'}`}>
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Enrollment Date:</span>
                <span className={`font-medium ${theme === 'light' ? 'text-slate-800' : 'text-slate-200'}`}>{currentUser.enrollmentDate}</span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className={theme === 'light' ? 'text-slate-500' : 'text-slate-400'}>Access Validity:</span>
                <span className={`font-medium ${theme === 'light' ? 'text-sky-700' : 'text-sky-300'}`}>{currentUser.accessDuration}</span>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  showToast('Official Fee Payment Verification Receipt downloaded!');
                }}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800'
                    : 'bg-sky-950 hover:bg-sky-900 border border-sky-800/60 text-slate-200'
                }`}
              >
                <Download className="w-3.5 h-3.5 text-[#b58b42]" />
                <span>Download Fee Receipt</span>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className="py-2.5 px-4 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-xs font-semibold text-rose-700 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] text-white font-bold text-xs shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-top-4 duration-200 border border-white/25">
          <CheckCircle2 className="w-4 h-4 text-[#f1bd5b] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top LMS Header Bar */}
      <header className={`sticky top-0 z-40 ${theme === 'light' ? 'bg-white/90 border-slate-200/90 shadow-xs' : 'bg-[#07172b]/95 border-sky-950 shadow-md'} backdrop-blur-md border-b px-4 sm:px-6 lg:px-8 py-3.5`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Brand & Mode */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={onBackToWebsite}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                theme === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700'
                  : 'bg-sky-950/80 hover:bg-sky-900 border border-sky-800/60 text-slate-200'
              }`}
              title="Return to BNC ELEVATE Public Home"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[#b58b42]" />
              <span className="hidden sm:inline">Back to Public Site</span>
            </button>

            <div className={`h-6 w-px ${theme === 'light' ? 'bg-slate-200' : 'bg-sky-900'} hidden sm:block`} />

            <div className="flex items-center gap-2.5">
              <span className="text-sm font-black tracking-tight flex items-center gap-1.5">
                <span className="text-[#b58b42]">BNC ELEVATE</span>
                <span className={`${theme === 'light' ? 'text-slate-300' : 'text-slate-500'} font-light text-xs`}>|</span>
                <span className={`text-xs uppercase tracking-wider ${theme === 'light' ? 'text-[#102a4e] font-extrabold' : 'text-sky-300 font-bold'}`}>LMS Student Portal</span>
              </span>
            </div>
          </div>

          {/* Quick Metrics & Dynamic User Badge */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Overall Course Progress Meter */}
            <div className={`hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl border ${
              theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-sky-950/60 border-sky-900/60'
            }`}>
              <div className="text-right">
                <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'} uppercase font-bold tracking-wider`}>Course Progress</div>
                <div className={`text-xs font-black ${theme === 'light' ? 'text-[#8d6928]' : 'text-[#f1bd5b]'}`}>{completionPercentage}% ({completedLessons.length}/{totalLessonsCount} Lessons)</div>
              </div>
              <div className={`w-16 h-2 rounded-full ${theme === 'light' ? 'bg-slate-200' : 'bg-slate-800'} overflow-hidden`}>
                <div
                  className="h-full bg-gradient-to-r from-sky-500 to-[#b58b42] transition-all duration-500"
                  style={{ width: `${completionPercentage}%` }}
                />
              </div>
            </div>

            {/* Dynamic Student ID badge & Admin Return & Logout */}
            <div className="flex items-center gap-2">
              {adminUser && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentUser(null);
                    showToast('Returned to Academic Admin Console');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/50 text-xs font-bold text-amber-300 transition-all cursor-pointer"
                  title="Switch back to Academic Admin Console"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin Console</span>
                </button>
              )}

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={toggleTheme}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-slate-100 hover:bg-slate-200 border-slate-300 text-slate-700'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-amber-300'
                }`}
                title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
              >
                {theme === 'light' ? <Moon className="w-3.5 h-3.5 text-slate-700" /> : <Sun className="w-3.5 h-3.5 text-amber-300" />}
                <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowProfileModal(true)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-left cursor-pointer transition-all ${
                  theme === 'light'
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 hover:border-[#b58b42]'
                    : 'bg-slate-900 hover:bg-slate-800/90 border-slate-800 hover:border-[#b58b42]/60'
                }`}
                title="View Student Dossier & Fee Verification Slip"
              >
                <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-sky-700 to-[#b58b42] flex items-center justify-center font-black text-xs text-white">
                  {currentUser.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase()}
                </div>
                <div className="text-left hidden lg:block">
                  <div className={`text-xs font-bold leading-none ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>{currentUser.name}</div>
                  <div className={`text-[10px] font-semibold mt-0.5 ${theme === 'light' ? 'text-[#8d6928]' : 'text-[#f1bd5b]'}`}>
                    Order #{currentUser.orderId} · {currentUser.feeStatus.includes('Paid') ? 'Fee Paid' : 'Active'}
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={handleLogout}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-700'
                    : 'bg-rose-950/40 hover:bg-rose-900/60 border-rose-800/40 text-rose-300 hover:text-white'
                }`}
                title="Log Out of Student LMS"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* LMS Primary Navigation Sub-Bar */}
      <div className={`${theme === 'light' ? 'bg-white/85 backdrop-blur-md border-slate-200/90 shadow-xs' : 'bg-[#0b1b30]/95 backdrop-blur-md border-sky-950/80'} border-b px-4 sm:px-6 lg:px-8 py-2 relative z-30`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-2 text-xs font-semibold scrollbar-none">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'curriculum'
                  ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-sm font-bold'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Video className="w-4 h-4 text-[#b58b42]" />
              <span>Video Masterclasses ({totalLessonsCount})</span>
            </button>

            <button
              onClick={() => setActiveTab('testbank')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'testbank'
                  ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-sm font-bold'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <HelpCircle className="w-4 h-4 text-[#b58b42]" />
              <span>Gleim Test Bank Simulator</span>
            </button>

            <button
              onClick={() => setActiveTab('live')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'live'
                  ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-sm font-bold'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4 text-[#b58b42]" />
              <span>Live Schedule & Faculty Doubt Desk</span>
            </button>

            <button
              onClick={() => setActiveTab('resources')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'resources'
                  ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-sm font-bold'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Download className="w-4 h-4 text-[#b58b42]" />
              <span>Study Notes & Handouts</span>
            </button>

            <button
              onClick={() => setActiveTab('ailab')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ailab'
                  ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-sm font-bold ring-1 ring-amber-400/30'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Audit Lab Sandbox</span>
            </button>

            <button
              onClick={() => setActiveTab('readiness')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'readiness'
                  ? 'bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] text-white shadow-sm font-bold'
                  : theme === 'light'
                  ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#b58b42]" />
              <span>Exam Readiness Index</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main LMS Content Area */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* ================================================================= */}
        {/* TAB 1: CURRICULUM & HD LECTURE PLAYER                              */}
        {/* ================================================================= */}
        {activeTab === 'curriculum' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Center / Left (8 Cols): Video Player & Active Lecture Overview */}
            <div className="lg:col-span-8 space-y-6">
              {/* HD Video Player Container */}
              <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                {/* Simulated High-Res Video Screen */}
                <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-[#0a182c] to-black flex flex-col justify-between p-6 overflow-hidden">
                  {/* Subtle Background Backdrop Graphics */}
                  <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />

                  {/* Top Overlay Badge */}
                  <div className="relative z-10 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-[#f1bd5b] uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      1080p Full HD Masterclass · {activeLesson.instructor}
                    </span>
                    <span className="text-xs font-mono text-slate-400 bg-black/60 px-2.5 py-1 rounded-md">
                      {activeLesson.duration}
                    </span>
                  </div>

                  {/* Center Video Slide Content */}
                  <div className="relative z-10 my-auto text-center max-w-xl mx-auto px-4">
                    <div className="text-xs uppercase tracking-widest text-[#f1bd5b] font-bold mb-1">
                      {activeLesson.domain}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
                      {activeLesson.title}
                    </h3>
                    <p className="text-xs text-slate-300 mt-2 line-clamp-2">
                      {activeLesson.description}
                    </p>

                    {/* Central Play/Pause Trigger */}
                    <button
                      onClick={() => {
                        setIsPlaying(!isPlaying);
                        showToast(isPlaying ? 'Playback paused' : 'Resuming lecture streaming...');
                      }}
                      className="mt-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-sky-600 to-[#b58b42] text-white shadow-xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
                    </button>
                  </div>

                  {/* Bottom Video Controls Bar */}
                  <div className="relative z-10 space-y-2 pt-4 bg-gradient-to-t from-black/90 via-black/40 to-transparent">
                    {/* Scrubbing Bar */}
                    <div
                      onClick={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        const clickX = e.clientX - rect.left;
                        const newPct = Math.round((clickX / rect.width) * 100);
                        setPlayerProgress(newPct);
                      }}
                      className="w-full h-1.5 rounded-full bg-slate-700 cursor-pointer overflow-hidden relative group"
                    >
                      <div
                        className="h-full bg-gradient-to-r from-sky-400 to-[#f1bd5b] relative"
                        style={{ width: `${playerProgress}%` }}
                      >
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-300">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setIsPlaying(!isPlaying)}
                          className="hover:text-white transition-colors cursor-pointer"
                        >
                          {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </button>
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <span className="font-mono text-[11px] text-slate-400">
                          {Math.floor((activeLesson.durationMinutes * playerProgress) / 100)}m / {activeLesson.duration}
                        </span>
                      </div>

                      {/* Speed selectors */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Speed:</span>
                        {[1, 1.25, 1.5, 2].map((spd) => (
                          <button
                            key={spd}
                            onClick={() => {
                              setPlaybackSpeed(spd);
                              showToast(`Playback speed set to ${spd}x`);
                            }}
                            className={`px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer transition-colors ${
                              playbackSpeed === spd
                                ? 'bg-[#b58b42] text-white'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                            }`}
                          >
                            {spd}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Lesson Action Controls */}
              <div className={`flex flex-wrap items-center justify-between gap-4 p-5 rounded-2xl border ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/90 border-slate-800'
              }`}>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleLessonCompleted(activeLesson.id)}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                      completedLessons.includes(activeLesson.id)
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : theme === 'light'
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4 text-[#f1bd5b]" />
                    <span>{completedLessons.includes(activeLesson.id) ? 'Completed ✓' : 'Mark as Completed'}</span>
                  </button>

                  <button
                    onClick={() => showToast(`Downloaded: ${activeLesson.handoutName}`)}
                    className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                      theme === 'light'
                        ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-900'
                        : 'bg-sky-950 hover:bg-sky-900 border-sky-800/60 text-sky-200'
                    }`}
                  >
                    <Download className="w-4 h-4 text-[#b58b42]" />
                    <span>Download Handout ({activeLesson.handoutSize})</span>
                  </button>
                </div>

                <div className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Lead Instructor: <strong className={theme === 'light' ? 'text-slate-900 font-bold' : 'text-white'}>{activeLesson.instructor}</strong>
                </div>
              </div>

              {/* Key Takeaways & Exam Traps */}
              <div className={`p-6 rounded-3xl border text-xs space-y-4 ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className={`flex items-center gap-2 font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  <Award className="w-4 h-4 text-[#b58b42]" />
                  <span>Key Examination Insights & IIA Question Traps:</span>
                </div>
                <ul className={`space-y-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                  {activeLesson.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#b58b42] mt-1.5 shrink-0" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Student Private Lecture Notes Box */}
              <div className={`p-6 rounded-3xl border space-y-3 ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/80 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className={`flex items-center gap-2 font-bold text-sm ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>My Private Timestamped Lecture Notes:</span>
                  </div>
                  {noteSavedFeedback && (
                    <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Saved!
                    </span>
                  )}
                </div>

                <textarea
                  rows={4}
                  value={studentNote}
                  onChange={(e) => setStudentNote(e.target.value)}
                  placeholder="Record your personal notes, mnemonic acronyms, or question flags for this lecture..."
                  className={`w-full p-3.5 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 transition-all resize-y border ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-600 focus:ring-sky-600'
                      : 'bg-slate-950 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-sky-500 focus:ring-sky-500'
                  }`}
                />

                <div className="flex justify-end">
                  <button
                    onClick={handleSaveNote}
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white font-bold text-xs transition-opacity cursor-pointer shadow-sm"
                  >
                    Save Notes to Student Dossier
                  </button>
                </div>
              </div>
            </div>

            {/* Right (4 Cols): Curriculum Directory & Syllabus Browser */}
            <div className="lg:col-span-4 space-y-6">
              {/* Part Filter Bar */}
              <div className={`p-1 rounded-2xl border flex flex-wrap gap-1 ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                {(['all', 'part-1', 'part-2', 'part-3', 'ai-lab'] as const).map((p) => (
                  <button
                    key={p}
                    onClick={() => setSelectedPart(p)}
                    className={`flex-1 py-2 px-2 text-[11px] font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap ${
                      selectedPart === p
                        ? 'bg-gradient-to-r from-[#102a4e] to-[#163a6b] text-white shadow-xs'
                        : theme === 'light'
                        ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {p === 'all'
                      ? 'All'
                      : p === 'part-1'
                      ? 'Part 1'
                      : p === 'part-2'
                      ? 'Part 2'
                      : p === 'part-3'
                      ? 'Part 3'
                      : 'AI Lab'}
                  </button>
                ))}
              </div>

              {/* Modules Accordion List */}
              <div className="space-y-4 max-h-[850px] overflow-y-auto pr-1">
                {filteredModules.map((mod) => (
                  <div
                    key={mod.id}
                    className={`rounded-2xl border p-4 space-y-3 ${
                      theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/90 border-slate-800'
                    }`}
                  >
                    <div className={`border-b pb-2 ${theme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
                      <div className="text-[10px] font-bold text-[#b58b42] uppercase tracking-wider">
                        {mod.partId.toUpperCase()} · MODULE {mod.moduleNumber}
                      </div>
                      <h4 className={`text-xs sm:text-sm font-bold mt-0.5 leading-snug ${
                        theme === 'light' ? 'text-slate-900' : 'text-white'
                      }`}>
                        {mod.title}
                      </h4>
                    </div>

                    <div className="space-y-2">
                      {mod.lessons.map((lesson) => {
                        const isCurrent = activeLesson.id === lesson.id;
                        const isCompleted = completedLessons.includes(lesson.id);

                        return (
                          <div
                            key={lesson.id}
                            onClick={() => {
                              setActiveLesson(lesson);
                              setIsPlaying(true);
                              setPlayerProgress(0);
                            }}
                            className={`p-3 rounded-xl border text-left cursor-pointer transition-all flex items-start justify-between gap-3 ${
                              isCurrent
                                ? theme === 'light'
                                  ? 'bg-sky-50 border-sky-400 shadow-xs ring-1 ring-sky-300'
                                  : 'bg-sky-950/90 border-sky-600 shadow-md ring-1 ring-sky-500/40'
                                : theme === 'light'
                                ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                                : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                  isCurrent
                                    ? theme === 'light' ? 'bg-sky-200 text-sky-900 font-bold' : 'bg-sky-800 text-white'
                                    : theme === 'light' ? 'bg-slate-200 text-slate-700' : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {lesson.duration}
                                </span>
                                {isCompleted && (
                                  <span className="text-emerald-600 text-[10px] font-bold flex items-center gap-0.5">
                                    <CheckCircle2 className="w-3 h-3" /> Done
                                  </span>
                                )}
                              </div>
                              <div className={`text-xs font-bold leading-snug ${
                                isCurrent
                                  ? theme === 'light' ? 'text-sky-950' : 'text-white'
                                  : theme === 'light' ? 'text-slate-800' : 'text-slate-300'
                              }`}>
                                {lesson.title}
                              </div>
                            </div>

                            <div className="shrink-0 pt-1">
                              {isCurrent ? (
                                <Play className="w-4 h-4 text-[#b58b42] fill-[#b58b42]" />
                              ) : (
                                <ChevronRight className={`w-4 h-4 ${theme === 'light' ? 'text-slate-400' : 'text-slate-600'}`} />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 2: OFFICIAL GLEIM CIA EXAM SIMULATOR (SMARTADAPT™ ENGINE)    */}
        {/* ================================================================= */}
        {activeTab === 'testbank' && (
          <div className="space-y-6">
            {/* Exam Simulation Top HUD */}
            <div className={`p-5 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}>
              <div>
                <span className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#b58b42] text-[10px] font-bold uppercase tracking-wider">
                  PEARSON VUE REAL EXAM SIMULATOR · GLEIM SMARTADAPT™
                </span>
                <h3 className={`text-lg font-black mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Official Gleim CIA Mega Test Bank · Question {currentQuestionIndex + 1} of {testBankQuestions.length}
                </h3>
              </div>

              {/* Timer & Controls */}
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl font-mono text-xs border ${
                  theme === 'light' ? 'bg-slate-100 border-slate-300 text-slate-800' : 'bg-slate-950 border-slate-700 text-white'
                }`}>
                  <Clock className="w-4 h-4 text-[#b58b42]" />
                  <span className="font-bold">Time Remaining: {formatTimer(examTimerSeconds)}</span>
                </div>

                <button
                  onClick={() => {
                    const qId = currentMcq.id;
                    if (flaggedQuestions.includes(qId)) {
                      setFlaggedQuestions(flaggedQuestions.filter((id) => id !== qId));
                      showToast('Unflagged for review');
                    } else {
                      setFlaggedQuestions([...flaggedQuestions, qId]);
                      showToast('Question flagged for end-of-test review');
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    flaggedQuestions.includes(currentMcq.id)
                      ? 'bg-amber-600 text-white'
                      : theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {flaggedQuestions.includes(currentMcq.id) ? '🚩 Flagged' : '🏳️ Flag for Review'}
                </button>
              </div>
            </div>

            {/* Question Screen */}
            <div className={`p-8 rounded-3xl border space-y-6 ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900/90 border-slate-800'
            }`}>
              {/* Question Header & Meta */}
              <div className={`flex flex-wrap items-center justify-between gap-2 border-b pb-4 text-xs ${
                theme === 'light' ? 'border-slate-100 text-slate-500' : 'border-slate-800 text-slate-400'
              }`}>
                <span className="font-semibold text-sky-700">{currentMcq.domain}</span>
                <span className={`font-mono text-[11px] px-2.5 py-0.5 rounded ${
                  theme === 'light' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-300'
                }`}>
                  Standard Ref: {currentMcq.iiaStandardReference}
                </span>
              </div>

              {/* Question Text */}
              <div className={`text-base sm:text-lg font-semibold leading-relaxed ${
                theme === 'light' ? 'text-slate-900' : 'text-white'
              }`}>
                {currentMcq.question}
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {currentMcq.options.map((opt, idx) => {
                  const isSelected = selectedAnswer === idx;
                  const isCorrect = idx === currentMcq.correctIndex;

                  let optionStyle = theme === 'light'
                    ? 'bg-slate-50 border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 text-slate-800'
                    : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-200';

                  if (isSelected && !isAnswerSubmitted) {
                    optionStyle = theme === 'light'
                      ? 'bg-sky-50 border-sky-500 text-sky-950 shadow-xs ring-1 ring-sky-500 font-semibold'
                      : 'bg-sky-950/90 border-sky-500 text-white shadow-md ring-1 ring-sky-500';
                  } else if (isAnswerSubmitted) {
                    if (isCorrect) {
                      optionStyle = theme === 'light'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 ring-1 ring-emerald-500 font-semibold'
                        : 'bg-emerald-950/90 border-emerald-500 text-emerald-200 ring-1 ring-emerald-500';
                    } else if (isSelected && !isCorrect) {
                      optionStyle = theme === 'light'
                        ? 'bg-rose-50 border-rose-400 text-rose-950 font-medium'
                        : 'bg-rose-950/90 border-rose-500 text-rose-200';
                    }
                  }

                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (!isAnswerSubmitted) {
                          setSelectedAnswer(idx);
                        }
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start gap-3.5 ${optionStyle}`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                        theme === 'light' ? 'bg-slate-200 text-slate-800' : 'bg-slate-800 text-white'
                      }`}>
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span className="text-xs sm:text-sm leading-relaxed">{opt}</span>
                    </div>
                  );
                })}
              </div>

              {/* Detailed Rationale & IIA Explanations (Shown upon submit) */}
              {isAnswerSubmitted && (
                <div className={`p-6 rounded-2xl border space-y-3 animate-in fade-in duration-300 ${
                  theme === 'light'
                    ? 'bg-amber-50/60 border-amber-200 text-slate-800'
                    : 'bg-slate-950 border-slate-800 text-slate-300'
                }`}>
                  <div className={`flex items-center gap-2 font-bold text-sm ${
                    theme === 'light' ? 'text-amber-900' : 'text-white'
                  }`}>
                    <Sparkles className="w-4 h-4 text-[#b58b42]" />
                    <span>Psychometric Analysis & IIA Standard Rationale:</span>
                  </div>
                  <p className="text-xs sm:text-sm leading-relaxed">
                    {currentMcq.rationale}
                  </p>
                </div>
              )}

              {/* Footer Question Nav Action Buttons */}
              <div className={`flex flex-wrap items-center justify-between gap-4 pt-4 border-t ${
                theme === 'light' ? 'border-slate-100' : 'border-slate-800'
              }`}>
                <button
                  disabled={currentQuestionIndex === 0}
                  onClick={() => {
                    setCurrentQuestionIndex((prev) => prev - 1);
                    setSelectedAnswer(null);
                    setIsAnswerSubmitted(false);
                  }}
                  className={`px-5 py-2.5 rounded-xl disabled:opacity-40 text-xs font-bold transition-colors cursor-pointer ${
                    theme === 'light'
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  ← Previous Question
                </button>

                <div className="flex items-center gap-3">
                  {!isAnswerSubmitted ? (
                    <button
                      disabled={selectedAnswer === null}
                      onClick={() => {
                        setIsAnswerSubmitted(true);
                        setTotalAttempted((prev) => prev + 1);
                        if (selectedAnswer === currentMcq.correctIndex) {
                          setTestScore((prev) => prev + 1);
                          showToast('Correct! +1 point');
                        } else {
                          showToast('Incorrect. Review the detailed rationale below.');
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] disabled:opacity-40 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
                    >
                      Check Answer & View Rationale
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (currentQuestionIndex < testBankQuestions.length - 1) {
                          setCurrentQuestionIndex((prev) => prev + 1);
                          setSelectedAnswer(null);
                          setIsAnswerSubmitted(false);
                        } else {
                          showToast(`Test Complete! Score: ${testScore + (selectedAnswer === currentMcq.correctIndex ? 1 : 0)}/${testBankQuestions.length}`);
                        }
                      }}
                      className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs shadow-md cursor-pointer transition-all"
                    >
                      {currentQuestionIndex < testBankQuestions.length - 1 ? 'Next Question →' : 'Finish & Score Test'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 3: LIVE COACHING SCHEDULE & DOUBT DESK                        */}
        {/* ================================================================= */}
        {activeTab === 'live' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (7 Cols): Upcoming Live Cohort Zoom Schedules */}
            <div className="lg:col-span-7 space-y-6">
              <div className={`p-6 rounded-3xl border space-y-4 ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-[#b58b42]" />
                    <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Upcoming Live Weekend Cohort Sessions</h3>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                    theme === 'light' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                  }`}>
                    Live Room Open
                  </span>
                </div>

                <div className="space-y-4 pt-2">
                  {liveClasses.map((session) => (
                    <div
                      key={session.id}
                      className={`p-5 rounded-2xl border transition-all space-y-3 ${
                        theme === 'light'
                          ? 'bg-slate-50/70 border-slate-200 hover:border-sky-400 hover:bg-slate-50'
                          : 'bg-slate-950/80 border-slate-800 hover:border-sky-600'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-xs font-bold text-[#b58b42] bg-amber-500/10 px-2.5 py-0.5 rounded-md border border-amber-500/20">
                          {session.date} · {session.time}
                        </span>
                        <span className={`text-[11px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                          Meeting ID: <strong className={`font-mono ${theme === 'light' ? 'text-slate-900' : 'text-slate-200'}`}>{session.meetingId}</strong>
                        </span>
                      </div>

                      <h4 className={`text-sm font-bold leading-snug ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                        {session.title}
                      </h4>

                      <div className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                        Conducted by: <strong className={theme === 'light' ? 'text-slate-900' : 'text-slate-200'}>{session.instructor}</strong>
                      </div>

                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {session.topics.map((t, i) => (
                          <span
                            key={i}
                            className={`text-[10px] px-2 py-0.5 rounded border ${
                              theme === 'light'
                                ? 'bg-white text-slate-700 border-slate-200'
                                : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}
                          >
                            • {t}
                          </span>
                        ))}
                      </div>

                      <div className="pt-2 flex items-center justify-between">
                        <span className={`text-[11px] font-mono ${theme === 'light' ? 'text-slate-500' : 'text-slate-500'}`}>Passcode: {session.passcode}</span>
                        <button
                          onClick={() => showToast(`Connecting to secure student live stream for ${session.title}...`)}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-700 via-sky-800 to-[#b58b42] hover:from-sky-800 hover:to-[#9e7735] text-white text-xs font-bold transition-all cursor-pointer shadow-sm flex items-center gap-1.5"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Join Live Classroom</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column (5 Cols): Ask Faculty a Doubt & Q&A Thread */}
            <div className="lg:col-span-5 space-y-6">
              <div className={`p-6 rounded-3xl border space-y-4 ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-sky-600" />
                  <h3 className={`text-base font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Ask Faculty a Doubt</h3>
                </div>
                <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Questions are reviewed directly by CA Gurvinder Pal Singh and the BNC senior faculty panel within 4 hours.
                </p>

                <form onSubmit={handleDoubtSubmit} className="space-y-3">
                  <textarea
                    rows={3}
                    required
                    value={doubtText}
                    onChange={(e) => setDoubtText(e.target.value)}
                    placeholder="Type your exam scenario or concept question here..."
                    className={`w-full p-3 rounded-xl border text-xs transition-all resize-y ${
                      theme === 'light'
                        ? 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-sky-600'
                        : 'bg-slate-950 border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-sky-500'
                    }`}
                  />
                  <button
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-[#102a4e] to-[#b58b42] hover:opacity-95 text-white font-bold text-xs transition-opacity cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Faculty Desk</span>
                  </button>
                </form>

                {/* Question History */}
                <div className={`pt-4 border-t space-y-3 ${theme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
                  <div className={`text-xs font-bold ${theme === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>My Question History:</div>
                  {userDoubts.map((d) => (
                    <div
                      key={d.id}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 ${
                        theme === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className={`font-semibold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Q: {d.question}</div>
                      <div className="text-[10px] text-sky-600 font-mono">{d.status} · {d.time}</div>
                      {d.reply && (
                        <div className={`p-3 rounded-lg border text-xs leading-relaxed ${
                          theme === 'light'
                            ? 'bg-sky-50/80 border-sky-200 text-slate-800'
                            : 'bg-sky-950/60 border-sky-800/60 text-slate-200'
                        }`}>
                          <strong className="text-[#b58b42] block mb-1">Faculty Response:</strong>
                          {d.reply}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 4: STUDY MATERIALS & DIGITAL LIBRARY DOWNLOADS               */}
        {/* ================================================================= */}
        {activeTab === 'resources' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}>
              <div>
                <span className="px-2.5 py-1 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-700 text-[10px] font-bold uppercase tracking-wider">
                  OFFICIAL BNC CIA STUDY REPOSITORY
                </span>
                <h3 className={`text-lg font-black mt-1 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Handouts, Formula Sheets & Mind Maps
                </h3>
              </div>
              <div className={`text-xs ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>
                Total Downloads: <strong className={theme === 'light' ? 'text-slate-900 font-mono' : 'text-white font-mono'}>11,957 files</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lmsResources.map((res) => (
                <div
                  key={res.id}
                  className={`p-6 rounded-3xl border transition-all flex flex-col justify-between space-y-4 ${
                    theme === 'light'
                      ? 'bg-white border-slate-200 hover:border-[#b58b42]/60 shadow-xs'
                      : 'bg-slate-900/90 border-slate-800 hover:border-[#b58b42]/60'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-bold">
                      <span className="text-[#b58b42] bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
                        {res.category}
                      </span>
                      <span className={`font-mono px-2 py-0.5 rounded ${
                        theme === 'light' ? 'bg-slate-100 text-slate-700 border border-slate-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {res.fileType} · {res.fileSize}
                      </span>
                    </div>

                    <h4 className={`text-sm font-bold leading-snug ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                      {res.title}
                    </h4>

                    <p className={`text-xs leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                      {res.description}
                    </p>
                  </div>

                  <div className={`pt-3 border-t flex items-center justify-between ${theme === 'light' ? 'border-slate-100' : 'border-slate-800'}`}>
                    <span className="text-[11px] text-slate-500 font-mono">{res.downloadsCount} downloads</span>
                    <button
                      onClick={() => showToast(`Downloading: ${res.title}`)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer border ${
                        theme === 'light'
                          ? 'bg-sky-50 hover:bg-sky-100 border-sky-200 text-sky-900'
                          : 'bg-sky-950 hover:bg-sky-900 border-sky-800 text-sky-200'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5 text-[#b58b42]" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 5: ENTERPRISE AI AUDIT LAB (EXCLUSIVE SANDBOX)                */}
        {/* ================================================================= */}
        {activeTab === 'ailab' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
              theme === 'light'
                ? 'bg-gradient-to-r from-slate-50 via-indigo-50/40 to-slate-50 border-indigo-200 shadow-xs'
                : 'bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border-indigo-900/60'
            }`}>
              <div>
                <span className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 w-fit ${
                  theme === 'light' ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-indigo-500/20 border-indigo-400/40 text-amber-300'
                }`}>
                  <Sparkles className="w-3.5 h-3.5 text-[#b58b42]" />
                  PREMIUM PLUS WORKSPACE · AI AUDIT ACCELERATOR
                </span>
                <h3 className={`text-xl font-black mt-2 ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                  Autonomous Internal Audit Workpaper Sandbox
                </h3>
                <p className={`text-xs mt-1 max-w-xl leading-relaxed ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'}`}>
                  Generate compliant Risk-Control Matrices (RCMs), formal Audit Observation Memos, or Python journal-entry sampling routines powered by specialized audit agents.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`text-xs font-mono px-3 py-1.5 rounded-xl border ${
                  theme === 'light' ? 'bg-emerald-50 text-emerald-800 border-emerald-300' : 'bg-emerald-950/70 text-emerald-400 border-emerald-800'
                }`}>
                  ● Enterprise Agent Ready
                </span>
              </div>
            </div>

            {/* Template Selector & Prompt Box */}
            <div className={`p-6 rounded-3xl border space-y-4 ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
            }`}>
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs font-bold ${theme === 'light' ? 'text-slate-700' : 'text-slate-400'}`}>Audit Workflows:</span>
                <button
                  onClick={() => {
                    setAiPromptCategory('rcm');
                    setCustomPrompt('Generate a Risk-Control Matrix (RCM) for Procure-to-Pay vendor onboarding and duplicate payment controls.');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    aiPromptCategory === 'rcm'
                      ? 'bg-gradient-to-r from-[#102a4e] to-[#163a6b] text-white shadow-xs'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Risk & Control Matrix (RCM)
                </button>

                <button
                  onClick={() => {
                    setAiPromptCategory('memo');
                    setCustomPrompt('Draft an Audit Committee Observation Memo on IT privileged user access revocation lapses.');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    aiPromptCategory === 'memo'
                      ? 'bg-gradient-to-r from-[#102a4e] to-[#163a6b] text-white shadow-xs'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Audit Committee Observation Memo
                </button>

                <button
                  onClick={() => {
                    setAiPromptCategory('sampling');
                    setCustomPrompt('Provide a Python script for testing 100,000 journal entries for Benford’s Law anomalies and weekend postings.');
                  }}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    aiPromptCategory === 'sampling'
                      ? 'bg-gradient-to-r from-[#102a4e] to-[#163a6b] text-white shadow-xs'
                      : theme === 'light'
                      ? 'bg-slate-100 text-slate-700 hover:text-slate-900 border border-slate-200'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  Python Audit Analytics Script
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  className={`w-full p-4 rounded-2xl border text-xs sm:text-sm focus:outline-none transition-all font-mono ${
                    theme === 'light'
                      ? 'bg-slate-50 border-slate-300 text-slate-900 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600'
                      : 'bg-slate-950 border-slate-700 text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500'
                  }`}
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[11px] text-slate-500 font-mono">Zero data leakage sandbox · Strictly sanitized sample parameters</span>
                <button
                  disabled={isAiGenerating}
                  onClick={handleRunAiAudit}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-700 via-sky-800 to-[#b58b42] hover:opacity-95 text-white font-bold text-xs cursor-pointer shadow-sm transition-all flex items-center gap-2"
                >
                  {isAiGenerating ? (
                    <>
                      <RotateCcw className="w-4 h-4 animate-spin" />
                      <span>Synthesizing Workpaper...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Execute Audit AI Agent</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Generated Workpaper Output Screen */}
            {aiOutput && (
              <div className={`p-8 rounded-3xl border space-y-4 animate-in fade-in duration-300 ${
                theme === 'light'
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-950 border-slate-800'
              }`}>
                <div className={`flex items-center justify-between border-b pb-3 ${
                  theme === 'light' ? 'border-slate-100' : 'border-slate-800'
                }`}>
                  <div className="flex items-center gap-2 text-xs font-bold text-[#b58b42]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Validated Audit Workpaper Output (IIA / COSO Compliant)</span>
                  </div>
                  <button
                    onClick={() => showToast('Exported workpaper to clipboard')}
                    className="text-xs text-sky-600 hover:underline cursor-pointer font-semibold"
                  >
                    Copy to Clipboard
                  </button>
                </div>

                <div className={`overflow-x-auto text-xs leading-relaxed font-mono whitespace-pre-wrap p-4 rounded-xl border ${
                  theme === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-800'
                    : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}>
                  {aiOutput}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================================================================= */}
        {/* TAB 6: EXAM READINESS & CERTIFICATE PREVIEW                      */}
        {/* ================================================================= */}
        {activeTab === 'readiness' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Estimated Scaled Score */}
              <div className={`p-6 rounded-3xl border text-left space-y-2 ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>Estimated Pearson VUE Score</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-[#b58b42] tracking-tight tabular-nums">
                  645 <span className={`text-sm font-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>/ 750</span>
                </div>
                <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Passing Grade: 600+ (SAFE ZONE)
                </p>
              </div>

              {/* Card 2: Questions Mastered */}
              <div className={`p-6 rounded-3xl border text-left space-y-2 ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>Practice MCQs Solved</div>
                <div className="text-3xl sm:text-4xl font-extrabold text-sky-700 tracking-tight tabular-nums">
                  480 <span className={`text-sm font-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>/ Gleim Mega Bank</span>
                </div>
                <p className={`text-xs ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                  Average accuracy: <strong className={theme === 'light' ? 'text-slate-900' : 'text-white'}>82% on first attempt</strong>
                </p>
              </div>

              {/* Card 3: Target Exam Date */}
              <div className={`p-6 rounded-3xl border text-left space-y-2 ${
                theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-slate-900 border-slate-800'
              }`}>
                <div className={`text-[10px] font-bold uppercase tracking-wider ${
                  theme === 'light' ? 'text-slate-500' : 'text-slate-400'
                }`}>Part 1 Target Exam Window</div>
                <div className={`text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums ${
                  theme === 'light' ? 'text-slate-900' : 'text-white'
                }`}>
                  42 <span className={`text-sm font-normal ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Days Remaining</span>
                </div>
                <p className="text-xs text-sky-700 font-semibold">
                  Recommended test date: Dec 18, 2026
                </p>
              </div>
            </div>

            {/* Certificate of Training Preview */}
            <div className={`p-8 rounded-3xl border text-center space-y-4 ${
              theme === 'light'
                ? 'bg-gradient-to-b from-white via-slate-50/70 to-amber-50/30 border-slate-200 shadow-xs'
                : 'bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800'
            }`}>
              <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-[#b58b42] text-xs font-bold uppercase tracking-widest">
                OFFICIAL BNC EXECUTIVE ACCREDITATION
              </span>
              <h3 className={`text-2xl font-black tracking-tight ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>
                Certificate in Professional Certified Internal Auditor Coaching
              </h3>
              <p className={`text-xs sm:text-sm max-w-lg mx-auto ${theme === 'light' ? 'text-slate-600' : 'text-slate-400'}`}>
                Issued upon completing 100+ hours of live coaching and passing all mock exam simulations. Verifiable credential with digital verification hash.
              </p>

              <div className="pt-2">
                <button
                  onClick={() => showToast('Sample completion certificate downloaded!')}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#102a4e] via-[#163a6b] to-[#b58b42] hover:opacity-95 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                >
                  Download Sample Certificate PDF
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

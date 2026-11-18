import React, { useState, useEffect, useRef } from 'react';
import {
  LMS_MODULES,
  LmsLesson,
  LmsModule
} from '../data/lmsData';
import {
  BookOpen,
  Video,
  Play,
  Pause,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Sparkles,
  ArrowLeft,
  Award,
  ChevronRight,
  Cpu,
  Search,
  RotateCcw,
  Volume2,
  Maximize2,
  MessageSquare,
  ShieldCheck,
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
import { ManagedLearner, LmsAdminUser } from '../types';
import { getLessonVideo, resolveVideoPlaybackSource } from '../utils/videoStorage';

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
      if (!saved) return null;
      const parsed = JSON.parse(saved) as LmsAdminUser;
      const isLegacyAdmin =
        parsed.email !== 'neha@bncglobal.in' ||
        (parsed.name && parsed.name.toLowerCase().includes('gurvinder'));
      if (isLegacyAdmin) {
        const migrated: LmsAdminUser = {
          ...parsed,
          email: 'neha@bncglobal.in',
          name: 'Neha Srivastava',
          role: 'Academic Administrator'
        };
        localStorage.setItem('bnc_lms_auth_admin', JSON.stringify(migrated));
        return migrated;
      }
      return parsed;
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
  const [activeTab, setActiveTab] = useState<'curriculum' | 'ailab'>('curriculum');
  const [selectedPart, setSelectedPart] = useState<'all' | 'part-1' | 'part-2' | 'part-3' | 'ai-lab'>('part-1');

  // LMS Data States (synced with Admin Video Uploads)
  const [lmsModules, setLmsModules] = useState<LmsModule[]>(() => {
    try {
      const saved = localStorage.getItem('bnc_lms_modules');
      if (saved) return JSON.parse(saved);
    } catch {}
    return LMS_MODULES;
  });

  const handleUpdateModules = (updated: LmsModule[]) => {
    setLmsModules(updated);
    try {
      localStorage.setItem('bnc_lms_modules', JSON.stringify(updated));
    } catch (e) {
      console.warn(e);
    }
  };
  
  // Video Player state
  const [activeLesson, setActiveLesson] = useState<LmsLesson>(lmsModules[0]?.lessons[0] || LMS_MODULES[0].lessons[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [playerProgress, setPlayerProgress] = useState(35); // 35% viewed
  const [loadedVideoUrl, setLoadedVideoUrl] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
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

  // AI Audit Lab state
  const [aiPromptCategory, setAiPromptCategory] = useState<'rcm' | 'memo' | 'sampling'>('rcm');
  const [customPrompt, setCustomPrompt] = useState('Generate an audit testing procedure for Procure-to-Pay vendor onboarding under SOX / ICFR controls.');
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiOutput, setAiOutput] = useState<string>('');

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
            'Incorrect Student Password. Please enter the access password assigned to your email by BNC Academic Administration. If you need your password reset, contact info@bncglobal.in or call +91 98213 75702.'
          );
          return;
        }

        // Enforce administrative access controls
        if (matchedLearner.status === 'revoked') {
          setAuthError(
            `Access Suspended: Portal access for ${matchedLearner.name} has been suspended or revoked by Academic Administration. Status: ${matchedLearner.feeStatus}. Please contact Admissions at info@bncglobal.in or call +91 98213 75702 to resolve fee status.`
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
            if (matchedOrder.paymentStatus === 'Pending Verification') {
              setAuthError(
                `Payment Under Verification: Your bank transfer for ${matchedOrder.packageName} (Ref: ${matchedOrder.transactionId || matchedOrder.orderId}) is awaiting finance confirmation. Contact info@bncglobal.in or +91 98213 75702 for priority clearance.`
              );
              return;
            }

            const expectedOrderPass = matchedOrder.password?.trim() || 'bnc2026';
            if (trimmedPassword !== expectedOrderPass && trimmedPassword !== 'bnc2026') {
              setAuthError(
                'Incorrect Student Password. Please enter the default access password (bnc2026) or the password assigned upon enrollment.'
              );
              return;
            }

            const durationMap: Record<string, string> = {
              basic: '18 Months Active Access',
              premium: '18 Months Active Access',
              'premium-live': '18 Months Active Access',
              'premium-plus': '24 Months Extended Access',
              elite: '36 Months + Lifetime Alumni',
            };

            const feeLabel = matchedOrder.paymentMethod
              ? `${matchedOrder.paymentStatus || 'Paid'} · ${matchedOrder.paymentMethod}`
              : 'Fee Submission Confirmed & Verified';

            const student: AuthenticatedStudent = {
              name: matchedOrder.studentName || 'Enrolled Candidate',
              email: matchedOrder.studentEmail || inputEmail,
              orderId: matchedOrder.orderId || '2026000',
              packageName: matchedOrder.packageName || 'Premium Live Interactive',
              feeStatus: feeLabel,
              enrollmentDate: matchedOrder.createdAt || 'Recent Enrollment',
              accessDuration: durationMap[matchedOrder.packageId] || '18 Months Active Access',
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

      // Authorized credentials check (Configured for neha@bncglobal.in / BNC@2026)
      const isValidAdmin =
        email === 'neha@bncglobal.in' && password === 'BNC@2026';

      if (isValidAdmin) {
        const newAdmin: LmsAdminUser = {
          email: 'neha@bncglobal.in',
          name: 'Neha Srivastava',
          role: 'Academic Administrator',
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

  // Keep activeLesson updated when Admin uploads a video or modifies lesson details
  useEffect(() => {
    const allLessons = lmsModules.flatMap((m) => m.lessons);
    const updatedMatch = allLessons.find((l) => l.id === activeLesson.id);
    if (updatedMatch) {
      if (
        updatedMatch.videoUrl !== activeLesson.videoUrl ||
        updatedMatch.title !== activeLesson.title ||
        updatedMatch.duration !== activeLesson.duration
      ) {
        setActiveLesson(updatedMatch);
      }
    } else if (allLessons.length > 0) {
      setActiveLesson(allLessons[0]);
    }
  }, [lmsModules]);

  // Resolve IndexedDB or URL video source for activeLesson
  useEffect(() => {
    let active = true;
    let createdBlobUrl: string | null = null;
    const srcInfo = resolveVideoPlaybackSource(activeLesson.videoUrl);

    if (srcInfo.kind === 'idb' && srcInfo.idbLessonId) {
      setLoadedVideoUrl(null);
      getLessonVideo(srcInfo.idbLessonId).then((stored) => {
        if (!active) return;
        if (stored) {
          createdBlobUrl = URL.createObjectURL(stored.blob);
          setLoadedVideoUrl(createdBlobUrl);
        } else {
          setLoadedVideoUrl(null);
        }
      });
    } else if (srcInfo.embedUrl) {
      setLoadedVideoUrl(srcInfo.embedUrl);
    } else {
      setLoadedVideoUrl(null);
    }

    return () => {
      active = false;
      if (createdBlobUrl) {
        URL.revokeObjectURL(createdBlobUrl);
      }
    };
  }, [activeLesson.id, activeLesson.videoUrl]);

  // Apply playbackSpeed to real HTML5 video element when mounted
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, loadedVideoUrl]);

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
        modules={lmsModules}
        onUpdateModules={handleUpdateModules}
        onLogoutAdmin={handleLogoutAdmin}
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
      <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#071322] text-slate-100'} flex flex-col font-sans relative selection:bg-[#b58b42] selection:text-white transition-colors duration-200`}>
        {/* Architectural Wallpaper Layer - Clearly Visible & Slightly Lightened Outside Boxes in Light Theme */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <img
            src="/hero-bg.jpg"
            alt="BNC Architectural Backdrop"
            className={`w-full h-full object-cover object-center ${
              theme === 'light'
                ? 'opacity-75 brightness-105'
                : 'filter contrast-125 opacity-30 brightness-75 saturate-110'
            }`}
          />
          {theme === 'dark' && (
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
        <header className={`relative z-10 ${theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#07172b]/90 border-sky-950 shadow-md backdrop-blur-md'} border-b px-4 sm:px-6 lg:px-8 py-3.5`}>
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
                    src="/assets/aistudio/5345cca2-44dd-42ae-bbfa-151e5c4a1c5b_62b142c3.png"
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
                <a href="tel:+919821375702" className={`${theme === 'light' ? 'text-slate-800' : 'text-slate-200'} font-bold hover:text-[#b58b42]`}>
                  +91 98213 75702
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
            <div className={`p-1 ${theme === 'light' ? 'bg-slate-200 border-slate-300' : 'bg-slate-900/90 border-sky-800/60'} rounded-2xl border inline-flex shadow-sm`}>
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
              <div className={`text-center max-w-2xl mx-auto mb-8 ${
                theme === 'light' ? 'bg-white border border-slate-200 rounded-3xl px-6 py-5 shadow-md' : ''
              }`}>
                <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full ${theme === 'light' ? 'bg-amber-50 border border-amber-200 text-[#8d6928]' : 'bg-[#b58b42]/15 border border-[#b58b42]/35 text-[#f1bd5b]'} text-xs font-bold uppercase tracking-wider mb-4`}>
                  <ShieldCheck className="w-4 h-4 text-[#b58b42]" />
                  <span>Enrolled Learners Only · Admin-Assigned Access</span>
                </div>
                <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-extrabold ${theme === 'light' ? 'text-slate-900' : 'text-white'} tracking-tight`}>
                  Student LMS Portal Sign In
                </h1>
                <p className={`mt-3 text-xs sm:text-sm ${theme === 'light' ? 'text-slate-600' : 'text-slate-300'} leading-relaxed`}>
                  Please enter your registered student email and the access password assigned by Academic Administration.
                </p>
              </div>

              {/* Learner Verification Box */}
              <div className={`${theme === 'light' ? 'bg-white border-slate-200 shadow-xl shadow-slate-200/60' : 'bg-[#0a1829]/95 border-sky-900/60 shadow-2xl backdrop-blur-xl'} border rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-colors`}>
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
                          <a href="tel:+919821375702" className="text-sky-700 hover:underline font-bold">
                            Call +91 98213 75702
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
              <div className={`text-center max-w-2xl mx-auto mb-8 ${
                theme === 'light' ? 'bg-white border border-slate-200 rounded-3xl px-6 py-5 shadow-md' : ''
              }`}>
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
              <div className={`${theme === 'light' ? 'bg-white border-slate-200 shadow-xl shadow-slate-200/50' : 'bg-[#0a1829]/95 border-sky-800/60 shadow-2xl backdrop-blur-xl'} border rounded-3xl p-6 sm:p-8 relative overflow-hidden transition-colors`}>
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
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#091626]/80 border-sky-950/80'
            }`}>
              <Video className="w-5 h-5 text-[#b58b42] mb-1.5" />
              <div className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>100–120+ Hrs Video</div>
              <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>Parts 1, 2, 3 with timestamped notes</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-left ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#091626]/80 border-sky-950/80'
            }`}>
              <HelpCircle className="w-5 h-5 text-sky-600 mb-1.5" />
              <div className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>Gleim Mega Test Bank</div>
              <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>SmartAdapt™ AI adaptive simulator</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-left ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#091626]/80 border-sky-950/80'
            }`}>
              <Cpu className="w-5 h-5 text-purple-600 mb-1.5" />
              <div className={`text-xs font-bold ${theme === 'light' ? 'text-slate-900' : 'text-white'}`}>AI Audit Lab</div>
              <div className={`text-[10px] ${theme === 'light' ? 'text-slate-500' : 'text-slate-400'}`}>RCM generator & Benford anomaly scripts</div>
            </div>
            <div className={`p-3.5 rounded-2xl border text-left ${
              theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#091626]/80 border-sky-950/80'
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


  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-white text-slate-800' : 'bg-[#071322] text-slate-100'} flex flex-col font-sans transition-colors duration-200 relative`}>
      {/* Architectural Wallpaper Layer - Clearly Visible & Slightly Lightened Outside Boxes in Light Theme */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <img
          src="/hero-bg.jpg"
          alt="BNC Architectural Backdrop"
          className={`w-full h-full object-cover object-center ${
            theme === 'light'
              ? 'opacity-75 brightness-105'
              : 'filter contrast-125 opacity-30 brightness-75 saturate-110'
          }`}
        />
        {theme === 'dark' && (
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
      <header className={`sticky top-0 z-40 ${theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#07172b]/95 border-sky-950 shadow-md backdrop-blur-md'} border-b px-4 sm:px-6 lg:px-8 py-3.5`}>
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
      <div className={`${theme === 'light' ? 'bg-white border-slate-200 shadow-xs' : 'bg-[#0b1b30]/95 backdrop-blur-md border-sky-950/80'} border-b px-4 sm:px-6 lg:px-8 py-2.5 relative z-30`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto gap-3 scrollbar-none">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setActiveTab('curriculum')}
              className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-extrabold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'curriculum'
                  ? 'bg-gradient-to-r from-[#0e2444] via-[#163a6b] to-[#b58b42] text-white shadow-md ring-1 ring-[#f1bd5b]/40'
                  : theme === 'light'
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-sky-900/60'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'curriculum'
                    ? 'bg-white/15 text-[#f7cd76]'
                    : theme === 'light'
                    ? 'bg-amber-100 text-[#9c742e]'
                    : 'bg-amber-500/15 text-[#f1bd5b]'
                }`}
              >
                <Video className="w-4 h-4" />
              </span>
              <span>Video Masterclasses</span>
              <span
                className={`px-2 py-0.5 rounded-lg text-xs font-black tabular-nums ${
                  activeTab === 'curriculum'
                    ? 'bg-white/20 text-white'
                    : theme === 'light'
                    ? 'bg-white text-slate-700 border border-slate-200'
                    : 'bg-slate-800 text-slate-300 border border-slate-700'
                }`}
              >
                {totalLessonsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('ailab')}
              className={`group flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-sm font-extrabold tracking-tight transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'ailab'
                  ? 'bg-gradient-to-r from-[#0e2444] via-[#163a6b] to-[#b58b42] text-white shadow-md ring-1 ring-amber-400/40'
                  : theme === 'light'
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200'
                  : 'bg-slate-900/70 hover:bg-slate-800 text-slate-200 border border-sky-900/60'
              }`}
            >
              <span
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                  activeTab === 'ailab'
                    ? 'bg-white/15 text-amber-300'
                    : theme === 'light'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-amber-500/15 text-amber-300'
                }`}
              >
                <Sparkles className="w-4 h-4" />
              </span>
              <span>AI Audit Lab Sandbox</span>
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
              {(() => {
                const playbackInfo = resolveVideoPlaybackSource(activeLesson.videoUrl);
                const hasPlayableVideo =
                  (playbackInfo.kind === 'iframe' && Boolean(loadedVideoUrl)) ||
                  ((playbackInfo.kind === 'idb' || playbackInfo.kind === 'direct') && Boolean(loadedVideoUrl));

                if (hasPlayableVideo && playbackInfo.kind === 'iframe' && loadedVideoUrl) {
                  return (
                    <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                      <div className="px-5 py-3 bg-[#081526] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#f1bd5b] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{activeLesson.title} · {activeLesson.instructor}</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-300 bg-slate-900 px-2.5 py-0.5 rounded">
                          {activeLesson.duration}
                        </span>
                      </div>
                      <div className="aspect-video bg-black">
                        <iframe
                          key={activeLesson.id}
                          src={loadedVideoUrl}
                          title={activeLesson.title}
                          className="w-full h-full"
                          allow="autoplay; fullscreen; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                    </div>
                  );
                }

                if (hasPlayableVideo && (playbackInfo.kind === 'idb' || playbackInfo.kind === 'direct') && loadedVideoUrl) {
                  return (
                    <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                      <div className="px-5 py-3 bg-[#081526] border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-[#f1bd5b] flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>{activeLesson.title} · {activeLesson.instructor}</span>
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-400 font-bold uppercase mr-1">Speed:</span>
                          {[1, 1.25, 1.5, 2].map((spd) => (
                            <button
                              key={spd}
                              type="button"
                              onClick={() => {
                                setPlaybackSpeed(spd);
                                if (videoRef.current) videoRef.current.playbackRate = spd;
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
                      <div className="aspect-video bg-black">
                        <video
                          ref={videoRef}
                          key={loadedVideoUrl}
                          src={loadedVideoUrl}
                          controls
                          playsInline
                          controlsList="nodownload"
                          onLoadedMetadata={() => {
                            if (videoRef.current) {
                              videoRef.current.playbackRate = playbackSpeed;
                            }
                          }}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </div>
                  );
                }

                return (
                  <div className="relative rounded-3xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl">
                    {/* Masterclass Preview Screen (When Admin Has Not Uploaded Video Yet) */}
                    <div className="relative aspect-video bg-gradient-to-br from-slate-900 via-[#0a182c] to-black flex flex-col justify-between p-6 overflow-hidden">
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
                );
              })()}

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
                                ? 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
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
        {/* TAB 2: ENTERPRISE AI AUDIT LAB (EXCLUSIVE SANDBOX)                */}
        {/* ================================================================= */}
        {activeTab === 'ailab' && (
          <div className="space-y-6">
            <div className={`p-6 rounded-3xl border flex flex-wrap items-center justify-between gap-4 ${
              theme === 'light'
                ? 'bg-gradient-to-r from-white via-indigo-50 to-white border-indigo-200 shadow-xs'
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

      </main>
    </div>
  );
};

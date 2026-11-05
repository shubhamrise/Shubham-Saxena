export type Currency = 'INR' | 'USD';

export interface PackagePlan {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  isPopular?: boolean;
  priceINR: number;
  priceUSD: number;
  installmentINR: number;
  features: string[];
  deliverables: {
    hours: string;
    mode: string;
    lmsAccess: string;
    booksIncluded: boolean;
    aiTraining: boolean;
    mocksCount: string;
    placementSupport: boolean;
  };
}

export interface ExamPart {
  id: string;
  partNumber: number;
  title: string;
  questions: number;
  durationMinutes: number;
  description: string;
  domains: {
    name: string;
    weightage: number;
    topics: string[];
  }[];
}

export interface QuizQuestion {
  id: number;
  part: string;
  domain: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface FeeItem {
  name: string;
  category: 'cia-member' | 'iap-student' | 'challenge-member';
  standardUSD: number;
  offerUSD: number;
  offerTaxUSD: number;
  standardINRApprox: number;
  notes?: string;
}

export interface EnrollmentOrder {
  orderId: string;
  packageId: string;
  packageName: string;
  currency: Currency;
  basePrice: number;
  discount: number;
  totalPrice: number;
  studentName: string;
  studentEmail: string;
  studentPhone: string;
  qualification: string;
  paymentMethod?: string;
  createdAt: string;
  addOns: {
    printedBooks: boolean;
    oneOnOneMentoring: boolean;
    aiAuditLab: boolean;
  };
}

export interface ManagedLearner {
  id: string;
  name: string;
  email: string;
  orderId: string;
  packageName: string;
  feeStatus: string;
  status: 'active' | 'revoked' | 'pending';
  enrollmentDate: string;
  accessDuration: string;
  notes?: string;
  phone?: string;
}

export interface LmsAdminUser {
  email: string;
  name: string;
  role: string;
  authenticatedAt: string;
}

export interface EnquiryLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  qualification?: string;
  program?: string;
  source: string;
  status: 'New' | 'Contacted' | 'Enrolled' | 'Archived';
  submittedAt: string;
  brochureDownloaded: boolean;
  notes?: string;
}

export interface LiveClassItem {
  id: string;
  title: string;
  instructor: string;
  date: string;
  time: string;
  meetingId: string;
  passcode: string;
  topics: string[];
}


export interface StudentDoubtItem {
  id: string;
  question: string;
  time: string;
  status: string;
  reply?: string;
  studentName?: string;
}

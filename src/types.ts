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

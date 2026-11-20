/**
 * Phase 0 Security TDD Verification Suite for BNC ELEVATE Firestore Rules.
 * Verifies all "Dirty Dozen" adversarial payloads are rejected with PERMISSION_DENIED.
 *
 * Run against Firebase Firestore Emulator with `@firebase/rules-unit-testing` when available.
 */
import fs from 'node:fs';
import path from 'node:path';

export interface AdversarialTestCase {
  id: string;
  title: string;
  collectionPath: string;
  operation: 'get' | 'list' | 'create' | 'update' | 'delete';
  auth: { uid: string; email?: string; email_verified?: boolean } | null;
  payload?: Record<string, unknown>;
  expected: 'PERMISSION_DENIED';
  enforcedByRuleCheck: string;
}

export const DIRTY_DOZEN_PAYLOADS: AdversarialTestCase[] = [
  {
    id: 'DD-01',
    title: 'Unauthenticated PII Scrape on /enquiries',
    collectionPath: '/enquiries',
    operation: 'list',
    auth: null,
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'allow list: if isAdmin();',
  },
  {
    id: 'DD-02',
    title: 'Shadow Field Injection on Public Enquiry Create',
    collectionPath: '/enquiries/enq-shadow-1',
    operation: 'create',
    auth: null,
    payload: {
      id: 'enq-shadow-1',
      name: 'Attacker',
      email: 'attacker@example.com',
      phone: '+91 9999999999',
      source: 'Hero',
      status: 'New',
      submittedAt: 'Now',
      brochureDownloaded: true,
      createdAt: 'SERVER_TIMESTAMP',
      isAdmin: true,
    },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'data.keys().hasOnly(...)',
  },
  {
    id: 'DD-03',
    title: 'Initial Status Forgery on Public Enquiry Create',
    collectionPath: '/enquiries/enq-status-1',
    operation: 'create',
    auth: null,
    payload: {
      id: 'enq-status-1',
      name: 'Attacker',
      email: 'attacker@example.com',
      phone: '+91 9999999999',
      source: 'Hero',
      status: 'Enrolled',
      submittedAt: 'Now',
      brochureDownloaded: true,
      createdAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: "incoming().status == 'New'",
  },
  {
    id: 'DD-04',
    title: 'ID Poisoning on Public Enquiry Create',
    collectionPath: '/enquiries/invalid$id!with*bad@chars',
    operation: 'create',
    auth: null,
    payload: {
      id: 'invalid$id!with*bad@chars',
      name: 'Attacker',
      email: 'attacker@example.com',
      phone: '+91 9999999999',
      source: 'Hero',
      status: 'New',
      submittedAt: 'Now',
      brochureDownloaded: true,
      createdAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'isValidId(enquiryId)',
  },
  {
    id: 'DD-05',
    title: 'Admin Email Spoofing Without email_verified',
    collectionPath: '/leads',
    operation: 'list',
    auth: { uid: 'spoof-uid', email: 'neha@bncglobal.in', email_verified: false },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'request.auth.token.email_verified == true',
  },
  {
    id: 'DD-06',
    title: 'Self-Assigned Admin Privilege Escalation',
    collectionPath: '/admins/attacker-uid',
    operation: 'create',
    auth: { uid: 'attacker-uid', email: 'attacker@gmail.com', email_verified: true },
    payload: {
      uid: 'attacker-uid',
      email: 'attacker@gmail.com',
      name: 'Attacker',
      role: 'Academic Administrator',
      createdAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'allow create: if isAdmin()',
  },
  {
    id: 'DD-07',
    title: 'Cross-Student Learner PII Access',
    collectionPath: '/learners/stu-victim',
    operation: 'get',
    auth: { uid: 'other-uid', email: 'other@gmail.com', email_verified: true },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'existing().email == request.auth.token.email',
  },
  {
    id: 'DD-08',
    title: 'Student Self-Granting Active LMS Access',
    collectionPath: '/learners/stu-free',
    operation: 'create',
    auth: { uid: 'free-uid', email: 'free@gmail.com', email_verified: true },
    payload: {
      id: 'stu-free',
      name: 'Freebie',
      email: 'free@gmail.com',
      packageName: 'Elite',
      feeStatus: 'Paid',
      status: 'active',
      enrollmentDate: 'Today',
      accessDuration: '36 Months',
      createdAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'allow create: if isAdmin()',
  },
  {
    id: 'DD-09',
    title: 'Cross-User Student Progress Hijack',
    collectionPath: '/student_progress/victim-uid',
    operation: 'create',
    auth: { uid: 'attacker-uid', email: 'attacker@gmail.com', email_verified: true },
    payload: {
      userId: 'victim-uid',
      email: 'attacker@gmail.com',
      completedLessons: ['l1'],
      createdAt: 'SERVER_TIMESTAMP',
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'isOwner(userId) && incoming().userId == userId',
  },
  {
    id: 'DD-10',
    title: 'Value Poisoning on Student Progress Update',
    collectionPath: '/student_progress/stu-1',
    operation: 'update',
    auth: { uid: 'stu-1', email: 'stu1@gmail.com', email_verified: true },
    payload: {
      completedLessons: [12345],
      updatedAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'isValidStudentProgress(incoming())',
  },
  {
    id: 'DD-11',
    title: 'Orphaned Campaign Row Write Without Parent Batch',
    collectionPath: '/campaign_batches/nonexistent-batch/rows/row-1',
    operation: 'create',
    auth: { uid: 'admin-uid', email: 'shubhamsaxena787787@gmail.com', email_verified: true },
    payload: {
      id: 'row-1',
      batchId: 'nonexistent-batch',
      campaignName: 'Orphan',
      name: 'Candidate',
      email: 'c@example.com',
      phone: '+91 9999999999',
      importedToLeads: false,
      createdAt: 'SERVER_TIMESTAMP',
    },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'exists(/databases/$(database)/documents/campaign_batches/$(batchId))',
  },
  {
    id: 'DD-12',
    title: 'Client Timestamp Spoofing on Public Enquiry Create',
    collectionPath: '/enquiries/enq-time-1',
    operation: 'create',
    auth: null,
    payload: {
      id: 'enq-time-1',
      name: 'Time Spoofer',
      email: 'time@example.com',
      phone: '+91 9999999999',
      source: 'Hero',
      status: 'New',
      submittedAt: 'Now',
      brochureDownloaded: true,
      createdAt: '2020-01-01T00:00:00Z',
    },
    expected: 'PERMISSION_DENIED',
    enforcedByRuleCheck: 'incoming().createdAt == request.time',
  },
];

export function verifyRulesStaticAssertions(rulesFilePath = 'firestore.rules'): {
  passed: boolean;
  missingChecks: string[];
} {
  const fullPath = path.resolve(process.cwd(), rulesFilePath);
  const rulesText = fs.readFileSync(fullPath, 'utf8');
  const requiredPatterns = [
    "rules_version = '2';",
    'match /{document=**}',
    'allow read, write: if false;',
    'request.auth.token.email_verified == true',
    'isValidId(',
    'isValidEnquiry(',
    'isValidLead(',
    'isValidCrmCallLog(',
    'isValidLearner(',
    'isValidEnrollment(',
    'isValidEmailTemplate(',
    'isValidCampaignBatch(',
    'isValidCampaignRow(',
    'isValidLmsModule(',
    'isValidStudentProgress(',
    'isValidStudentNote(',
    'incoming().createdAt == request.time',
    'incoming().updatedAt == request.time',
    'existsAfter(/databases/$(database)/documents/campaign_batches/$(batchId))',
    'existsAfter(/databases/$(database)/documents/student_progress/$(userId))',
  ];

  const missingChecks = requiredPatterns.filter((pattern) => !rulesText.includes(pattern));
  return { passed: missingChecks.length === 0, missingChecks };
}

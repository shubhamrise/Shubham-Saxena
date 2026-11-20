import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  writeBatch,
  Unsubscribe,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import {
  CampaignFormRow,
  CampaignSpreadsheetBatch,
  CrmCallLog,
  EmailTemplate,
  EnquiryLead,
  EnrollmentOrder,
  ManagedLearner,
} from '../types';
import { LmsModule } from '../data/lmsData';

// ============================================================================
// DEFENSIVE PAYLOAD SANITIZERS (Aligned verbatim with firebase-blueprint.json)
// ============================================================================

const VALID_ID_REGEX = /^[a-zA-Z0-9_-]+$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function sanitizeDocId(raw: string | undefined, prefix: string, maxLen = 128): string {
  const cleaned = (raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, maxLen);

  if (cleaned && VALID_ID_REGEX.test(cleaned)) {
    return cleaned;
  }
  const fallback = `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  return fallback.slice(0, maxLen);
}

function clampStr(value: unknown, maxLen: number, fallback = ''): string {
  const s = typeof value === 'string' ? value.trim() : fallback;
  return s.slice(0, maxLen);
}

function clampRequiredStr(value: unknown, minLen: number, maxLen: number, fallback: string): string {
  const s = clampStr(value, maxLen);
  if (s.length >= minLen) return s;
  return fallback.slice(0, maxLen);
}

function sanitizeEmail(value: unknown, fallback = 'candidate@bncglobal.in'): string {
  const s = clampStr(value, 160).toLowerCase();
  if (EMAIL_REGEX.test(s)) return s;
  return fallback;
}

function stripUndefined<T extends Record<string, unknown>>(obj: T): T {
  const clean: Record<string, unknown> = {};
  Object.entries(obj).forEach(([key, val]) => {
    if (val !== undefined) {
      clean[key] = val;
    }
  });
  return clean as T;
}

// ============================================================================
// 1. PUBLIC WEBSITE ENQUIRIES (/enquiries) - Write-only for public visitors
// ============================================================================

export async function createPublicEnquiryInFirestore(lead: EnquiryLead): Promise<string> {
  const id = sanitizeDocId(lead.id, 'enq', 128);
  const path = `enquiries/${id}`;

  const payload = stripUndefined({
    id,
    name: clampRequiredStr(lead.name, 1, 120, 'Website Candidate'),
    email: sanitizeEmail(lead.email),
    phone: clampRequiredStr(lead.phone, 5, 40, '+91 00000 00000'),
    qualification: lead.qualification ? clampStr(lead.qualification, 160) : undefined,
    program: lead.program ? clampStr(lead.program, 160) : undefined,
    source: clampRequiredStr(lead.source, 1, 160, 'Website Enquiry'),
    status: 'New' as const,
    submittedAt: clampRequiredStr(lead.submittedAt, 1, 80, new Date().toLocaleString('en-IN')),
    brochureDownloaded: Boolean(lead.brochureDownloaded),
    notes: lead.notes ? clampStr(lead.notes, 1000) : undefined,
    createdAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'enquiries', id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeEnquiries(
  onData: (items: EnquiryLead[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'enquiries'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: EnquiryLead[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          name: data.name || 'Candidate',
          email: data.email || '',
          phone: data.phone || '',
          qualification: data.qualification,
          program: data.program,
          source: data.source || 'Website Enquiry',
          status: (data.status || 'New') as EnquiryLead['status'],
          submittedAt: data.submittedAt || '',
          brochureDownloaded: Boolean(data.brochureDownloaded),
          notes: data.notes,
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'enquiries');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function deleteEnquiryInFirestore(id: string): Promise<void> {
  const cleanId = sanitizeDocId(id, 'enq', 128);
  const path = `enquiries/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'enquiries', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// 2. LEADS DIRECTORY (/leads) - Admin Only
// ============================================================================

export function subscribeLeads(
  onData: (items: EnquiryLead[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: EnquiryLead[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          name: data.name || 'Lead',
          email: data.email || '',
          phone: data.phone || '',
          qualification: data.qualification,
          program: data.program,
          source: data.source || 'Leads Directory',
          status: (data.status || 'New') as EnquiryLead['status'],
          submittedAt: data.submittedAt || '',
          brochureDownloaded: Boolean(data.brochureDownloaded),
          notes: data.notes,
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'leads');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function createLeadInFirestore(lead: EnquiryLead): Promise<string> {
  const id = sanitizeDocId(lead.id, 'lead', 128);
  const path = `leads/${id}`;
  const validStatus: EnquiryLead['status'] = ['New', 'Contacted', 'Enrolled', 'Archived'].includes(lead.status)
    ? lead.status
    : 'New';

  const payload = stripUndefined({
    id,
    name: clampRequiredStr(lead.name, 1, 120, 'Candidate'),
    email: clampRequiredStr(lead.email, 1, 160, 'no-email@campaign.local'),
    phone: clampStr(lead.phone, 40, ''),
    qualification: lead.qualification ? clampStr(lead.qualification, 160) : undefined,
    program: lead.program ? clampStr(lead.program, 160) : undefined,
    source: clampRequiredStr(lead.source, 1, 200, 'Website Enquiry'),
    status: validStatus,
    submittedAt: clampRequiredStr(lead.submittedAt, 1, 80, new Date().toLocaleString('en-IN')),
    brochureDownloaded: Boolean(lead.brochureDownloaded),
    notes: lead.notes ? clampStr(lead.notes, 2000) : undefined,
    createdAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'leads', id), payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function createLeadsBatchInFirestore(leads: EnquiryLead[]): Promise<void> {
  if (leads.length === 0) return;
  const CHUNK_SIZE = 400;
  try {
    for (let i = 0; i < leads.length; i += CHUNK_SIZE) {
      const chunk = leads.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      chunk.forEach((lead) => {
        const id = sanitizeDocId(lead.id, 'lead', 128);
        const validStatus: EnquiryLead['status'] = ['New', 'Contacted', 'Enrolled', 'Archived'].includes(lead.status)
          ? lead.status
          : 'New';
        const payload = stripUndefined({
          id,
          name: clampRequiredStr(lead.name, 1, 120, 'Candidate'),
          email: clampRequiredStr(lead.email, 1, 160, 'no-email@campaign.local'),
          phone: clampStr(lead.phone, 40, ''),
          qualification: lead.qualification ? clampStr(lead.qualification, 160) : undefined,
          program: lead.program ? clampStr(lead.program, 160) : undefined,
          source: clampRequiredStr(lead.source, 1, 200, 'Email Campaign'),
          status: validStatus,
          submittedAt: clampRequiredStr(lead.submittedAt, 1, 80, new Date().toLocaleString('en-IN')),
          brochureDownloaded: Boolean(lead.brochureDownloaded),
          notes: lead.notes ? clampStr(lead.notes, 2000) : undefined,
          createdAt: serverTimestamp(),
        });
        batch.set(doc(db, 'leads', id), payload);
      });
      await batch.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'leads');
  }
}

export async function updateLeadStatusInFirestore(
  id: string,
  status: EnquiryLead['status']
): Promise<void> {
  const cleanId = sanitizeDocId(id, 'lead', 128);
  const path = `leads/${cleanId}`;
  try {
    await updateDoc(doc(db, 'leads', cleanId), {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLeadInFirestore(id: string): Promise<void> {
  const cleanId = sanitizeDocId(id, 'lead', 128);
  const path = `leads/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'leads', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// 3. CRM CALL LOGS (/crm_call_logs) - Admin Only
// ============================================================================

export function subscribeCrmCallLogs(
  onData: (items: CrmCallLog[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'crm_call_logs'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CrmCallLog[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          studentName: data.studentName || '',
          phone: data.phone || '',
          email: data.email,
          direction: (data.direction || 'outbound') as CrmCallLog['direction'],
          callStatus: (data.callStatus || 'Connected') as CrmCallLog['callStatus'],
          callDateTime: data.callDateTime || '',
          durationSeconds: typeof data.durationSeconds === 'number' ? data.durationSeconds : 0,
          responseSummary: data.responseSummary || '',
          interestLevel: (data.interestLevel || 'Warm / Follow-up') as CrmCallLog['interestLevel'],
          reconnectAgain: Boolean(data.reconnectAgain),
          nextFollowUpDate: data.nextFollowUpDate,
          feedback: data.feedback,
          handledBy: data.handledBy || 'Neha Srivastava',
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'crm_call_logs');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function saveCrmCallLogInFirestore(
  log: CrmCallLog,
  isUpdate: boolean
): Promise<string> {
  const id = sanitizeDocId(log.id, 'call', 128);
  const path = `crm_call_logs/${id}`;
  const duration = Number.isFinite(log.durationSeconds)
    ? Math.max(0, Math.min(86400, Math.round(log.durationSeconds)))
    : 0;

  if (isUpdate) {
    const updatePayload = stripUndefined({
      studentName: clampRequiredStr(log.studentName, 1, 120, 'Candidate'),
      phone: clampRequiredStr(log.phone, 3, 40, '00000'),
      email: log.email ? clampStr(log.email, 160) : '',
      direction: log.direction === 'inbound' ? 'inbound' : 'outbound',
      callStatus: log.callStatus,
      callDateTime: clampRequiredStr(log.callDateTime, 1, 80, new Date().toLocaleString('en-IN')),
      durationSeconds: duration,
      responseSummary: clampStr(log.responseSummary, 2000),
      interestLevel: log.interestLevel,
      reconnectAgain: Boolean(log.reconnectAgain),
      nextFollowUpDate: log.nextFollowUpDate ? clampStr(log.nextFollowUpDate, 80) : '',
      feedback: log.feedback ? clampStr(log.feedback, 2000) : '',
      handledBy: clampRequiredStr(log.handledBy, 1, 120, 'Neha Srivastava'),
      updatedAt: serverTimestamp(),
    });
    try {
      await updateDoc(doc(db, 'crm_call_logs', id), updatePayload);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  const createPayload = stripUndefined({
    id,
    studentName: clampRequiredStr(log.studentName, 1, 120, 'Candidate'),
    phone: clampRequiredStr(log.phone, 3, 40, '00000'),
    email: log.email ? clampStr(log.email, 160) : undefined,
    direction: log.direction === 'inbound' ? 'inbound' : 'outbound',
    callStatus: log.callStatus,
    callDateTime: clampRequiredStr(log.callDateTime, 1, 80, new Date().toLocaleString('en-IN')),
    durationSeconds: duration,
    responseSummary: clampStr(log.responseSummary, 2000),
    interestLevel: log.interestLevel,
    reconnectAgain: Boolean(log.reconnectAgain),
    nextFollowUpDate: log.nextFollowUpDate ? clampStr(log.nextFollowUpDate, 80) : undefined,
    feedback: log.feedback ? clampStr(log.feedback, 2000) : undefined,
    handledBy: clampRequiredStr(log.handledBy, 1, 120, 'Neha Srivastava'),
    createdAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'crm_call_logs', id), createPayload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCrmCallLogInFirestore(id: string): Promise<void> {
  const cleanId = sanitizeDocId(id, 'call', 128);
  const path = `crm_call_logs/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'crm_call_logs', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// 4. MANAGED LEARNERS (/learners) - Admin + Student Self-Read by Email
// ============================================================================

export function subscribeLearners(
  onData: (items: ManagedLearner[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'learners'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: ManagedLearner[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          name: data.name || '',
          email: data.email || '',
          password: data.password || 'bnc2026',
          orderId: data.orderId,
          packageName: data.packageName || 'Premium Live Interactive',
          feeStatus: data.feeStatus || 'Verified',
          status: (data.status || 'active') as ManagedLearner['status'],
          enrollmentDate: data.enrollmentDate || '',
          accessDuration: data.accessDuration || '18 Months Active Access',
          notes: data.notes,
          phone: data.phone,
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'learners');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function findLearnerByStudentEmail(email: string): Promise<ManagedLearner | null> {
  const cleanEmail = email.trim().toLowerCase();
  if (!EMAIL_REGEX.test(cleanEmail)) return null;
  const path = 'learners';
  try {
    const q = query(collection(db, 'learners'), where('email', '==', cleanEmail));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    const data = d.data();
    return {
      id: data.id || d.id,
      name: data.name || '',
      email: data.email || cleanEmail,
      password: data.password,
      orderId: data.orderId,
      packageName: data.packageName || 'Premium Live Interactive',
      feeStatus: data.feeStatus || 'Verified',
      status: (data.status || 'pending') as ManagedLearner['status'],
      enrollmentDate: data.enrollmentDate || '',
      accessDuration: data.accessDuration || '18 Months Active Access',
      notes: data.notes,
      phone: data.phone,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function saveLearnerInFirestore(
  learner: ManagedLearner,
  isUpdate: boolean
): Promise<string> {
  const id = sanitizeDocId(learner.id, 'learner', 128);
  const path = `learners/${id}`;

  if (isUpdate) {
    const updatePayload = stripUndefined({
      name: clampRequiredStr(learner.name, 1, 120, 'Learner'),
      email: sanitizeEmail(learner.email),
      password: clampStr(learner.password || 'bnc2026', 100),
      orderId: learner.orderId ? clampStr(learner.orderId, 64) : '',
      packageName: clampRequiredStr(learner.packageName, 1, 160, 'Premium Live Interactive'),
      feeStatus: clampRequiredStr(learner.feeStatus, 1, 240, 'Verified'),
      status: learner.status,
      enrollmentDate: clampRequiredStr(learner.enrollmentDate, 1, 80, 'Recent'),
      accessDuration: clampRequiredStr(learner.accessDuration, 1, 120, '18 Months Active Access'),
      notes: learner.notes ? clampStr(learner.notes, 1000) : '',
      phone: learner.phone ? clampStr(learner.phone, 40) : '',
      updatedAt: serverTimestamp(),
    });
    try {
      await updateDoc(doc(db, 'learners', id), updatePayload);
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  const createPayload = stripUndefined({
    id,
    name: clampRequiredStr(learner.name, 1, 120, 'Learner'),
    email: sanitizeEmail(learner.email),
    password: learner.password ? clampStr(learner.password, 100) : 'bnc2026',
    orderId: learner.orderId ? clampStr(learner.orderId, 64) : undefined,
    packageName: clampRequiredStr(learner.packageName, 1, 160, 'Premium Live Interactive'),
    feeStatus: clampRequiredStr(learner.feeStatus, 1, 240, 'Verified'),
    status: learner.status,
    enrollmentDate: clampRequiredStr(learner.enrollmentDate, 1, 80, 'Recent'),
    accessDuration: clampRequiredStr(learner.accessDuration, 1, 120, '18 Months Active Access'),
    notes: learner.notes ? clampStr(learner.notes, 1000) : undefined,
    phone: learner.phone ? clampStr(learner.phone, 40) : undefined,
    createdAt: serverTimestamp(),
  });
  try {
    await setDoc(doc(db, 'learners', id), createPayload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function toggleLearnerStatusInFirestore(
  id: string,
  status: ManagedLearner['status'],
  feeStatus: string
): Promise<void> {
  const cleanId = sanitizeDocId(id, 'learner', 128);
  const path = `learners/${cleanId}`;
  try {
    await updateDoc(doc(db, 'learners', cleanId), {
      status,
      feeStatus: clampRequiredStr(feeStatus, 1, 240, 'Updated'),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteLearnerInFirestore(id: string): Promise<void> {
  const cleanId = sanitizeDocId(id, 'learner', 128);
  const path = `learners/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'learners', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// 5. PUBLIC ENROLLMENTS (/enrollments) - Public Write-Only Drop Box
// ============================================================================

export async function createPublicEnrollmentInFirestore(order: EnrollmentOrder): Promise<string> {
  const orderId = sanitizeDocId(order.orderId, 'ord', 64);
  const path = `enrollments/${orderId}`;
  const paymentStatus: NonNullable<EnrollmentOrder['paymentStatus']> = [
    'Paid',
    'Installment Paid',
    'Pending Verification',
    'Enrollment Confirmed',
  ].includes(order.paymentStatus || '')
    ? (order.paymentStatus as NonNullable<EnrollmentOrder['paymentStatus']>)
    : 'Pending Verification';

  const payload = stripUndefined({
    orderId,
    packageId: clampRequiredStr(order.packageId, 1, 64, 'premium'),
    packageName: clampRequiredStr(order.packageName, 1, 160, 'Premium Live Interactive'),
    studentName: clampRequiredStr(order.studentName, 1, 120, 'Candidate'),
    studentEmail: sanitizeEmail(order.studentEmail),
    studentPhone: clampRequiredStr(order.studentPhone, 5, 40, '+91 00000 00000'),
    qualification: order.qualification ? clampStr(order.qualification, 160) : undefined,
    city: order.city ? clampStr(order.city, 120) : undefined,
    paymentMethod: order.paymentMethod ? clampStr(order.paymentMethod, 120) : undefined,
    paymentStatus,
    transactionId: order.transactionId ? clampStr(order.transactionId, 120) : undefined,
    upiTransactionCode: order.upiTransactionCode ? clampStr(order.upiTransactionCode, 120) : undefined,
    gatewayPaymentId: order.gatewayPaymentId ? clampStr(order.gatewayPaymentId, 120) : undefined,
    payerVpa: order.payerVpa ? clampStr(order.payerVpa, 120) : undefined,
    invoiceNumber: order.invoiceNumber ? clampStr(order.invoiceNumber, 80) : undefined,
    paidAt: order.paidAt ? clampStr(order.paidAt, 80) : undefined,
    createdAtLabel: order.createdAt ? clampStr(order.createdAt, 80) : undefined,
    createdAt: serverTimestamp(),
  });

  try {
    await setDoc(doc(db, 'enrollments', orderId), payload);
    return orderId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribeEnrollments(
  onData: (items: EnrollmentOrder[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'enrollments'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: EnrollmentOrder[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          orderId: data.orderId || d.id,
          packageId: data.packageId || 'premium',
          packageName: data.packageName || 'Premium Live Interactive',
          studentName: data.studentName || 'Candidate',
          studentEmail: data.studentEmail || '',
          studentPhone: data.studentPhone || '',
          qualification: data.qualification || '',
          city: data.city,
          paymentMethod: data.paymentMethod,
          paymentStatus: data.paymentStatus || 'Pending Verification',
          transactionId: data.transactionId,
          upiTransactionCode: data.upiTransactionCode,
          gatewayPaymentId: data.gatewayPaymentId,
          payerVpa: data.payerVpa,
          invoiceNumber: data.invoiceNumber,
          paidAt: data.paidAt,
          createdAt: data.createdAtLabel || data.paidAt || 'Recent',
          addOns: {
            printedBooks: false,
            oneOnOneMentoring: false,
            aiAuditLab: data.packageId === 'premium-plus' || data.packageId === 'elite',
          },
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'enrollments');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

// ============================================================================
// 6. EMAIL TEMPLATES (/email_templates) - Admin Only
// ============================================================================

export function subscribeEmailTemplates(
  onData: (items: EmailTemplate[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'email_templates'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: EmailTemplate[] = snapshot.docs.map((d) => {
        const data = d.data();
        return {
          id: data.id || d.id,
          name: data.name || 'Template',
          category: data.category || 'Custom',
          subject: data.subject || '',
          body: data.body || '',
          updatedAt: data.updatedAtLabel || 'Saved',
        };
      });
      onData(items);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'email_templates');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function saveEmailTemplateInFirestore(
  tpl: EmailTemplate,
  isUpdate: boolean
): Promise<string> {
  const id = sanitizeDocId(tpl.id, 'tpl', 128);
  const path = `email_templates/${id}`;

  if (isUpdate) {
    try {
      await updateDoc(doc(db, 'email_templates', id), {
        name: clampRequiredStr(tpl.name, 1, 160, 'Template'),
        category: clampRequiredStr(tpl.category, 1, 80, 'Custom'),
        subject: clampRequiredStr(tpl.subject, 1, 300, 'Subject'),
        body: clampRequiredStr(tpl.body, 1, 8000, 'Message'),
        updatedAtLabel: clampStr(tpl.updatedAt, 80),
        updatedAt: serverTimestamp(),
      });
      return id;
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  }

  try {
    await setDoc(doc(db, 'email_templates', id), {
      id,
      name: clampRequiredStr(tpl.name, 1, 160, 'Template'),
      category: clampRequiredStr(tpl.category, 1, 80, 'Custom'),
      subject: clampRequiredStr(tpl.subject, 1, 300, 'Subject'),
      body: clampRequiredStr(tpl.body, 1, 8000, 'Message'),
      updatedAtLabel: clampStr(tpl.updatedAt || 'Saved', 80),
      createdAt: serverTimestamp(),
    });
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteEmailTemplateInFirestore(id: string): Promise<void> {
  const cleanId = sanitizeDocId(id, 'tpl', 128);
  const path = `email_templates/${cleanId}`;
  try {
    await deleteDoc(doc(db, 'email_templates', cleanId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// 7. CAMPAIGN BATCHES & ROWS SUBCOLLECTION (/campaign_batches/{id}/rows/{id})
// ============================================================================

export function subscribeCampaignBatches(
  onData: (batches: CampaignSpreadsheetBatch[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = query(collection(db, 'campaign_batches'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    async (snapshot) => {
      try {
        const batches: CampaignSpreadsheetBatch[] = await Promise.all(
          snapshot.docs.map(async (d) => {
            const data = d.data();
            const batchId = data.id || d.id;
            const rowsQuery = query(
              collection(db, 'campaign_batches', batchId, 'rows'),
              where('batchId', '==', batchId)
            );
            const rowsSnap = await getDocs(rowsQuery);
            const rows: CampaignFormRow[] = rowsSnap.docs.map((rd) => {
              const r = rd.data();
              return {
                id: r.id || rd.id,
                batchId,
                campaignName: r.campaignName || data.campaignName || '',
                submittedAt: r.submittedAt || '',
                name: r.name || 'Candidate',
                email: r.email || '',
                phone: r.phone || '',
                qualification: r.qualification,
                program: r.program,
                notes: r.notes,
                rawFields: (r.rawFields && typeof r.rawFields === 'object' ? r.rawFields : {}) as Record<string, string>,
                importedToLeads: Boolean(r.importedToLeads),
              };
            });

            return {
              id: batchId,
              campaignName: data.campaignName || 'Campaign Sheet',
              fileName: data.fileName || 'sheet.xlsx',
              sheetName: data.sheetName || 'Sheet1',
              uploadedAt: data.uploadedAt || '',
              savedAt: data.savedAt,
              headers: Array.isArray(data.headers) ? data.headers : [],
              rows,
            };
          })
        );
        onData(batches);
      } catch (err) {
        if (onError && err instanceof Error) onError(err);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'campaign_batches');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function saveCampaignBatchInFirestore(batchData: CampaignSpreadsheetBatch): Promise<void> {
  const batchId = sanitizeDocId(batchData.id, 'batch', 128);
  const path = `campaign_batches/${batchId}`;
  const cleanHeaders = (batchData.headers || [])
    .slice(0, 60)
    .map((h) => clampStr(h, 160))
    .filter(Boolean);

  const batchDocPayload = stripUndefined({
    id: batchId,
    campaignName: clampRequiredStr(batchData.campaignName, 1, 200, 'Campaign'),
    fileName: clampRequiredStr(batchData.fileName, 1, 200, 'upload.xlsx'),
    sheetName: clampRequiredStr(batchData.sheetName, 1, 120, 'Sheet1'),
    uploadedAt: clampRequiredStr(batchData.uploadedAt, 1, 80, new Date().toLocaleString('en-IN')),
    savedAt: batchData.savedAt ? clampStr(batchData.savedAt, 80) : undefined,
    headers: cleanHeaders,
    rowCount: Math.min(50000, batchData.rows.length),
    createdAt: serverTimestamp(),
  });

  const CHUNK_SIZE = 350;
  try {
    const firstChunk = batchData.rows.slice(0, CHUNK_SIZE);
    const wb0 = writeBatch(db);
    wb0.set(doc(db, 'campaign_batches', batchId), batchDocPayload);
    firstChunk.forEach((row) => {
      const rowId = sanitizeDocId(row.id, 'row', 128);
      const safeRawFields: Record<string, string> = {};
      Object.entries(row.rawFields || {})
        .slice(0, 60)
        .forEach(([k, v]) => {
          safeRawFields[clampStr(k, 80)] = clampStr(String(v ?? ''), 300);
        });
      wb0.set(
        doc(db, 'campaign_batches', batchId, 'rows', rowId),
        stripUndefined({
          id: rowId,
          batchId,
          campaignName: clampRequiredStr(row.campaignName || batchData.campaignName, 1, 200, 'Campaign'),
          submittedAt: row.submittedAt ? clampStr(row.submittedAt, 80) : undefined,
          name: clampRequiredStr(row.name, 1, 120, 'Candidate'),
          email: clampStr(row.email, 160),
          phone: clampStr(row.phone, 40),
          qualification: row.qualification ? clampStr(row.qualification, 160) : undefined,
          program: row.program ? clampStr(row.program, 160) : undefined,
          notes: row.notes ? clampStr(row.notes, 1000) : undefined,
          rawFields: safeRawFields,
          importedToLeads: Boolean(row.importedToLeads),
          createdAt: serverTimestamp(),
        })
      );
    });
    await wb0.commit();

    for (let i = CHUNK_SIZE; i < batchData.rows.length; i += CHUNK_SIZE) {
      const chunk = batchData.rows.slice(i, i + CHUNK_SIZE);
      const wb = writeBatch(db);
      chunk.forEach((row) => {
        const rowId = sanitizeDocId(row.id, 'row', 128);
        const safeRawFields: Record<string, string> = {};
        Object.entries(row.rawFields || {})
          .slice(0, 60)
          .forEach(([k, v]) => {
            safeRawFields[clampStr(k, 80)] = clampStr(String(v ?? ''), 300);
          });
        wb.set(
          doc(db, 'campaign_batches', batchId, 'rows', rowId),
          stripUndefined({
            id: rowId,
            batchId,
            campaignName: clampRequiredStr(row.campaignName || batchData.campaignName, 1, 200, 'Campaign'),
            submittedAt: row.submittedAt ? clampStr(row.submittedAt, 80) : undefined,
            name: clampRequiredStr(row.name, 1, 120, 'Candidate'),
            email: clampStr(row.email, 160),
            phone: clampStr(row.phone, 40),
            qualification: row.qualification ? clampStr(row.qualification, 160) : undefined,
            program: row.program ? clampStr(row.program, 160) : undefined,
            notes: row.notes ? clampStr(row.notes, 1000) : undefined,
            rawFields: safeRawFields,
            importedToLeads: Boolean(row.importedToLeads),
            createdAt: serverTimestamp(),
          })
        );
      });
      await wb.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function deleteCampaignBatchInFirestore(
  batchId: string,
  rowIds: string[]
): Promise<void> {
  const cleanBatchId = sanitizeDocId(batchId, 'batch', 128);
  const path = `campaign_batches/${cleanBatchId}`;
  const CHUNK_SIZE = 400;
  try {
    for (let i = 0; i < rowIds.length; i += CHUNK_SIZE) {
      const chunk = rowIds.slice(i, i + CHUNK_SIZE);
      const wb = writeBatch(db);
      chunk.forEach((rid) => {
        const cleanRowId = sanitizeDocId(rid, 'row', 128);
        wb.delete(doc(db, 'campaign_batches', cleanBatchId, 'rows', cleanRowId));
      });
      await wb.commit();
    }
    await deleteDoc(doc(db, 'campaign_batches', cleanBatchId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function renameCampaignBatchInFirestore(
  batchId: string,
  campaignName: string,
  savedAt: string
): Promise<void> {
  const cleanBatchId = sanitizeDocId(batchId, 'batch', 128);
  const path = `campaign_batches/${cleanBatchId}`;
  try {
    await updateDoc(doc(db, 'campaign_batches', cleanBatchId), {
      campaignName: clampRequiredStr(campaignName, 1, 200, 'Campaign'),
      savedAt: clampStr(savedAt, 80),
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function markCampaignRowsImportedInFirestore(
  batchId: string,
  rowIds: string[]
): Promise<void> {
  if (rowIds.length === 0) return;
  const cleanBatchId = sanitizeDocId(batchId, 'batch', 128);
  const path = `campaign_batches/${cleanBatchId}/rows`;
  const CHUNK_SIZE = 400;
  try {
    for (let i = 0; i < rowIds.length; i += CHUNK_SIZE) {
      const chunk = rowIds.slice(i, i + CHUNK_SIZE);
      const wb = writeBatch(db);
      chunk.forEach((rid) => {
        const cleanRowId = sanitizeDocId(rid, 'row', 128);
        wb.update(doc(db, 'campaign_batches', cleanBatchId, 'rows', cleanRowId), {
          importedToLeads: true,
          updatedAt: serverTimestamp(),
        });
      });
      await wb.commit();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCampaignRowInFirestore(
  batchId: string,
  rowId: string,
  nextRowCount: number
): Promise<void> {
  const cleanBatchId = sanitizeDocId(batchId, 'batch', 128);
  const cleanRowId = sanitizeDocId(rowId, 'row', 128);
  const path = `campaign_batches/${cleanBatchId}/rows/${cleanRowId}`;
  try {
    const wb = writeBatch(db);
    wb.delete(doc(db, 'campaign_batches', cleanBatchId, 'rows', cleanRowId));
    wb.update(doc(db, 'campaign_batches', cleanBatchId), {
      rowCount: Math.max(0, nextRowCount),
      updatedAt: serverTimestamp(),
    });
    await wb.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ============================================================================
// 8. LMS MODULES (/lms_modules) - Admin Write, Verified Student Read
// ============================================================================

export function subscribeLmsModules(
  isAdminView: boolean,
  onData: (modules: LmsModule[]) => void,
  onError?: (err: Error) => void
): Unsubscribe {
  const q = isAdminView
    ? query(collection(db, 'lms_modules'), orderBy('orderIndex', 'asc'))
    : query(collection(db, 'lms_modules'), where('isPublished', '==', true));

  return onSnapshot(
    q,
    (snapshot) => {
      const docs = snapshot.docs.map((d) => {
        const data = d.data();
        const mod: LmsModule = {
          id: data.id || d.id,
          partId: (data.partId || 'part-1') as LmsModule['partId'],
          moduleNumber: typeof data.moduleNumber === 'number' ? data.moduleNumber : 1,
          title: data.title || 'Untitled Module',
          description: typeof data.description === 'string' ? data.description : '',
          lessons: Array.isArray(data.lessons) ? data.lessons : [],
        };
        return {
          orderIndex: typeof data.orderIndex === 'number' ? data.orderIndex : 0,
          module: mod,
        };
      });
      docs.sort((a, b) => a.orderIndex - b.orderIndex);
      onData(docs.map((item) => item.module));
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, 'lms_modules');
      } catch (e) {
        if (onError && e instanceof Error) onError(e);
      }
    }
  );
}

export async function syncLmsModulesToFirestore(
  modules: LmsModule[],
  knownCloudIds: Set<string>
): Promise<void> {
  const path = 'lms_modules';
  const nextIds = new Set<string>();
  try {
    const wb = writeBatch(db);
    modules.forEach((mod, index) => {
      const id = sanitizeDocId(mod.id, 'mod', 128);
      nextIds.add(id);
      const ref = doc(db, 'lms_modules', id);
      const safeLessons = (mod.lessons || []).slice(0, 50);
      const safeModuleNum = Number.isFinite(mod.moduleNumber)
        ? Math.max(0, Math.min(500, Math.round(mod.moduleNumber)))
        : index + 1;
      if (knownCloudIds.has(id)) {
        wb.update(ref, {
          partId: mod.partId,
          moduleNumber: safeModuleNum,
          title: clampRequiredStr(mod.title, 1, 200, 'Module'),
          description: clampStr(mod.description, 1000),
          orderIndex: index,
          isPublished: true,
          lessons: safeLessons,
          updatedAt: serverTimestamp(),
        });
      } else {
        wb.set(ref, {
          id,
          partId: mod.partId,
          moduleNumber: safeModuleNum,
          title: clampRequiredStr(mod.title, 1, 200, 'Module'),
          description: clampStr(mod.description, 1000),
          orderIndex: index,
          isPublished: true,
          lessons: safeLessons,
          createdAt: serverTimestamp(),
        });
      }
    });

    knownCloudIds.forEach((oldId) => {
      if (!nextIds.has(oldId)) {
        wb.delete(doc(db, 'lms_modules', oldId));
      }
    });

    await wb.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ============================================================================
// 9. STUDENT PROGRESS & NOTES (/student_progress/{uid}/notes/{lessonId})
// ============================================================================

export function subscribeStudentProgress(
  uid: string,
  onProgress: (completedLessons: string[], docExists: boolean) => void,
  onNotes: (notes: Record<string, string>, noteIds: Set<string>) => void
): Unsubscribe {
  const cleanUid = sanitizeDocId(uid, 'usr', 128);

  const unsubProgress = onSnapshot(
    doc(db, 'student_progress', cleanUid),
    (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const completed = Array.isArray(data.completedLessons)
          ? data.completedLessons.filter((item): item is string => typeof item === 'string')
          : [];
        onProgress(completed, true);
      } else {
        onProgress([], false);
      }
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.GET, `student_progress/${cleanUid}`);
      } catch {
        // surfaced via error log
      }
    }
  );

  const notesQuery = query(
    collection(db, 'student_progress', cleanUid, 'notes'),
    where('userId', '==', cleanUid)
  );
  const unsubNotes = onSnapshot(
    notesQuery,
    (snap) => {
      const notesMap: Record<string, string> = {};
      const ids = new Set<string>();
      snap.docs.forEach((d) => {
        const data = d.data();
        const lid = data.lessonId || d.id;
        ids.add(lid);
        notesMap[lid] = typeof data.content === 'string' ? data.content : '';
      });
      onNotes(notesMap, ids);
    },
    (error) => {
      try {
        handleFirestoreError(error, OperationType.LIST, `student_progress/${cleanUid}/notes`);
      } catch {
        // surfaced via error log
      }
    }
  );

  return () => {
    unsubProgress();
    unsubNotes();
  };
}

export async function saveStudentCompletedLessonsInFirestore(
  uid: string,
  email: string,
  completedLessons: string[],
  docExists: boolean
): Promise<void> {
  const cleanUid = sanitizeDocId(uid, 'usr', 128);
  const path = `student_progress/${cleanUid}`;
  const safeLessons = completedLessons.slice(0, 500).map((l) => clampStr(l, 128)).filter(Boolean);

  try {
    if (docExists) {
      await updateDoc(doc(db, 'student_progress', cleanUid), {
        completedLessons: safeLessons,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'student_progress', cleanUid), {
        userId: cleanUid,
        email: sanitizeEmail(email),
        completedLessons: safeLessons,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, docExists ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function saveStudentNoteInFirestore(
  uid: string,
  email: string,
  lessonId: string,
  content: string,
  completedLessons: string[],
  progressExists: boolean,
  noteExists: boolean
): Promise<void> {
  const cleanUid = sanitizeDocId(uid, 'usr', 128);
  const cleanLessonId = sanitizeDocId(lessonId, 'lesson', 128);
  const path = `student_progress/${cleanUid}/notes/${cleanLessonId}`;
  const safeContent = clampStr(content, 10000);

  try {
    if (!progressExists) {
      const wb = writeBatch(db);
      wb.set(doc(db, 'student_progress', cleanUid), {
        userId: cleanUid,
        email: sanitizeEmail(email),
        completedLessons: completedLessons.slice(0, 500).map((l) => clampStr(l, 128)).filter(Boolean),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      wb.set(doc(db, 'student_progress', cleanUid, 'notes', cleanLessonId), {
        userId: cleanUid,
        lessonId: cleanLessonId,
        content: safeContent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await wb.commit();
      return;
    }

    if (noteExists) {
      await updateDoc(doc(db, 'student_progress', cleanUid, 'notes', cleanLessonId), {
        content: safeContent,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'student_progress', cleanUid, 'notes', cleanLessonId), {
        userId: cleanUid,
        lessonId: cleanLessonId,
        content: safeContent,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, noteExists ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

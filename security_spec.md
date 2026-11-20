# BNC ELEVATE Firestore Security Specification (Phase 0 TDD)

## 1. Data Invariants & Access Boundaries
1. **Default-Deny Safety Net**: Any unmatched path is denied (`allow read, write: if false`).
2. **PII Isolation**: Collections containing candidate/student emails, phones, and notes (`enquiries`, `leads`, `crm_call_logs`, `enrollments`, `campaign_batches`, `campaign_batches/{batchId}/rows`) are NEVER readable by unauthenticated visitors or non-admin users.
3. **Public Write-Only Drop Boxes**: Public website visitors can ONLY `create` documents in `/enquiries/{enquiryId}` (with forced `status == 'New'`) and `/enrollments/{orderId}` (with forced `paymentStatus in ['Paid', 'Pending Verification', 'Enrollment Confirmed']`). Visitors can NEVER `get`, `list`, `update`, or `delete` those collections.
4. **Student Learner Isolation**: Verified authenticated students can `get`/`list` ONLY their own learner record in `/learners/{learnerId}` where `resource.data.email == request.auth.token.email`. Only verified Admins can create, update, or delete learners.
5. **Admin Identity Hardening**: Admin privileges require `request.auth != null && request.auth.token.email_verified == true` AND either a bootstrapped verified admin email (`shubhamsaxena787787@gmail.com` or `neha@bncglobal.in`) OR an existing document at `/admins/$(request.auth.uid)`. Self-assigning `/admins/{uid}` is strictly blocked.
6. **Subcollection Master Gates**:
   - `/campaign_batches/{batchId}/rows/{rowId}` verifies parent `/campaign_batches/$(batchId)` exists and `batchId` matches.
   - `/student_progress/{userId}/notes/{lessonId}` verifies parent `/student_progress/$(userId)` exists, `userId == request.auth.uid` (or Admin), and `incoming().userId == userId`.
7. **Temporal Integrity & Immutability**: `createdAt == request.time` on create; `createdAt` and identity keys (`id`, `orderId`, `userId`, `batchId`) are immutable on update; `updatedAt == request.time` on update.
8. **Strict Key & Size Enforcement**: Every create enforces `keys().hasAll(...) && keys().hasOnly(...)`; every update enforces `isValid[Entity](incoming())` AND `affectedKeys().hasOnly(...)`; every string checks `.size()`; every array checks `.size() <= MAX` and first-element type.

---

## 2. The "Dirty Dozen" Adversarial Payloads (Must All Return PERMISSION_DENIED)

1. **DD-01 (Unauthenticated PII Scrape on `/enquiries`)**:
   - Operation: `list /enquiries` as `auth = null`.
   - Expected: `PERMISSION_DENIED`.
2. **DD-02 (Shadow Field Injection on Public Enquiry Create)**:
   - Operation: `create /enquiries/enq-shadow-1` as `auth = null`.
   - Payload: `{ "id": "enq-shadow-1", "name": "Attacker", "email": "a@b.com", "phone": "+919999999999", "source": "Hero", "status": "New", "submittedAt": "Now", "brochureDownloaded": true, "createdAt": "<SERVER_TIME>", "isAdmin": true }`
   - Expected: `PERMISSION_DENIED` (blocked by `keys().hasOnly(...)`).
3. **DD-03 (Initial Status Forgery on Public Enquiry Create)**:
   - Operation: `create /enquiries/enq-status-1` as `auth = null`.
   - Payload: `{ "id": "enq-status-1", "name": "Attacker", "email": "a@b.com", "phone": "+919999999999", "source": "Hero", "status": "Enrolled", "submittedAt": "Now", "brochureDownloaded": true, "createdAt": "<SERVER_TIME>" }`
   - Expected: `PERMISSION_DENIED` (public create must have `status == 'New'`).
4. **DD-04 (ID Poisoning / Oversized Document ID)**:
   - Operation: `create /enquiries/invalid$id!with*bad@chars` as `auth = null`.
   - Payload: Valid enquiry body with poisoned document ID.
   - Expected: `PERMISSION_DENIED` (blocked by `isValidId(enquiryId)`).
5. **DD-05 (Email Spoofing Without `email_verified`)**:
   - Operation: `list /leads` as `auth = { uid: "spoof", token: { email: "neha@bncglobal.in", email_verified: false } }`.
   - Expected: `PERMISSION_DENIED` (requires `email_verified == true`).
6. **DD-06 (Self-Assigned Admin Privilege Escalation)**:
   - Operation: `create /admins/attacker-uid` as verified non-admin user `uid = "attacker-uid"`.
   - Payload: `{ "uid": "attacker-uid", "email": "attacker@gmail.com", "name": "Hacker", "role": "Academic Administrator", "createdAt": "<SERVER_TIME>" }`
   - Expected: `PERMISSION_DENIED`.
7. **DD-07 (Cross-Student Learner PII Access)**:
   - Operation: `get /learners/stu-victim` (where `email == "victim@gmail.com"`) as verified student `email = "other@gmail.com"`.
   - Expected: `PERMISSION_DENIED`.
8. **DD-08 (Student Self-Granting Active LMS Access)**:
   - Operation: `create /learners/stu-free` as verified non-admin student.
   - Payload: `{ "id": "stu-free", "name": "Freebie", "email": "free@gmail.com", "packageName": "Elite", "feeStatus": "Paid", "status": "active", "enrollmentDate": "Today", "accessDuration": "36 Months", "createdAt": "<SERVER_TIME>" }`
   - Expected: `PERMISSION_DENIED`.
9. **DD-09 (Cross-User Student Progress Hijack)**:
   - Operation: `create /student_progress/victim-uid` as verified student `uid = "attacker-uid"`.
   - Payload: `{ "userId": "victim-uid", "email": "attacker@gmail.com", "completedLessons": ["l1"], "createdAt": "<SERVER_TIME>", "updatedAt": "<SERVER_TIME>" }`
   - Expected: `PERMISSION_DENIED`.
10. **DD-10 (Value Poisoning on Student Progress Update — Oversized/Invalid Array)**:
    - Operation: `update /student_progress/stu-1` as `uid = "stu-1"`.
    - Payload: `{ "completedLessons": [12345], "updatedAt": "<SERVER_TIME>" }`
    - Expected: `PERMISSION_DENIED` (non-string array element rejected by `isValidStudentProgress`).
11. **DD-11 (Orphaned Campaign Row Write Without Parent Batch)**:
    - Operation: `create /campaign_batches/nonexistent-batch/rows/row-1` as verified Admin.
    - Payload: Valid `CampaignRow` referencing nonexistent parent batch.
    - Expected: `PERMISSION_DENIED` (Master Gate `exists(/databases/$(database)/documents/campaign_batches/$(batchId))`).
12. **DD-12 (Client Timestamp Spoofing / Immutable `createdAt` Tampering)**:
    - Operation: `create /enquiries/enq-time-1` as `auth = null` with `createdAt: "2020-01-01T00:00:00Z"` instead of `request.time`.
    - Expected: `PERMISSION_DENIED`.

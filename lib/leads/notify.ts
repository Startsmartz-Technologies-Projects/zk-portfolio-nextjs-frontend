export interface NewLeadNotification {
  referenceNo: string
  name: string
  email: string
  inquiryType: string
}

/**
 * Notification hook (SRS §17 Q1, resolved §17: v1 is **store-only**). In v2 this
 * notifies the support team (email/SMS — SMS primary in BD) and auto-acknowledges the
 * submitter with the reference number. It is intentionally a **no-op in v1** and is
 * called from the submit path AFTER the lead is committed, so wiring a provider later
 * is a single-file change. It must never throw — a notification failure must not fail
 * the (already-stored) submission.
 */
export async function notifyNewLead(_n: NewLeadNotification): Promise<void> {
  // v1: no-op. v2: dispatch team notification + submitter auto-acknowledgement here.
}

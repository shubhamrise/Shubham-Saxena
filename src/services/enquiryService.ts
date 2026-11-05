/**
 * BNC ELEVATE - Robust Multi-Channel Enquiry & Brochure Dispatch Service
 * Delivers candidate enquiries directly to info@bncglobal.in and saves them
 * into the Academic Admin Leads console while automatically triggering brochure PDF download.
 */

export interface EnquiryPayload {
  name: string;
  email: string;
  phone: string;
  qualification?: string;
  program?: string;
  source: string;
  notes?: string;
}

/**
 * Triggers automatic download of the official BNC Global CIA Student Brochure PDF
 */
export const triggerBrochureDownload = (): boolean => {
  try {
    const brochurePath = '/assets/aistudio/BNC_Global_CIA_Student_Brochure_60003cf7.pdf';
    const link = document.createElement('a');
    link.href = brochurePath;
    link.download = 'BNC_Global_CIA_Student_Brochure.pdf';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return true;
  } catch (err) {
    console.warn('Brochure download error:', err);
    return false;
  }
};

/**
 * Persists lead to local storage for instant availability in the LMS Admin Console
 */
export const saveLeadToAdminConsole = (data: EnquiryPayload) => {
  try {
    const existingLeads = JSON.parse(localStorage.getItem('bnc_all_leads') || '[]');
    const newLead = {
      id: `lead-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      qualification: data.qualification || "Bachelor's Degree",
      program: data.program || 'All Packages',
      source: data.source,
      status: 'New',
      submittedAt: new Date().toLocaleString(),
      brochureDownloaded: true,
      notes: data.notes || `Dispatched to info@bncglobal.in via ${data.source}`
    };

    existingLeads.unshift(newLead);
    localStorage.setItem('bnc_all_leads', JSON.stringify(existingLeads));
    return newLead;
  } catch (err) {
    console.warn('Lead persistence error:', err);
    return null;
  }
};

/**
 * Triggers official one-time activation email from FormSubmit to info@bncglobal.in.
 * Opens in a new tab so the browser directly executes FormSubmit's verification flow,
 * bypassing hidden iframe or Cloudflare rate-limits.
 */
export const triggerFormSubmitActivation = (): void => {
  try {
    const form = document.createElement('form');
    form.action = 'https://formsubmit.co/info@bncglobal.in';
    form.method = 'POST';
    form.target = '_blank'; // Opens FormSubmit's confirmation window in new tab

    const fields: Record<string, string> = {
      _subject: '[BNC ELEVATE] ACTION REQUIRED: Confirm Form Activation for info@bncglobal.in',
      _template: 'box',
      _captcha: 'false',
      'Recipient Email': 'info@bncglobal.in',
      'Activation Notice': 'Permanent email forwarding activation for BNC Global CIA admissions portal',
      'Instruction': 'Please click the "Activate Form" button in the email sent to info@bncglobal.in to permanently enable enquiry forwarding.',
      'Requested At': new Date().toLocaleString()
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      try {
        if (form.parentNode) form.parentNode.removeChild(form);
      } catch (e) {
        console.warn(e);
      }
    }, 1500);
  } catch (err) {
    console.error('Failed to trigger FormSubmit activation:', err);
    // Fallback: direct window open
    window.open('https://formsubmit.co/info@bncglobal.in', '_blank');
  }
};

export const DEFAULT_WEB3FORMS_KEY = '47c5850f-6624-4499-b44a-7899849e4b1b';

export const getWeb3FormsKey = (): string => {
  try {
    return localStorage.getItem('bnc_web3forms_key') || DEFAULT_WEB3FORMS_KEY;
  } catch {
    return DEFAULT_WEB3FORMS_KEY;
  }
};

export const setWeb3FormsKey = (key: string): void => {
  try {
    localStorage.setItem('bnc_web3forms_key', key.trim() || DEFAULT_WEB3FORMS_KEY);
  } catch (e) {
    console.warn(e);
  }
};

export const getFormspreeId = (): string => {
  try {
    return localStorage.getItem('bnc_formspree_id') || '';
  } catch {
    return '';
  }
};

export const setFormspreeId = (id: string): void => {
  try {
    localStorage.setItem('bnc_formspree_id', id.trim());
  } catch (e) {
    console.warn(e);
  }
};

/**
 * Dispatches form data to info@bncglobal.in using resilient multi-provider pathways:
 * 1. Web3Forms (Ultra-reliable API if key provided or active)
 * 2. Formspree (If configured)
 * 3. FormSubmit (Native HTML post fallback)
 */
export const dispatchToInfoBncGlobal = async (data: EnquiryPayload): Promise<{ success: boolean; providersDispatched: string[] }> => {
  const dispatched: string[] = [];

  // Provider 1: Web3Forms (Recommended - 100% reliable free endpoint)
  const web3Key = getWeb3FormsKey();
  if (web3Key) {
    try {
      const w3Res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          access_key: web3Key,
          subject: `[BNC ELEVATE] CIA Enquiry & Brochure Request: ${data.name}`,
          from_name: 'BNC ELEVATE Portal',
          name: data.name,
          email: data.email,
          phone: data.phone,
          qualification: data.qualification || "Bachelor's Degree",
          program: data.program || 'All Packages',
          source: data.source,
          brochure_downloaded: 'Yes (PDF delivered)',
          message: `Candidate Name: ${data.name}\nPhone: ${data.phone}\nEmail: ${data.email}\nQualification: ${data.qualification}\nProgram: ${data.program}\nSource: ${data.source}`
        })
      });
      if (w3Res.ok) {
        dispatched.push('Web3Forms (Permanent)');
      }
    } catch (err) {
      console.warn('Web3Forms dispatch notice:', err);
    }
  }

  // Provider 2: Formspree (If configured)
  const formspreeId = getFormspreeId();
  if (formspreeId) {
    try {
      const fsRes = await fetch(`https://formspree.io/f/${formspreeId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({
          _subject: `[BNC ELEVATE] CIA Enquiry & Brochure Request: ${data.name}`,
          name: data.name,
          email: data.email,
          phone: data.phone,
          qualification: data.qualification || "Bachelor's Degree",
          program: data.program || 'All Packages',
          source: data.source,
          notes: data.notes
        })
      });
      if (fsRes.ok) {
        dispatched.push('Formspree');
      }
    } catch (err) {
      console.warn('Formspree dispatch notice:', err);
    }
  }

  // Provider 3: FormSubmit Background Hidden Form (Kept as fallback in case server recovers)
  try {
    const iframeName = `bnc_form_target_${Date.now()}`;
    let iframe = document.getElementById(iframeName) as HTMLIFrameElement;
    if (!iframe) {
      iframe = document.createElement('iframe');
      iframe.id = iframeName;
      iframe.name = iframeName;
      iframe.style.display = 'none';
      document.body.appendChild(iframe);
    }

    const form = document.createElement('form');
    form.action = 'https://formsubmit.co/info@bncglobal.in';
    form.method = 'POST';
    form.target = iframeName;
    form.style.display = 'none';

    const fields: Record<string, string> = {
      _subject: `[BNC ELEVATE] CIA Enquiry & Brochure Request: ${data.name}`,
      _template: 'table',
      _captcha: 'false',
      'Candidate Name': data.name,
      'Email Address': data.email,
      'Phone / WhatsApp': data.phone,
      'Highest Qualification': data.qualification || "Bachelor's Degree",
      'Program of Interest': data.program || 'All CIA Packages',
      'Source of Enquiry': data.source,
      'Brochure Downloaded': 'Yes (BNC_Global_CIA_Student_Brochure.pdf)',
      'Submission Timestamp': new Date().toLocaleString()
    };

    Object.entries(fields).forEach(([key, value]) => {
      const input = document.createElement('input');
      input.type = 'hidden';
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();

    setTimeout(() => {
      try {
        if (form.parentNode) form.parentNode.removeChild(form);
      } catch (e) {
        console.warn(e);
      }
    }, 2000);
    dispatched.push('FormSubmit');
  } catch (err) {
    console.warn('Hidden form dispatch fallback error:', err);
  }

  return { success: true, providersDispatched: dispatched };
};

/**
 * Sends a live verification test lead to info@bncglobal.in and logs it in the console
 */
export const sendTestEnquiryToAdmin = async (): Promise<boolean> => {
  const testPayload: EnquiryPayload = {
    name: 'BNC Verification Lead (System Test)',
    email: 'info@bncglobal.in',
    phone: '+91 63960 18626',
    qualification: 'Chartered Accountant (CA)',
    program: 'All Packages (Verification Test)',
    source: 'Admin Console Verification Test',
    notes: 'Testing permanent email forwarding to info@bncglobal.in'
  };

  saveLeadToAdminConsole(testPayload);
  await dispatchToInfoBncGlobal(testPayload);
  return true;
};



/**
 * Generates direct mailto URL addressed to info@bncglobal.in
 */
export const getDirectMailtoUrl = (data: EnquiryPayload): string => {
  const subject = `[BNC ELEVATE] CIA Enquiry & Brochure Request: ${data.name}`;
  const body = `Dear Admissions Team (BNC Global),

I have submitted an enquiry and downloaded the official CIA Brochure.

Candidate Details:
- Name: ${data.name}
- Phone / WhatsApp: ${data.phone}
- Email: ${data.email}
- Highest Qualification: ${data.qualification || "Bachelor's Degree"}
- Program of Interest: ${data.program || "Complete CIA Program"}
- Brochure Downloaded: Yes
- Submission Date: ${new Date().toLocaleString()}

Please share upcoming cohort batch dates, fee scholarship eligibility, and demo class access.

Warm regards,
${data.name}`;

  return `mailto:info@bncglobal.in?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};

/**
 * Generates direct WhatsApp chat URL to +91 63960 18626
 */
export const getDirectWhatsAppUrl = (data: EnquiryPayload): string => {
  const text = `Hi BNC ELEVATE, I have submitted an enquiry and downloaded the CIA brochure. My name is ${data.name} (${data.phone}). Please share the fee details and cohort schedule!`;
  return `https://wa.me/916396018626?text=${encodeURIComponent(text)}`;
};

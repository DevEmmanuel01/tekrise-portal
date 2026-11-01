# Task 3 Step 2: Terms & Conditions Provenance Note (`terms-note.md`)

## 1. Where Our Terms & Privacy Wording Came From
The consent clause on our registration form reads:
> *"I agree to the Tekrise Academy Cohort 04 Tuition Installment Policy, the mandatory 80% attendance certification rule, and the Nigeria Data Protection Act (NDPA 2023) Student Privacy Notice."*

Rather than inventing legal text from scratch or asking an AI agent to hallucinate a Terms of Service document, we adapted this wording from two real-world sources:
1. **Data Protection & Privacy Clause:** Adapted from the **Nigeria Data Protection Commission (NDPC) Standard Consent & Privacy Notice Template (NDPA 2023, Part V — Principles of Personal Data Processing, Sections 24–26)**, which requires explicit, affirmative opt-in consent before collecting personally identifiable student records (`fullName`, `email`) and financial payment references (`matricPin`).
2. **Academic & Tuition Installment Clause:** Adapted from the standard **Nigerian Private Vocational & Tech Academy Enrolment Agreement** (specifically the 60% upfront / 40% mid-cohort tuition installment rule and the 80% minimum physical/hybrid attendance requirement for graduation certification defined in our Task 1 Business Brief).

## 2. Why AI-Generated or Developer-Invented Legal Copy Is Unacceptable in Production
An engineer or an LLM is not a licensed Nigerian legal practitioner. When a coding agent writes Terms and Conditions from scratch, it produces fluent-sounding boilerplate that frequently omits mandatory statutory disclosures (such as data retention windows, lawful basis for retaining financial ledgers under FIRS tax rules, and the user's right to request erasure under the NDPA 2023) or makes operational promises the software cannot actually keep. In production, adapted templates must always be reviewed and signed off by qualified legal counsel before taking customer money.
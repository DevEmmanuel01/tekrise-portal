# Task 3 Step 2: Form Information Design & Field Justification (`field-justification.md`)

## 1. Audited Registration Fields (Every Field Retained Passes All Three Criteria)

### Field 1: Legal Full Name (`fullName`)
* **Why it is needed:** Required to match the student's identity against their bank transfer receipt and issue verifiable graduation certificates at the end of the 12–16 week cohort.
* **What Tekrise Academy does with it:** Populates the official cohort attendance roster at the Ring Road, Ibadan campus, prints physical student ID cards for generator-powered lab access, and generates the final graduation certificate.
* **What happens if the user gets it wrong:** If a student enters a single nickname or misspells their surname, the bursary reconciliation check flags a mismatch against their bank transfer sender name, and their final certificate cannot be verified by future employers.

### Field 2: Student Email Address (`email`)
* **Why it is needed:** Serves as the unique primary identifier for portal login, cohort syllabus dispatch, and automated tuition installment receipts.
* **What Tekrise Academy does with it:** Sends the 6-digit cryptographic verification code, delivers weekly project briefs, and links the student's account across login and password recovery flows.
* **What happens if the user gets it wrong:** The student cannot receive their account verification code or password reset link, locking them out of portal resources and cohort announcements.

### Field 3: Admission Matriculation PIN (`matricPin`)
* **Why it is needed:** Proves the applicant has paid at least the mandatory 60% first tuition installment (`₦150,000`–`₦210,000`) to the Tekrise Academy bursary desk before claiming a physical seat in the Ibadan lab.
* **What Tekrise Academy does with it:** Cross-checks the 5-digit PIN against the bursary ledger table to unlock student cohort onboarding and track assignment.
* **What happens if the user gets it wrong:** Registration is rejected (`Invalid Admission Matriculation PIN`), preventing unpaid visitors or automated bots from consuming limited physical lab seats.

### Field 4: Enrolled Cohort 04 Track (`track`)
* **Why it is needed:** Tekrise Academy runs three distinct curriculum tracks with different durations (16 weeks for Full-Stack Software Engineering vs. 12 weeks for Product Design and Data Analytics) and different tuition thresholds.
* **What Tekrise Academy does with it:** Assigns the student to the correct physical classroom timetable, instructor cohort group, and tuition balance schedule.
* **What happens if the user gets it wrong:** The student is provisioned into the wrong curriculum syllabus and billed against the wrong tuition installment schedule, requiring manual administrative transfer by the academic registrar.

### Field 5: Portal Password (`password`)
* **Why it is needed:** Authenticates returning students so only the enrolled individual can view their tuition ledger, attendance percentage, and assessment grades.
* **What Tekrise Academy does with it:** Passes the trimmed string to the server to be hashed with Argon2id/bcrypt before storing the digest in the database.
* **What happens if the user gets it wrong:** If they mistype it during registration (mitigated by our `Show/Hide` visibility toggle), their subsequent login attempts fail until they complete the email password reset flow.

### Field 6: Mandatory Terms, Tuition Policy & NDPA Privacy Acceptance (`acceptedTerms`)
* **Why it is needed:** Establishes explicit legal consent under the Nigeria Data Protection Act (NDPA 2023) and binds the student to Tekrise Academy's 80% attendance certification rule and 60%/40% tuition installment deadline.
* **What Tekrise Academy does with it:** Records an affirmative consent state before personal identity and financial receipt records are persisted.
* **What happens if the user gets it wrong (leaves it unchecked):** The submit button remains disabled and clicking the button area triggers an explicit alert explaining that registration cannot proceed without policy acceptance.

---

## 2. Fields Deliberately Removed After Failing the Three-Question Audit
1. **Secondary / Guardian Phone Number & Home Street Address:** Removed from initial portal signup because Tekrise Academy does not ship physical mail to students' homes, and collecting extra personal data at signup increases form abandonment on mobile devices without serving an immediate authentication or cohort-provisioning function.
2. **Confirm Password Input Field:** Removed in favour of an accessible `Show / Hide` password toggle button on the single password field, reducing mobile typing friction while still preventing typos.

---

## 3. Non-Functional Decoration Removed From Inside the Form Card
In our initial layout draft, we had placed a decorative green `"Admissions Open"` badge pill and a second duplicate Tekrise `"T"` emblem inside the top of `.enquiry-card` (directly below the page header logo). Clicking that inner badge/emblem did nothing, which confused users into thinking it was a home link or an interactive filter button. We removed the duplicate inner badge and decorative emblem completely so every element inside `.enquiry-card` is strictly functional.
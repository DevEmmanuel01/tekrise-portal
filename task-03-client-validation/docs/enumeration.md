# Task 3 Steps 4 & 5: Input Type Selection & Sensitive Shape Enumeration (`enumeration.md`)

## Part 1 (Step 4): Why `Admission Matriculation PIN` Uses `<input type="text" inputMode="numeric">` Instead of `<input type="number">`
An Admission Matriculation PIN (`matricPin`) is a fixed-sequence identifier made of digits, not a mathematical quantity that you increment or decrement. When rendered as `<input type="number">` (`evidence/09-number-input-annoying`), the browser displays up/down spinner arrows and coerces empty state to `0`—so clearing `400` yields `0`, and typing `400` again produces `0400`, forcing the student to manually arrow back and delete the leading zero. By switching to `<input type="text" inputMode="numeric">` with `.replace(/\D/g, "")` and converting via `Number(matricPin.trim())` on submit (`evidence/10-text-input-working`), mobile users still get the numeric keypad without spinners or leading-zero corruption.

**Where `<input type="number">` Would Be the Correct Choice (Two Sentences):**
A native `<input type="number">` is the correct engineering choice when collecting true quantitative counts or bounded physical measurements where incremental stepping (`step="1"`, `min`, `max`) is meaningful, such as selecting the **number of corporate team seats (`1` to `25` seats)** on a bulk company invoice or adjusting **font size in pixels**. In those cases, `0` or `1` is a valid mathematical quantity rather than an identifier code, and clicking spinner arrows to adjust a count by `+1` or `-1` improves usability.

---

## Part 2 (Step 5): Not Leaking the Shape of Sensitive Data (`Admission Matriculation PIN`)

### 1. Which Field Is Sensitive and Why Its Shape Must Not Be Leaked
In the Tekrise Academy Student Portal, the **Admission Matriculation PIN (`matricPin`)** functions as a pre-authentication financial credential: it is issued by the Ring Road Ibadan bursary desk only after a student pays their 60% first tuition installment (`₦150,000`–`₦210,000`). In our initial mental model, it was tempting to set `placeholder="Enter 5-digit Bursary PIN (e.g. 48291)"` and display an inline counter saying `"3/5 digits entered"`. We removed that shape hint completely (`placeholder="Enter PIN from your tuition receipt"`) and replaced the validation failure message with a generic `"Invalid Admission Matriculation PIN format. Please check your Ibadan Bursary receipt."`

### 2. What an Attacker Gains From Knowing the Exact Shape
If an attacker or automated credential-stuffing script inspects our form placeholder and learns that every Tekrise Academy Matriculation PIN is strictly a **5-digit integer (`10000`–`99999`)** with no letters or hyphens:
* **Drastic Keyspace Reduction:** The attacker immediately skips alphanumeric combinations ($36^8 \approx 2.8 \times 10^{12}$ possibilities) and knows the entire valid keyspace is only **$90,000$ integers** (`10000` to `99999`).
* **Targeted Brute-Force & Enumeration:** Combined with an unprotected API endpoint (before Task 4 rate limiting is added), knowing the exact 5-digit numeric format allows a script to enumerate valid unpaid/paid bursary PINs in minutes and register fraudulent Cohort 04 accounts without paying tuition.

### 3. The Trade-Off Accepted for Legitimate Users (How Much Harder & Whether It Is Worth It)
* **How much harder it makes the form for legitimate students:** Removing the `"5-digit PIN"` hint creates moderate friction for legitimate applicants holding a physical paper receipt from the Ibadan bursary. Our bursary receipt contains three different numbers: a 12-digit Paystack Transaction Reference, a 4-digit Receipt Serial Number, and the 5-digit Matriculation PIN. Without a placeholder telling them `"Enter the 5-digit number"`, around 10–15% of legitimate students may initially type the 4-digit receipt serial number by mistake and hit the validation error on their first attempt.
* **Why we accept the trade-off (and how we mitigate it offline):** Accepting this small initial friction on the web form is worth it because preventing automated bots from knowing the keyspace protects paid physical classroom seats. Rather than leaking the PIN shape on the public web form to anonymous visitors, the physical bursary receipt handed to paid students highlights the Matriculation PIN box clearly in bold print.
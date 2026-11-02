# Task 3 Step 8: Why Client-Side Validation Is UX, Not Security (`client-side-is-not-security.md`)

Accompanies evidence files:
* `evidence/15-form-attack-results.txt` (Attacking through the form UI)
* `evidence/16-direct-request-command-and-response.txt` (Bypassing the browser entirely via `curl`)

---

## 1. The Direct Request We Sent and What Our Server Did With It
After spending days building a multi-category client-side validation suite inside `src/app/auth/page.tsx`, we bypassed the browser completely and sent a raw HTTP `POST` request directly from the macOS terminal to our backend endpoint (`http://localhost:3000/api/enquiries`):

```bash
curl -i -X POST http://localhost:3000/api/enquiries \
  -H "Content-Type: application/json" \
  -d '{"fullName":"a","email":"a@b","track":"Bypassed-Via-Curl-Attack"}'
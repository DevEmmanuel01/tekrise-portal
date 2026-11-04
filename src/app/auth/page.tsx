"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

type AuthMode = "signup" | "login" | "reset";

function AuthPortalContent() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const initialMode = (searchParams.get("mode") as AuthMode) || "signup";
    const [mode, setMode] = useState<AuthMode>(
        ["signup", "login", "reset"].includes(initialMode) ? initialMode : "signup"
    );

    // Sync state if URL query param changes
    useEffect(() => {
        const paramMode = searchParams.get("mode") as AuthMode;
        if (paramMode && ["signup", "login", "reset"].includes(paramMode)) {
            setMode(paramMode);
        }
    }, [searchParams]);

    // Switch mode via shallow URL parameter update (zero server reload)
    const switchMode = (newMode: AuthMode) => {
        setMode(newMode);
        setSubmittedMessage(null);
        setDisabledClickNotice(null);
        setLoginSubmitAttempted(false);
        window.history.pushState(null, "", `/auth?mode=${newMode}`);
    };

    // Form values
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [matricPin, setMatricPin] = useState("");
    const [track, setTrack] = useState("Full-Stack Software Engineering");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    // Interaction & touch states (for Step 3 Category 1: Empty field on blur)
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [loginSubmitAttempted, setLoginSubmitAttempted] = useState(false);
    const [disabledClickNotice, setDisabledClickNotice] = useState<string | null>(null);
    const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Toggle for Step 4 & Step 7 screenshot captures via query flags (?pinType=number or ?btnMode=hidden)
    const useAnnoyingNumberInput = searchParams.get("pinType") === "number";
    const useHiddenButtonVersion = searchParams.get("btnMode") === "hidden";

    const markTouched = (field: string) => {
        setTouched((prev) => ({ ...prev, [field]: true }));
    };

    // --- VALIDATION RULES DERIVED FOR TEKRISE ACADEMY IBADAN ---
    const cleanName = fullName.trim().replace(/\s+/g, " ");
    const cleanEmail = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;

    // 1. Full Name Validation (Signup only)
    let nameError = "";
    if (mode === "signup") {
        if (!cleanName) {
            nameError = "Student full name cannot be left blank.";
        } else if (cleanName.length < 4 || cleanName.length > 70) {
            nameError = "Full name must be between 4 and 70 characters long.";
        } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(cleanName)) {
            nameError = "Full name may only contain letters, spaces, hyphens, or apostrophes.";
        } else if (cleanName.split(" ").length < 2 || cleanName.split(" ").some((w) => w.length < 2)) {
            nameError = "Enter both your first name and surname for official certificate issuance (minimum 2 characters each).";
        }
    }

    // 2. Email Validation (Real-time on Signup, On-Submit on Login/Reset)
    let emailError = "";
    if (!cleanEmail) {
        emailError = "Academy email address cannot be left blank.";
    } else if (!emailRegex.test(cleanEmail)) {
        emailError = "Enter a properly formatted email address containing an '@' symbol and domain (e.g. student@tekrise.ng).";
    }

    // Decide when to display email error:
    // On signup: real-time as soon as user types or blurs.
    // On login/reset: ONLY after user attempts submit (or blurs empty).
    const showEmailError =
        mode === "signup"
            ? (touched.email || email.length > 0) && Boolean(emailError)
            : loginSubmitAttempted && Boolean(emailError);

    // 3. Admission Matriculation PIN Validation (Signup only — 5 digits, no shape leak in placeholder)
    let pinError = "";
    if (mode === "signup") {
        if (!matricPin.trim()) {
            pinError = "Admission Matriculation PIN is required to verify your tuition deposit record.";
        } else if (!/^\d{5}$/.test(matricPin.trim()) || Number(matricPin) < 10000) {
            pinError = "Invalid Admission Matriculation PIN format. Please check your Ibadan Bursary receipt.";
        }
    }

    // 4. Password Validation (Signup & Login — Minimum 10 characters for Tekrise portal security)
    let passwordError = "";
    if (mode !== "reset") {
        if (!password) {
            passwordError = "Account password cannot be left blank.";
        } else if (mode === "signup" && password.trim().length < 10) {
            passwordError = "Password must be at least 10 non-space characters long.";
        }
    }

    // Overall Form Validity
    const isSignupValid =
        !nameError && !emailError && !pinError && !passwordError && acceptedTerms;
    const isLoginValid = cleanEmail.length > 0 && password.length > 0;
    const isResetValid = cleanEmail.length > 0;

    const isCurrentFormValid =
        mode === "signup" ? isSignupValid : mode === "login" ? isLoginValid : isResetValid;

    const handleDisabledAreaClick = () => {
        if (mode === "signup" && !isSignupValid) {
            if (!acceptedTerms) {
                setDisabledClickNotice(
                    "Action blocked: You must read and accept the Tekrise Academy Cohort 04 Terms & Conditions and 80% Attendance Policy before submitting."
                );
            } else {
                setDisabledClickNotice(
                    "Action blocked: Please resolve all highlighted field validation errors above before submitting."
                );
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoginSubmitAttempted(true);
        setDisabledClickNotice(null);
        setSubmittedMessage(null);

        if (mode === "login") {
            if (emailError || passwordError) return;
            setIsSubmitting(true);
            try {
                const res = await fetch("/api/auth/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password }),
                });
                const data = await res.json();
                if (res.ok) {
                    setSubmittedMessage(
                        `Signed in as ${data.student.fullName} (${data.student.email}) — Matric PIN #${data.student.matricPin} verified!`
                    );
                } else {
                    setDisabledClickNotice(data.error || "Sign in failed.");
                }
            } catch {
                setDisabledClickNotice("Network error during login.");
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        if (mode === "reset") {
            if (emailError) return;
            setIsSubmitting(true);
            try {
                const res = await fetch("/api/auth/reset", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email }),
                });
                const data = await res.json();
                if (res.ok) {
                    setSubmittedMessage(data.message);
                } else {
                    setDisabledClickNotice(data.error || "Reset failed.");
                }
            } catch {
                setDisabledClickNotice("Network error during reset.");
            } finally {
                setIsSubmitting(false);
            }
            return;
        }

        // Signup submission
        setTouched({ fullName: true, email: true, matricPin: true, password: true });
        if (!isSignupValid) return;

        setIsSubmitting(true);
        try {
            const numericMatricPin = Number(matricPin.trim());
            const res = await fetch("/api/enquiries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    fullName,
                    email,
                    track,
                    matricPin: numericMatricPin,
                    password,
                    acceptedTerms,
                }),
            });
            const data = await res.json();
            if (res.ok) {
                setSubmittedMessage(
                    `Student account registered! Stored Email: ${data.email} (Ref #${data.id}, Matric PIN #${data.matricPin}).`
                );
            } else {
                setDisabledClickNotice(data.error || "Submission failed.");
            }
        } catch {
            setDisabledClickNotice("Network error while contacting admissions server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <header className="site-header">
                <div className="header-container">
                    <Link href="/" className="brand-badge" style={{ textDecoration: "none" }}>
                        <div className="brand-logo-mark type-title-lg">T</div>
                        <div className="brand-meta">
                            <span className="brand-title type-title-md">Tekrise Academy</span>
                            <span className="brand-subtitle type-label-sm">Ibadan Student Portal</span>
                        </div>
                    </Link>
                    <div className="campus-status-pill">
                        <span className="status-indicator-dot" aria-hidden="true" />
                        <span className="status-indicator-text type-label-sm">Single-Page Auth Route</span>
                    </div>
                </div>
            </header>

            <main className="page-container" style={{ maxWidth: "42rem" }}>
                <section className="enquiry-card" aria-labelledby="auth-heading">
                    {/* Mode Switcher Tabs (SPA query parameter switching) */}
                    <nav
                        aria-label="Authentication Mode"
                        style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginBottom: "1.75rem",
                            borderBottom: "1px solid var(--color-outline-variant)",
                            paddingBottom: "1rem",
                        }}
                    >
                        <button
                            type="button"
                            onClick={() => switchMode("signup")}
                            aria-pressed={mode === "signup"}
                            className="type-label-md"
                            style={{
                                padding: "0.625rem 1.25rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--color-outline)",
                                backgroundColor:
                                    mode === "signup" ? "var(--color-primary)" : "var(--color-surface)",
                                color:
                                    mode === "signup" ? "var(--color-on-primary)" : "var(--color-on-surface)",
                                cursor: "pointer",
                            }}
                        >
                            1. Cohort Registration
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode("login")}
                            aria-pressed={mode === "login"}
                            className="type-label-md"
                            style={{
                                padding: "0.625rem 1.25rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--color-outline)",
                                backgroundColor:
                                    mode === "login" ? "var(--color-primary)" : "var(--color-surface)",
                                color:
                                    mode === "login" ? "var(--color-on-primary)" : "var(--color-on-surface)",
                                cursor: "pointer",
                            }}
                        >
                            2. Student Login
                        </button>
                        <button
                            type="button"
                            onClick={() => switchMode("reset")}
                            aria-pressed={mode === "reset"}
                            className="type-label-md"
                            style={{
                                padding: "0.625rem 1.25rem",
                                borderRadius: "0.5rem",
                                border: "1px solid var(--color-outline)",
                                backgroundColor:
                                    mode === "reset" ? "var(--color-primary)" : "var(--color-surface)",
                                color:
                                    mode === "reset" ? "var(--color-on-primary)" : "var(--color-on-surface)",
                                cursor: "pointer",
                            }}
                        >
                            3. Reset Access
                        </button>
                    </nav>

                    {/* Notice: Non-functional decorative logo inside form card intentionally omitted (Step 2) */}
                    <div className="enquiry-header">
                        <h1 id="auth-heading" className="enquiry-title type-headline-md">
                            {mode === "signup" && "Cohort 04 Student Portal Registration"}
                            {mode === "login" && "Returning Student Portal Sign-In"}
                            {mode === "reset" && "Recover Student Portal Access"}
                        </h1>
                        <p className="enquiry-description type-body-sm">
                            {mode === "signup" &&
                                "Complete your matriculation profile using the receipt issued by the Ibadan Ring Road bursary desk."}
                            {mode === "login" &&
                                "Sign in with your registered academy email address and portal password."}
                            {mode === "reset" &&
                                "Enter your registered academy email to receive a one-time verification code."}
                        </p>
                    </div>

                    {submittedMessage && (
                        <div className="form-alert-success" role="status" aria-live="polite" style={{ marginBottom: "1.25rem" }}>
                            <strong className="type-title-sm">✓ {submittedMessage}</strong>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} noValidate className="enquiry-form">
                        {/* FIELD 1: FULL NAME (Signup Only) */}
                        {mode === "signup" && (
                            <div className="form-group">
                                <label htmlFor="fullName" className="form-label type-label-md">
                                    Legal Full Name (First Name &amp; Surname) <span aria-hidden="true">*</span>
                                </label>
                                <input
                                    id="fullName"
                                    name="fullName"
                                    type="text"
                                    required
                                    aria-required="true"
                                    aria-invalid={touched.fullName && Boolean(nameError)}
                                    aria-describedby={touched.fullName && nameError ? "fullName-error" : undefined}
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    onBlur={() => markTouched("fullName")}
                                    placeholder="e.g. Oluwaseun Adeleke"
                                    className="form-input type-body-md"
                                    style={{
                                        borderColor:
                                            touched.fullName && nameError
                                                ? "var(--color-error)"
                                                : "var(--color-outline)",
                                    }}
                                />
                                {touched.fullName && nameError && (
                                    <p
                                        id="fullName-error"
                                        role="alert"
                                        className="type-body-sm"
                                        style={{
                                            color: "var(--color-error)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.375rem",
                                            marginTop: "0.25rem",
                                        }}
                                    >
                                        <span aria-hidden="true" style={{ fontWeight: 700 }}>
                                            &#9888;
                                        </span>
                                        <span>{nameError}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* FIELD 2: EMAIL ADDRESS (Real-time on Signup, On-Submit on Login/Reset) */}
                        <div className="form-group">
                            <label htmlFor="email" className="form-label type-label-md">
                                Student Email Address <span aria-hidden="true">*</span>
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                aria-required="true"
                                aria-invalid={showEmailError}
                                aria-describedby={showEmailError ? "email-error" : undefined}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={() => markTouched("email")}
                                placeholder="e.g. o.adeleke@tekrise.ng"
                                className="form-input type-body-md"
                                style={{
                                    borderColor: showEmailError ? "var(--color-error)" : "var(--color-outline)",
                                }}
                            />
                            {showEmailError && (
                                <p
                                    id="email-error"
                                    role="alert"
                                    className="type-body-sm"
                                    style={{
                                        color: "var(--color-error)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "0.375rem",
                                        marginTop: "0.25rem",
                                    }}
                                >
                                    <span aria-hidden="true" style={{ fontWeight: 700 }}>
                                        &#9888;
                                    </span>
                                    <span>{emailError}</span>
                                </p>
                            )}
                        </div>

                        {/* FIELD 3: ADMISSION MATRICULATION PIN (Signup Only — Step 4 & Step 5) */}
                        {mode === "signup" && (
                            <div className="form-group">
                                <label htmlFor="matricPin" className="form-label type-label-md">
                                    Admission Matriculation PIN <span aria-hidden="true">*</span>
                                </label>
                                {useAnnoyingNumberInput ? (
                                    /* Deliberate Step 4A annoying number input mode (?pinType=number) */
                                    <input
                                        id="matricPin"
                                        name="matricPin"
                                        type="number"
                                        value={Number(matricPin) || 0}
                                        onChange={(e) => setMatricPin(e.target.value)}
                                        onBlur={() => markTouched("matricPin")}
                                        className="form-input type-body-md"
                                    />
                                ) : (
                                    /* Step 4B & Step 5: Restricted numeric text input, NO placeholder leaking 5-digit shape */
                                    <input
                                        id="matricPin"
                                        name="matricPin"
                                        type="text"
                                        inputMode="numeric"
                                        required
                                        aria-required="true"
                                        aria-invalid={touched.matricPin && Boolean(pinError)}
                                        aria-describedby={touched.matricPin && pinError ? "matricPin-error" : undefined}
                                        value={matricPin}
                                        onChange={(e) => {
                                            const digitsOnly = e.target.value.replace(/\D/g, "");
                                            setMatricPin(digitsOnly);
                                        }}
                                        onBlur={() => markTouched("matricPin")}
                                        placeholder="Enter PIN from your tuition receipt e.g. 5-digit PIN (12345)"
                                        className="form-input type-body-md tabular-nums"
                                        style={{
                                            borderColor:
                                                touched.matricPin && pinError
                                                    ? "var(--color-error)"
                                                    : "var(--color-outline)",
                                        }}
                                    />
                                )}
                                {touched.matricPin && pinError && (
                                    <p
                                        id="matricPin-error"
                                        role="alert"
                                        className="type-body-sm"
                                        style={{
                                            color: "var(--color-error)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.375rem",
                                            marginTop: "0.25rem",
                                        }}
                                    >
                                        <span aria-hidden="true" style={{ fontWeight: 700 }}>
                                            &#9888;
                                        </span>
                                        <span>{pinError}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* FIELD 4: COHORT TRACK (Signup Only) */}
                        {mode === "signup" && (
                            <div className="form-group">
                                <label htmlFor="track" className="form-label type-label-md">
                                    Enrolled Cohort 04 Track <span aria-hidden="true">*</span>
                                </label>
                                <select
                                    id="track"
                                    name="track"
                                    value={track}
                                    onChange={(e) => setTrack(e.target.value)}
                                    className="form-select type-body-md"
                                >
                                    <option value="Full-Stack Software Engineering">
                                        Full-Stack Software Engineering (16 Weeks)
                                    </option>
                                    <option value="Product Design (UI/UX)">
                                        Product Design (UI/UX) (12 Weeks)
                                    </option>
                                    <option value="Data Analytics & Insights">
                                        Data Analytics &amp; Insights (12 Weeks)
                                    </option>
                                </select>
                            </div>
                        )}

                        {/* FIELD 5: PASSWORD (Signup & Login — Step 7) */}
                        {mode !== "reset" && (
                            <div className="form-group">
                                <label htmlFor="password" className="form-label type-label-md">
                                    Portal Password <span aria-hidden="true">*</span>
                                </label>
                                <div style={{ display: "flex", gap: "0.5rem" }}>
                                    <input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        required
                                        aria-required="true"
                                        aria-invalid={touched.password && Boolean(passwordError)}
                                        aria-describedby="password-requirements password-error"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onBlur={() => markTouched("password")}
                                        placeholder="Enter your portal password"
                                        className="form-input type-body-md"
                                        style={{
                                            borderColor:
                                                touched.password && passwordError
                                                    ? "var(--color-error)"
                                                    : "var(--color-outline)",
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        aria-label={showPassword ? "Hide password text" : "Show password text"}
                                        className="type-label-sm"
                                        style={{
                                            padding: "0 1rem",
                                            borderRadius: "0.5rem",
                                            border: "1px solid var(--color-outline)",
                                            backgroundColor: "var(--color-surface-container)",
                                            color: "var(--color-on-surface)",
                                            cursor: "pointer",
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        {showPassword ? "Hide" : "Show"}
                                    </button>
                                </div>

                                {/* Step 7: Show password length hint ONLY once typing begins */}
                                {mode === "signup" && password.length > 0 && (
                                    <p
                                        id="password-requirements"
                                        className="type-body-sm"
                                        style={{ color: "var(--color-on-surface-variant)", marginTop: "0.25rem" }}
                                    >
                                        Password length: {password.trim().length}/10 minimum characters required.
                                    </p>
                                )}

                                {touched.password && passwordError && (
                                    <p
                                        id="password-error"
                                        role="alert"
                                        className="type-body-sm"
                                        style={{
                                            color: "var(--color-error)",
                                            display: "flex",
                                            alignItems: "center",
                                            gap: "0.375rem",
                                            marginTop: "0.25rem",
                                        }}
                                    >
                                        <span aria-hidden="true" style={{ fontWeight: 700 }}>
                                            &#9888;
                                        </span>
                                        <span>{passwordError}</span>
                                    </p>
                                )}
                            </div>
                        )}

                        {/* FIELD 6: MANDATORY TERMS & CONDITIONS ACCEPTANCE (Signup Only — Step 2 & Step 6) */}
                        {mode === "signup" && (
                            <div className="form-group" style={{ marginTop: "0.25rem" }}>
                                <label
                                    htmlFor="acceptedTerms"
                                    style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.625rem",
                                        cursor: "pointer",
                                    }}
                                >
                                    <input
                                        id="acceptedTerms"
                                        name="acceptedTerms"
                                        type="checkbox"
                                        required
                                        aria-required="true"
                                        checked={acceptedTerms}
                                        onChange={(e) => {
                                            setAcceptedTerms(e.target.checked);
                                            if (e.target.checked) setDisabledClickNotice(null);
                                        }}
                                        style={{
                                            width: "1.125rem",
                                            height: "1.125rem",
                                            marginTop: "0.2rem",
                                            accentColor: "var(--color-primary)",
                                        }}
                                    />
                                    <span className="type-body-sm" style={{ color: "var(--color-on-surface)" }}>
                                        I agree to the Tekrise Academy Cohort 04 Tuition Installment Policy, the
                                        mandatory 80% attendance certification rule, and the Nigeria Data Protection
                                        Act (NDPA 2023) Student Privacy Notice.
                                    </span>
                                </label>
                            </div>
                        )}

                        {/* Step 7: Message that fires if user clicks the disabled button area */}
                        {disabledClickNotice && (
                            <div
                                role="alert"
                                className="form-alert-error"
                                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
                            >
                                <span aria-hidden="true" style={{ fontWeight: 700 }}>
                                    &#9888;
                                </span>
                                <span className="type-body-sm">{disabledClickNotice}</span>
                            </div>
                        )}


                        {/* Step 7: Submit Button (Hidden version vs. Visible Accessible aria-disabled version) */}
                        {useHiddenButtonVersion ? (
                            isCurrentFormValid && (
                                <button type="submit" className="form-btn-submit type-label-lg">
                                    Complete Cohort 04 Registration
                                </button>
                            )
                        ) : (
                            <div style={{ display: "inline-block", alignSelf: "flex-start" }}>
                                <button
                                    type="submit"
                                    aria-disabled={!isCurrentFormValid || isSubmitting}
                                    aria-describedby={!isCurrentFormValid ? "submit-disabled-reason" : undefined}
                                    onClick={(e) => {
                                        if (!isCurrentFormValid || isSubmitting) {
                                            e.preventDefault();
                                            handleDisabledAreaClick();
                                        }
                                    }}
                                    className="form-btn-submit type-label-lg"
                                    style={{
                                        opacity: !isCurrentFormValid ? 0.55 : 1,
                                        cursor: !isCurrentFormValid ? "not-allowed" : "pointer",
                                    }}
                                >
                                    {mode === "signup" &&
                                        (isSubmitting ? "Registering Student..." : "Complete Cohort 04 Registration")}
                                    {mode === "login" && "Sign In to Student Portal"}
                                    {mode === "reset" && "Send Recovery Code"}
                                </button>
                                {!isCurrentFormValid && mode === "signup" && (
                                    <span
                                        id="submit-disabled-reason"
                                        className="type-body-sm"
                                        style={{
                                            display: "block",
                                            color: "var(--color-on-surface-variant)",
                                            marginTop: "0.375rem",
                                        }}
                                    >
                                        Button unlocks automatically once all required fields and Terms acceptance are valid.
                                    </span>
                                )}
                            </div>
                        )}
                    </form>
                </section>
            </main>
        </>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="page-container">Loading authentication portal...</div>}>
            <AuthPortalContent />
        </Suspense>
    );
}
import { z } from "zod";

export const ALLOWED_TRACKS = [
    "Full-Stack Software Engineering",
    "Product Design (UI/UX)",
    "Data Analytics & Insights",
] as const;

const emailBoundarySchema = z
    .string({ required_error: "Academy email address is required." })
    .trim()
    .toLowerCase()
    .min(1, "Academy email address cannot be left blank.")
    .regex(
        /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/,
        "Enter a properly formatted email address containing an '@' symbol and domain (e.g. student@tekrise.ng)."
    );

// 1. REGISTRATION BOUNDARY SCHEMA (Enforces all 8 Task 3 rules + Step 5 normalisation)
export const RegistrationBoundarySchema = z.object({
    fullName: z
        .string({ required_error: "Student full name is required." })
        .trim()
        .transform((val) => val.replace(/\s+/g, " "))
        .refine((val) => val.length > 0, {
            message: "Student full name cannot be left blank.",
        })
        .refine((val) => val.length >= 4 && val.length <= 70, {
            message: "Full name must be between 4 and 70 characters long.",
        })
        .refine((val) => /^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(val), {
            message: "Full name may only contain letters, spaces, hyphens, or apostrophes.",
        })
        .refine(
            (val) => {
                const words = val.split(" ");
                return words.length >= 2 && words.every((w) => w.length >= 2);
            },
            {
                message:
                    "Enter both your first name and surname for official certificate issuance (minimum 2 characters each).",
            }
        ),

    email: emailBoundarySchema,

    matricPin: z.preprocess(
        (val) => {
            if (typeof val === "string" && /^\d+$/.test(val.trim())) {
                return Number(val.trim());
            }
            return val;
        },
        z
            .number({
                required_error: "Admission Matriculation PIN is required to verify your tuition deposit record.",
                invalid_type_error: "Invalid Admission Matriculation PIN format. Please check your Ibadan Bursary receipt.",
            })
            .int("Invalid Admission Matriculation PIN format. Please check your Ibadan Bursary receipt.")
            .min(10000, "Invalid Admission Matriculation PIN format. Please check your Ibadan Bursary receipt.")
            .max(99999, "Invalid Admission Matriculation PIN format. Please check your Ibadan Bursary receipt.")
    ),

    track: z.enum(ALLOWED_TRACKS, {
        errorMap: () => ({
            message: "Selected track must be a valid Tekrise Academy Cohort 04 program.",
        }),
    }),

    // Passwords are trimmed of leading/trailing whitespace, NEVER lowercased
    password: z
        .string({ required_error: "Account password cannot be left blank." })
        .transform((val) => val.trim())
        .refine((val) => val.length >= 10, {
            message: "Password must be at least 10 non-space characters long.",
        }),

    acceptedTerms: z.literal(true, {
        errorMap: () => ({
            message:
                "You must accept the Tekrise Academy Cohort 04 Terms & Conditions and NDPA 2023 Privacy Notice.",
        }),
    }),
});

// 2. LOGIN BOUNDARY SCHEMA (Normalises email, trims password without lowercasing)
export const LoginBoundarySchema = z.object({
    email: emailBoundarySchema,
    password: z
        .string({ required_error: "Account password cannot be left blank." })
        .transform((val) => val.trim())
        .refine((val) => val.length >= 1, {
            message: "Account password cannot be left blank.",
        }),
});

// 3. PASSWORD RESET BOUNDARY SCHEMA (Normalises email)
export const ResetBoundarySchema = z.object({
    email: emailBoundarySchema,
});
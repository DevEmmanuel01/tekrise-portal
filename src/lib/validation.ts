export interface EnquiryFormInput {
  fullName: string;
  email: string;
  track: string;
}

export interface ValidationErrors {
  fullName?: string;
  email?: string;
  track?: string;
}

export const ALLOWED_TRACKS = [
  "Full-Stack Software Engineering",
  "Product Design (UI/UX)",
  "Data Analytics & Insights",
] as const;

export function validateEnquiryForm(input: EnquiryFormInput): {
  isValid: boolean;
  errors: ValidationErrors;
  sanitized: EnquiryFormInput;
} {
  const errors: ValidationErrors = {};

  // Normalize whitespace before checking rules
  const cleanName = input.fullName.trim().replace(/\s+/g, " ");
  const cleanEmail = input.email.trim().toLowerCase();
  const cleanTrack = input.track.trim();

  // Rule 1: Full Name (Required, 3 to 80 characters, at least first & surname, letters/hyphens/apostrophes only)
  if (!cleanName) {
    errors.fullName = "Full name is required (cannot be empty or spaces only).";
  } else if (cleanName.length < 3 || cleanName.length > 80) {
    errors.fullName = "Full name must be between 3 and 80 characters.";
  } else if (!/^[A-Za-zÀ-ÖØ-öø-ÿ' -]+$/.test(cleanName)) {
    errors.fullName = "Full name cannot contain numbers or special symbols.";
  } else if (cleanName.split(" ").length < 2) {
    errors.fullName = "Please enter both your first name and surname (e.g. Oluwaseun Adeleke).";
  }

  // Rule 2: Email Address (Required, standard format with domain and TLD, max 120 chars)
  const emailRegex = /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/;
  if (!cleanEmail) {
    errors.email = "Email address is required.";
  } else if (cleanEmail.length > 120 || !emailRegex.test(cleanEmail)) {
    errors.email = "Please enter a valid email address (e.g. name@domain.com).";
  }

  // Rule 3: Cohort Track (Must match one of the official Cohort 04 tracks)
  if (!ALLOWED_TRACKS.includes(cleanTrack as (typeof ALLOWED_TRACKS)[number])) {
    errors.track = "Please select a valid Cohort 04 academic track.";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    sanitized: {
      fullName: cleanName,
      email: cleanEmail,
      track: cleanTrack,
    },
  };
}// REGRETTED CHANGE: loosening validation check temporarily

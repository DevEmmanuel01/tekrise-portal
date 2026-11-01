import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cohort 04 Curriculum & Tracks | Tekrise Academy Ibadan",
  description:
    "Compare syllabus modules, tuition installment plans, and certification thresholds across Full-Stack Engineering, Product Design, and Data Analytics at Tekrise Ibadan.",
  openGraph: {
    title: "Cohort 04 Curriculum & Tracks — Tekrise Academy Ibadan",
    description:
      "Explore 12-to-16 week intensive syllabi, physical lab hours, and 80% project certification standards at Tekrise Academy Ring Road Hub.",
    siteName: "Tekrise Academy Portal",
    locale: "en_NG",
    type: "website",
  },
};

export default function TracksPage() {
  return (
    <main className="page-container">
      <section className="hero-card">
        <span className="hero-tag type-label-sm">Curriculum &amp; Academic Standards</span>
        <h1 className="hero-title type-headline-lg">
          Cohort 04 Intensive Syllabus &amp; Track Breakdown
        </h1>
        <p className="hero-description type-body-lg">
          Every Tekrise Academy track combines physical lab sessions at our Ring Road Ibadan campus
          (with uninterrupted generator backup) and milestone-driven assessments.
        </p>
        <Link
          href="/"
          className="form-btn-submit type-label-lg"
          style={{ display: "inline-block", textDecoration: "none" }}
        >
          &larr; Return to Admissions Enquiry Portal
        </Link>
      </section>
    </main>
  );
}

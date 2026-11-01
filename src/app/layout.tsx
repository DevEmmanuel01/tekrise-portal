import type { Metadata } from "next";
import "../../task-01-design-system/tokens.css";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tekrise Academy Ibadan | Student & Cohort 04 Admissions Portal",
  description:
    "Official admissions and student standing portal for Tekrise Academy, Ring Road Campus, Ibadan. Enrol in Hybrid Software Engineering, Product Design, and Data Analytics cohorts.",
  openGraph: {
    title: "Tekrise Academy Ibadan — Cohort 04 Admissions Open",
    description:
      "Hands-on 12–16 week hybrid technology cohorts in Ibadan, Oyo State. Verify admission standing or submit a Cohort 04 track enquiry.",
    siteName: "Tekrise Academy Portal",
    locale: "en_NG",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

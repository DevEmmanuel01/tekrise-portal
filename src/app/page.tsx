"use client";

import { useState } from 'react';

interface CreatedEnquiry {
  id: string;
  fullName: string;
  email: string;
  track: string;
  createdAt: string;
}

export default function HomePage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [track, setTrack] = useState('Full-Stack Software Engineering');
  const [isLoading, setIsLoading] = useState(false);
  const [submittedRecord, setSubmittedRecord] = useState<CreatedEnquiry | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/enquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName, email, track }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit enquiry');
      }

      setSubmittedRecord(data);
      setFullName('');
      setEmail('');
      setTrack('Full-Stack Software Engineering');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Top Campus Operations Ribbon */}
      <aside className="announcement-ribbon" aria-label="Campus Notice">
        <div className="announcement-inner">
          <div className="type-label-sm">
            <span className="announcement-pill">Ibadan Campus Hub</span>
            <span> Physical Lab &amp; Generator Power Active: Mon–Fri 9:00 AM – 6:00 PM</span>
          </div>
          <div className="type-label-sm">
            <span>Admissions Desk: Ring Road Campus, Ibadan, Oyo State</span>
          </div>
        </div>
      </aside>

      {/* Main Navigation Header */}
      <header className="site-header">
        <div className="header-container">
          <div className="brand-badge">
            <div className="brand-logo-mark type-title-lg">T</div>
            <div className="brand-meta">
              <span className="brand-title type-title-md">Tekrise Academy</span>
              <span className="brand-subtitle type-label-sm">Student &amp; Admissions Portal</span>
            </div>
          </div>

          <div className="campus-status-pill">
            <span className="status-indicator-dot" aria-hidden="true" />
            <span className="status-indicator-text type-label-sm">Ibadan Hub Online</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="page-container">
        {/* Hero Section Introducing Tekrise Academy Ibadan */}
        <section className="hero-card" aria-labelledby="hero-title">
          <span className="hero-tag type-label-sm">Ibadan Tech Training Institute</span>
          <h1 id="hero-title" className="hero-title type-headline-lg">
            Tekrise Academy Student &amp; Admissions Portal
          </h1>
          <p className="hero-description type-body-lg">
            Empowering aspiring technology professionals across South-West Nigeria with intensive,
            hands-on cohorts in software engineering, product design, and data analytics.
          </p>

          <div className="hero-stats-grid">
            <div className="stat-block">
              <span className="stat-label type-label-sm">Training Format</span>
              <strong className="stat-value type-headline-sm">Hybrid Campus</strong>
              <span className="stat-caption type-body-sm">Ibadan Hub &amp; Live Virtual</span>
            </div>
            <div className="stat-block">
              <span className="stat-label type-label-sm">Cohort Duration</span>
              <strong className="stat-value type-headline-sm">12 – 16 Weeks</strong>
              <span className="stat-caption type-body-sm">Intensive Milestone-Driven</span>
            </div>
            <div className="stat-block">
              <span className="stat-label type-label-sm">Certification Rule</span>
              <strong className="stat-value type-headline-sm">80% Threshold</strong>
              <span className="stat-caption type-body-sm">Mandatory Attendance &amp; Projects</span>
            </div>
          </div>
        </section>

        {/* Core Training Tracks */}
        <section aria-labelledby="tracks-heading" style={{ marginBottom: '2.5rem' }}>
          <h2 id="tracks-heading" className="type-headline-md" style={{ marginBottom: '1.25rem' }}>
            Academic Cohort Programs
          </h2>

          <div className="features-grid">
            <article className="feature-card">
              <div>
                <span className="feature-badge tech type-label-sm">Software Engineering</span>
                <h3 className="feature-card-title type-title-md">Full-Stack Development</h3>
                <p className="feature-card-desc type-body-sm">
                  Modern frontend frameworks, robust Node.js backend services, relational database
                  architecture, and enterprise deployment workflows.
                </p>
              </div>
              <div className="feature-card-meta type-label-sm">
                <span>16-Week Intensive • Cohort 04</span>
              </div>
            </article>

            <article className="feature-card">
              <div>
                <span className="feature-badge design type-label-sm">Product &amp; Systems</span>
                <h3 className="feature-card-title type-title-md">Product Design (UI/UX)</h3>
                <p className="feature-card-desc type-body-sm">
                  Design token architecture, design systems engineering, user research, wireframing,
                  and production Figma handoff protocols.
                </p>
              </div>
              <div className="feature-card-meta type-label-sm">
                <span>12-Week Intensive • Cohort 04</span>
              </div>
            </article>

            <article className="feature-card">
              <div>
                <span className="feature-badge data type-label-sm">Intelligence</span>
                <h3 className="feature-card-title type-title-md">Data Analytics &amp; Insights</h3>
                <p className="feature-card-desc type-body-sm">
                  Exploratory data analysis, SQL database reporting, Python modeling, and business
                  intelligence dashboards for high-growth operations.
                </p>
              </div>
              <div className="feature-card-meta type-label-sm">
                <span>12-Week Intensive • Cohort 04</span>
              </div>
            </article>
          </div>
        </section>

        {/* Cohort 04 Admission Enquiry Form Section */}
        <section className="enquiry-card" aria-labelledby="enquiry-form-title">
          <div className="enquiry-header">
            <span className="hero-tag type-label-sm">Admissions Open</span>
            <h2 id="enquiry-form-title" className="enquiry-title type-headline-md">
              Cohort 04 Admission Enquiry
            </h2>
            <p className="enquiry-description type-body-md">
              Submit your interest for Cohort 04 hybrid physical &amp; virtual tracks at the Ibadan campus.
              Our admissions coordinator will verify your application and reach out with syllabus details.
            </p>
          </div>

          {submittedRecord ? (
            <div className="form-alert-success" role="status" aria-live="polite">
              <strong className="type-title-md">Enquiry Submitted Successfully!</strong>
              <p className="type-body-md">
                Thank you, <strong>{submittedRecord.fullName}</strong>. Your enquiry for the{' '}
                <strong>{submittedRecord.track}</strong> track has been registered with reference ID{' '}
                <code className="tabular-nums">#{submittedRecord.id}</code>.
              </p>
              <p className="type-body-sm">
                Our admissions desk will contact you at <strong>{submittedRecord.email}</strong> regarding
                orientation dates and lab seating.
              </p>
              <button
                type="button"
                onClick={() => setSubmittedRecord(null)}
                className="form-btn-submit type-label-md"
                style={{ marginTop: '0.75rem' }}
              >
                Submit Another Enquiry
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="enquiry-form">
              {errorMessage && (
                <div className="form-alert-error" role="alert">
                  <span className="type-body-sm">{errorMessage}</span>
                </div>
              )}

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label type-label-md">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Oluwaseun Adeleke"
                    className="form-input type-body-md"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label type-label-md">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. o.adeleke@example.com"
                    className="form-input type-body-md"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="track" className="form-label type-label-md">
                  Preferred Cohort Track
                </label>
                <select
                  id="track"
                  value={track}
                  onChange={(e) => setTrack(e.target.value)}
                  className="form-select type-body-md"
                >
                  <option value="Full-Stack Software Engineering">
                    Full-Stack Software Engineering (16 Weeks)
                  </option>
                  <option value="Product Design (UI/UX)">Product Design (UI/UX) (12 Weeks)</option>
                  <option value="Data Analytics & Insights">
                    Data Analytics &amp; Insights (12 Weeks)
                  </option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="form-btn-submit type-label-lg"
              >
                {isLoading ? 'Submitting Enquiry...' : 'Submit Admission Enquiry'}
              </button>
            </form>
          )}
        </section>

        {/* Registrar Notice Callout */}
        <section className="notice-callout" aria-labelledby="registrar-notice-title">
          <div className="notice-icon-box type-title-lg" aria-hidden="true">
            ℹ
          </div>
          <div>
            <h3 id="registrar-notice-title" className="notice-heading type-title-sm">
              Admissions &amp; Matriculation Verification Notice
            </h3>
            <p className="notice-body-copy type-body-sm">
              Newly admitted students who have completed their initial tuition deposit can claim their
              pre-assigned 5-digit Matriculation PIN at the Ibadan admissions desk or verify their
              standing through the incoming verification module. Physical lab power, dedicated
              generator backup, and mentor office hours run daily according to published cohort
              schedules.
            </p>
          </div>
        </section>
      </main>

      {/* Institutional Footer */}
      <footer className="site-footer">
        <div className="footer-content">
          <span className="footer-meta type-body-sm">
            &copy; 2026 Tekrise Academy. Ring Road Campus, Ibadan, Oyo State, Nigeria.
          </span>
          <span className="footer-meta type-body-sm">
            Academic Registrar &amp; Campus Operations
          </span>
        </div>
      </footer>
    </>
  );
}

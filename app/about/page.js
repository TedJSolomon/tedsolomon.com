import Nav from '../components/Nav';
import Footer from '../components/Footer';

export const metadata = {
  title: 'About — Ted Solomon',
  description:
    'About Ted Solomon — Product Manager at Beck Technology. From heavy civil construction to implementation to product.',
};

export default function About() {
  return (
    <>
      <Nav />

      <div className="page-hero">
        <div className="page-hero-tag">About Me</div>
        <h1>The longer story.</h1>
        <p>Product manager. Former estimator. Still learning.</p>
      </div>

      <div className="divider"><hr /></div>

      <section className="about-bio">
        <div className="about-bio-left">
          <div className="section-label">Background</div>
          <div className="photo-placeholder">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
            </svg>
            <span className="photo-placeholder-label">
              Photo
              <br />
              coming soon
            </span>
          </div>
        </div>
        <div className="about-bio-content">
          <p>
            Product Manager at Beck Technology, building the next generation of preconstruction
            estimating software.
          </p>
          <p>
            Before product, I spent three and a half years on Beck&apos;s implementation team working
            directly with contractors and estimators across the country. Before that, five years in
            heavy civil construction as an estimator and project engineer.
          </p>
          <p>
            My construction background gives me a real understanding of what estimators need from
            their tools — I bring that perspective into every product decision.
          </p>
        </div>
      </section>

      <div className="divider"><hr /></div>

      <section className="timeline">
        <div className="section-label">Experience</div>
        <div className="timeline-entries">

          <div className="timeline-entry">
            <div className="timeline-period">Feb 2026 – Present</div>
            <div className="timeline-role">Product Manager</div>
            <div className="timeline-company">Beck Technology</div>
            <p className="timeline-desc">
              Own product strategy and roadmap for DESTINI Estimator, preconstruction software used
              by general contractors nationwide. Partner with engineering, design, and
              customer-facing teams to define requirements and ship features based on real user
              needs. Leverage five years of field experience in construction to bridge the gap
              between what users need and what gets built.
            </p>
          </div>

          <div className="timeline-entry">
            <div className="timeline-period">2022 – 2026</div>
            <div className="timeline-role">Implementation Manager</div>
            <div className="timeline-company">Beck Technology</div>
            <p className="timeline-desc">
              Led software implementation and onboarding for contractors across the country,
              managing rollouts across multi-office organizations. Worked directly with estimators
              and project teams to configure workflows, troubleshoot issues, and drive adoption.
            </p>
          </div>

          <div className="timeline-entry">
            <div className="timeline-period"></div>
            <div className="timeline-role">Project Engineer</div>
            <div className="timeline-company">Posillico Civil Inc.</div>
            <p className="timeline-desc">
              Supported project operations on heavy civil construction projects.
            </p>
          </div>

          <div className="timeline-entry">
            <div className="timeline-period"></div>
            <div className="timeline-role">Estimator</div>
            <div className="timeline-company">Posillico Civil Inc.</div>
            <p className="timeline-desc">Priced and bid heavy civil construction projects.</p>
          </div>

          <div className="timeline-entry">
            <div className="timeline-period"></div>
            <div className="timeline-role">Jr. Estimator</div>
            <div className="timeline-company">Posillico Civil Inc.</div>
            <p className="timeline-desc">
              Supported senior estimators with takeoffs, subcontractor outreach, and bid
              preparation.
            </p>
          </div>

        </div>
      </section>

      <Footer />
    </>
  );
}

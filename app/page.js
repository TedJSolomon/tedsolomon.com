import Link from 'next/link';
import Nav from './components/Nav';
import Footer from './components/Footer';

export const metadata = {
  title: 'Ted Solomon — Product Manager, Builder',
  description:
    'Ted Solomon — Product Manager at Beck Technology. Former construction estimator turned PM. I ship software people actually want to use.',
};

export default function Home() {
  return (
    <>
      <Nav />

      <section className="hero">
        <div className="hero-tag">Product Manager &amp; Builder</div>
        <h1>Ted Solomon</h1>
        <p className="hero-subtitle">
          Product Manager who builds things — at work, on the side, and from scratch.
        </p>
        <p className="hero-description">
          Currently at Beck Technology. Former estimator and project engineer turned PM. I bring
          real-world domain expertise into product development and ship software people actually want
          to use.
        </p>
        <div className="hero-cta">
          <Link href="/projects" className="btn-primary">
            View Projects
          </Link>
          <Link href="/contact" className="btn-secondary">
            Get in Touch
          </Link>
        </div>
        <div className="hero-social">
          <a
            href="https://linkedin.com/in/ted-j-solomon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
          </a>
          <a
            href="https://x.com/tedjsolomon"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Twitter / X"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.259 5.631 5.905-5.631zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <a
            href="https://www.instagram.com/tedsolomon/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.98 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" />
            </svg>
          </a>
          <a href="mailto:tedjsolomon@gmail.com" aria-label="Email">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </a>
        </div>

        {/* Decorative technical graphic */}
        <div className="hero-graphic" aria-hidden="true">
          <svg viewBox="0 0 480 480" xmlns="http://www.w3.org/2000/svg" fill="none">
            <rect x="24" y="24" width="432" height="432" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <path d="M24 84 L24 24 L84 24" stroke="rgba(232,168,56,0.55)" strokeWidth="1.5" />
            <path d="M396 24 L456 24 L456 84" stroke="rgba(232,168,56,0.55)" strokeWidth="1.5" />
            <path d="M24 396 L24 456 L84 456" stroke="rgba(232,168,56,0.55)" strokeWidth="1.5" />
            <path d="M396 456 L456 456 L456 396" stroke="rgba(232,168,56,0.55)" strokeWidth="1.5" />
            <line x1="24" y1="160" x2="456" y2="160" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
            <line x1="24" y1="240" x2="456" y2="240" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="24" y1="320" x2="456" y2="320" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
            <line x1="160" y1="24" x2="160" y2="456" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
            <line x1="240" y1="24" x2="240" y2="456" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
            <line x1="320" y1="24" x2="320" y2="456" stroke="rgba(255,255,255,0.035)" strokeWidth="1" />
            <rect x="96" y="96" width="288" height="288" stroke="rgba(232,168,56,0.1)" strokeWidth="1" />
            <circle cx="240" cy="240" r="52" stroke="rgba(232,168,56,0.18)" strokeWidth="1" />
            <circle cx="240" cy="240" r="18" stroke="rgba(232,168,56,0.3)" strokeWidth="1" fill="rgba(232,168,56,0.04)" />
            <circle cx="240" cy="240" r="4" fill="rgba(232,168,56,0.7)" />
            <line x1="178" y1="240" x2="218" y2="240" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <line x1="262" y1="240" x2="302" y2="240" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <line x1="240" y1="178" x2="240" y2="218" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <line x1="240" y1="262" x2="240" y2="302" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <circle cx="96" cy="96" r="3" fill="rgba(232,168,56,0.5)" />
            <circle cx="384" cy="96" r="3" fill="rgba(232,168,56,0.5)" />
            <circle cx="96" cy="384" r="3" fill="rgba(232,168,56,0.5)" />
            <circle cx="384" cy="384" r="3" fill="rgba(232,168,56,0.5)" />
            <line x1="160" y1="24" x2="160" y2="15" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <line x1="240" y1="24" x2="240" y2="12" stroke="rgba(232,168,56,0.35)" strokeWidth="1.5" />
            <line x1="320" y1="24" x2="320" y2="15" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <line x1="456" y1="160" x2="465" y2="160" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <line x1="456" y1="240" x2="468" y2="240" stroke="rgba(232,168,56,0.35)" strokeWidth="1.5" />
            <line x1="456" y1="320" x2="465" y2="320" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <line x1="160" y1="456" x2="160" y2="465" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <line x1="240" y1="456" x2="240" y2="468" stroke="rgba(232,168,56,0.35)" strokeWidth="1.5" />
            <line x1="320" y1="456" x2="320" y2="465" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <line x1="24" y1="160" x2="15" y2="160" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
            <line x1="24" y1="240" x2="12" y2="240" stroke="rgba(232,168,56,0.35)" strokeWidth="1.5" />
            <line x1="24" y1="320" x2="15" y2="320" stroke="rgba(232,168,56,0.35)" strokeWidth="1" />
          </svg>
        </div>
      </section>

      <div className="divider"><hr /></div>

      <section className="bio" id="about">
        <div className="bio-label">About</div>
        <div className="bio-content">
          <p>
            I started my career in heavy civil construction — five years as an estimator and project
            engineer before making the jump to tech. I spent three and a half years in implementation
            working directly with users, then earned my way into product management.
          </p>
          <p>
            That path gave me something I carry into every product role: I know how to talk to users,
            understand their problems deeply, and translate that into software that actually solves
            them. The industry may change — the approach doesn&apos;t.
          </p>
          <div className="bio-stats">
            <div className="stat">
              <div className="stat-number">8+</div>
              <div className="stat-label">
                Years in Industry
                <br />
                &amp; Enterprise Software
              </div>
            </div>
            <div className="stat">
              <div className="stat-number">2</div>
              <div className="stat-label">
                Products Shipped
                <br />
                Outside of Work
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="divider"><hr /></div>

      <section className="projects" id="projects">
        <div className="section-header">
          <div className="section-label">Projects</div>
          <h2 className="section-title">Things I&apos;ve Built</h2>
        </div>
        <div className="project-grid">
          <Link href="/projects" className="project-card">
            <div className="project-type">Newsletter</div>
            <div className="project-name">Vision Quest</div>
            <p className="project-desc">
              A weekly tech newsletter that breaks down AI, hardware, and emerging tech for people
              who want to stay informed without the jargon. I co-founded it and handle the product
              side — reader analytics, content strategy, growth.
            </p>
            <div className="project-tags">
              <span className="tag">Beehiiv</span>
              <span className="tag">Product Strategy</span>
              <span className="tag">Growth</span>
            </div>
          </Link>
          <Link href="/projects" className="project-card">
            <div className="project-type">Mobile App</div>
            <div className="project-name">Catalyft</div>
            <p className="project-desc">
              A mobile workout tracking app built for weightlifting. Designed to make logging sets,
              tracking progress, and planning workouts simple and fast. Built from the ground up as a
              side project — currently heading to the App Store.
            </p>
            <div className="project-tags">
              <span className="tag">iOS</span>
              <span className="tag">Mobile App</span>
              <span className="tag">Product Design</span>
              <span className="tag">Fitness</span>
            </div>
          </Link>
        </div>
      </section>

      <div className="divider"><hr /></div>

      <section className="footer-section" id="contact">
        <div className="section-label">Connect</div>
        <div className="footer-content">
          <h2>Let&apos;s talk.</h2>
          <p>
            Interested in product management, building something cool, or just want to connect —
            I&apos;m always up for a conversation.
          </p>
          <div className="social-links">
            <a href="https://linkedin.com/in/ted-j-solomon" target="_blank" rel="noopener noreferrer">
              LinkedIn
            </a>
            <a href="https://x.com/tedjsolomon" target="_blank" rel="noopener noreferrer">
              Twitter / X
            </a>
            <a href="https://www.instagram.com/tedsolomon/" target="_blank" rel="noopener noreferrer">
              Instagram
            </a>
            <a href="mailto:tedjsolomon@gmail.com">Email</a>
          </div>
        </div>
      </section>

      <Footer />
    </>
  );
}

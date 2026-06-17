import ImportClient from './ImportClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Import Jobs — Dashboard' };

export default function ImportPage() {
  return (
    <div style={{ padding: '3rem', position: 'relative', zIndex: 1 }}>

      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: '#e8a838',
          marginBottom: '1rem',
        }}>
          <span style={{ opacity: 0.5, marginRight: '0.5rem' }}>//</span>
          Transcription / Import
        </div>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
          fontWeight: 400,
          color: '#f5f3ef',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          margin: 0,
        }}>
          Import Historical Jobs
        </h1>
        <p style={{ fontSize: '1rem', color: '#7a7870', lineHeight: 1.6, marginTop: '0.5rem' }}>
          Upload a CSV, validate totals, and bulk-insert into the job log.
        </p>
      </div>

      <ImportClient />

    </div>
  );
}

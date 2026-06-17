import { getAllJobs } from '../../lib/transcription';
import TranscriptionKPIs from './TranscriptionKPIs';
import TranscriptionCharts from './TranscriptionCharts';
import TranscriptionClient from './TranscriptionClient';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Transcription — Dashboard' };

export default async function TranscriptionPage() {
  const jobs = await getAllJobs();

  return (
    <div style={{ padding: '3rem', position: 'relative', zIndex: 1 }}>

      <div style={{ marginBottom: '3rem' }}>
        <div style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.2em',
          color: '#e8a838',
          marginBottom: '1rem',
        }}>
          <span style={{ opacity: 0.5, marginRight: '0.5rem' }}>//</span>
          Transcription
        </div>
        <h1 style={{
          fontFamily: "'DM Serif Display', serif",
          fontSize: 'clamp(1.8rem, 3vw, 2.5rem)',
          fontWeight: 400,
          color: '#f5f3ef',
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          marginBottom: '0.5rem',
          margin: 0,
        }}>
          Court Reporting
        </h1>
        <p style={{
          fontSize: '1rem',
          color: '#7a7870',
          lineHeight: 1.6,
          marginTop: '0.5rem',
        }}>
          Track daily jobs, pages, and take-home pay.
        </p>
      </div>

      <TranscriptionKPIs jobs={jobs} />
      <TranscriptionCharts jobs={jobs} />
      <TranscriptionClient jobs={jobs} />

    </div>
  );
}

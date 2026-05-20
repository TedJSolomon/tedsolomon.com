'use client';

import { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import MeetingSetup from './MeetingSetup';
import LiveTicker from './LiveTicker';
import MeetingRecap from './MeetingRecap';
import { BOARDROOM, ROAST } from './lib/copy';
import './meeting-calculator.css';

function useTone() {
  const [tone, setToneState] = useState(() => {
    if (typeof window === 'undefined') return BOARDROOM;
    return localStorage.getItem('mcc-tone') ?? BOARDROOM;
  });

  function setTone(next) {
    setToneState(next);
    localStorage.setItem('mcc-tone', next);
  }

  return [tone, setTone];
}

export default function MeetingCostCalculator() {
  const [step, setStep] = useState('setup');
  const [attendees, setAttendees] = useState([]);
  const [duration, setDuration] = useState(30);
  const [meetingType, setMeetingType] = useState('one_time');
  const [title, setTitle] = useState('');
  const [result, setResult] = useState(null);
  const [tone, setTone] = useTone();

  function handleStart() { setStep('live'); }
  function handleEnd(endResult) { setResult(endResult); setStep('recap'); }
  function handleReset() { setStep('setup'); setResult(null); }

  return (
    <>
      <Nav />
      <div className="mcc-page">
        <div className="mcc-hero">
          <div className="mcc-hero-eyebrow">
            <div className="mcc-hero-tag">Meeting Cost Calculator</div>
            <div className="mcc-tone-toggle">
              <button
                className={`mcc-tone-btn${tone === BOARDROOM ? ' mcc-tone-btn--active' : ''}`}
                onClick={() => setTone(BOARDROOM)}
              >
                Boardroom
              </button>
              <button
                className={`mcc-tone-btn${tone === ROAST ? ' mcc-tone-btn--active' : ''}`}
                onClick={() => setTone(ROAST)}
              >
                Roast 🔥
              </button>
            </div>
          </div>
          <h1 className="mcc-hero-title">See what your meetings really cost.</h1>
          <p className="mcc-hero-sub">
            Pick your attendees, hit start, and watch the dollar amount tick up in real time.
          </p>
        </div>

        <div className="mcc-container">
          {step === 'setup' && (
            <MeetingSetup
              attendees={attendees}
              setAttendees={setAttendees}
              duration={duration}
              setDuration={setDuration}
              meetingType={meetingType}
              setMeetingType={setMeetingType}
              title={title}
              setTitle={setTitle}
              tone={tone}
              onStart={handleStart}
            />
          )}
          {step === 'live' && (
            <LiveTicker
              attendees={attendees}
              scheduledMinutes={duration}
              meetingType={meetingType}
              tone={tone}
              onEnd={handleEnd}
            />
          )}
          {step === 'recap' && result && (
            <MeetingRecap
              attendees={attendees}
              result={result}
              meetingType={meetingType}
              duration={duration}
              title={title}
              tone={tone}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

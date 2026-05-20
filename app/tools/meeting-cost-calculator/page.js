'use client';

import { useState } from 'react';
import Nav from '../../components/Nav';
import Footer from '../../components/Footer';
import MeetingSetup from './MeetingSetup';
import LiveTicker from './LiveTicker';
import MeetingRecap from './MeetingRecap';
import './meeting-calculator.css';

export default function MeetingCostCalculator() {
  const [step, setStep] = useState('setup'); // 'setup' | 'live' | 'recap'
  const [attendees, setAttendees] = useState([]);
  const [duration, setDuration] = useState(30);
  const [meetingType, setMeetingType] = useState('one_time');
  const [result, setResult] = useState(null);

  function handleStart() {
    setStep('live');
  }

  function handleEnd(endResult) {
    setResult(endResult);
    setStep('recap');
  }

  function handleReset() {
    setStep('setup');
    setResult(null);
  }

  return (
    <>
      <Nav />
      <div className="mcc-page">
        <div className="mcc-hero">
          <div className="mcc-hero-tag">Meeting Cost Calculator</div>
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
              onStart={handleStart}
            />
          )}
          {step === 'live' && (
            <LiveTicker
              attendees={attendees}
              scheduledMinutes={duration}
              meetingType={meetingType}
              onEnd={handleEnd}
            />
          )}
          {step === 'recap' && result && (
            <MeetingRecap
              attendees={attendees}
              result={result}
              meetingType={meetingType}
              onReset={handleReset}
            />
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

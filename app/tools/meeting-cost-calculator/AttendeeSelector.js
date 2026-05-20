'use client';

import { useState } from 'react';
import demoAttendees, { DEPARTMENTS } from './lib/demoAttendees';
import { formatCurrency } from './lib/cost';

export default function AttendeeSelector({ selected, onChange }) {
  const [dept, setDept] = useState('All');
  const [search, setSearch] = useState('');
  const [customName, setCustomName] = useState('');
  const [customSalary, setCustomSalary] = useState('');
  const [nextCustomId, setNextCustomId] = useState(1000);

  const filtered = demoAttendees.filter((a) => {
    const matchesDept = dept === 'All' || a.dept === dept;
    const matchesSearch =
      !search ||
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.title.toLowerCase().includes(search.toLowerCase());
    return matchesDept && matchesSearch;
  });

  function toggle(attendee) {
    const isSelected = selected.some((s) => s.id === attendee.id);
    onChange(
      isSelected ? selected.filter((s) => s.id !== attendee.id) : [...selected, attendee]
    );
  }

  function addCustom() {
    const salary = parseInt(customSalary.replace(/[^0-9]/g, ''), 10);
    if (!customName.trim() || !salary) return;
    const custom = { id: nextCustomId, name: customName.trim(), title: 'Custom', dept: 'Custom', annual_salary: salary };
    setNextCustomId((n) => n + 1);
    onChange([...selected, custom]);
    setCustomName('');
    setCustomSalary('');
  }

  return (
    <div className="mcc-attendee-selector">
      {selected.length > 0 && (
        <div className="mcc-chips">
          {selected.map((a) => (
            <button
              key={a.id}
              className="mcc-chip"
              onClick={() => toggle(a)}
              title="Remove"
            >
              {a.name} <span className="mcc-chip-x">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="mcc-selector-controls">
        <input
          className="mcc-input"
          type="text"
          placeholder="Search name or title…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="mcc-select"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          {DEPARTMENTS.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </div>

      <div className="mcc-employee-grid">
        {filtered.map((a) => {
          const isSelected = selected.some((s) => s.id === a.id);
          return (
            <button
              key={a.id}
              className={`mcc-employee-card${isSelected ? ' mcc-employee-card--selected' : ''}`}
              onClick={() => toggle(a)}
            >
              <div className="mcc-emp-name">{a.name}</div>
              <div className="mcc-emp-title">{a.title}</div>
              <div className="mcc-emp-dept">{a.dept}</div>
              <div className="mcc-emp-salary">{formatCurrency(a.annual_salary)}/yr</div>
            </button>
          );
        })}
      </div>

      <div className="mcc-custom-row">
        <span className="mcc-custom-label">Add custom</span>
        <input
          className="mcc-input mcc-input--sm"
          type="text"
          placeholder="Name"
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
        />
        <input
          className="mcc-input mcc-input--sm"
          type="text"
          placeholder="Annual salary (e.g. 120000)"
          value={customSalary}
          onChange={(e) => setCustomSalary(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addCustom()}
        />
        <button className="btn-secondary mcc-btn-sm" onClick={addCustom}>Add</button>
      </div>
    </div>
  );
}

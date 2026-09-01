'use client';
import { useState, useEffect } from 'react';

export default function Clock({ dark = true }: { dark?: boolean }) {
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit', hour12: true,
        timeZone: 'America/Chicago',
      }));
      setDate(now.toLocaleDateString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
        timeZone: 'America/Chicago',
      }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <div style={{ fontSize: '3.5rem', fontWeight: 200, color: dark ? 'white' : '#111827', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {time}
      </div>
      <div style={{ fontSize: '1rem', color: dark ? '#8ba5c5' : '#6b7280', marginTop: '0.4rem' }}>
        {date}
      </div>
    </div>
  );
}

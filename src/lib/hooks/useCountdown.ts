"use client";

import { useState, useEffect } from "react";

interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function useCountdown(targetDate: Date): CountdownResult {
  const [timeLeft, setTimeLeft] = useState<CountdownResult>(() =>
    calculate(targetDate)
  );

  useEffect(() => {
    const tick = () => setTimeLeft(calculate(targetDate));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  return timeLeft;
}

function calculate(target: Date): CountdownResult {
  const diff = target.getTime() - Date.now();
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
    isExpired: false,
  };
}

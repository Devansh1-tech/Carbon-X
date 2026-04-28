import { useState, useEffect, useRef } from "react";

export default function LiveCounter({
  targetNumber = 0,
  label = "",
  prefix = "",
  suffix = "",
  duration = 1800,
  className = "",
}) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const steps = Math.ceil(duration / 16);
          let step = 0;
          const timer = setInterval(() => {
            step++;
            const progress = step / steps;
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * targetNumber));
            if (step >= steps) {
              setCount(targetNumber);
              clearInterval(timer);
            }
          }, 16);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [targetNumber, duration]);

  return (
    <div ref={ref} className={className}>
      <span className="tabular-nums">
        {prefix}{count.toLocaleString()}{suffix}
      </span>
      {label && <span className="block text-sm text-gray-500 mt-0.5">{label}</span>}
    </div>
  );
}

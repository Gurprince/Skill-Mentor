import React from "react";
import { motion } from "framer-motion";

/**
 * JourneyPath
 * - Animated SVG path (draws itself)
 * - Checkpoints placed along the path (positions in %)
 * - Uses framer-motion viewport triggers for in-view animations
 *
 * Props:
 *  - steps: array of { id, title, subtitle, icon (JSX), position: 0..1 (0%..100%) }
 *
 * Example usage: <JourneyPath steps={STEPS} />
 */

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const pointVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 350, damping: 24 } },
};

export default function JourneyPath({ steps = [] }) {
  // SVG path (desktop horizontal zig-zag). We'll adapt by CSS for mobile.
  // The path coordinates are tuned for a 1000x300 viewbox; we'll scale responsively.
  const pathD =
    "M 40 260 C 200 260, 260 40, 420 40 S 740 40, 900 260"; // smooth S-curve

  return (
    <section className="relative py-20 px-4 md:px-12 max-w-7xl mx-auto">
      <h2 className="text-center text-3xl md:text-4xl font-extrabold mb-8">
        From Dream to Destination — <span className="text-[#8C49E9]">Your Career Map</span>
      </h2>

      <div className="relative">
        {/* svg container */}
        <div className="hidden md:block">
          <svg viewBox="0 0 940 300" className="w-full h-[300px]">
            {/* background subtle path */}
            <path
              d={pathD}
              fill="none"
              stroke="rgba(200,200,230,0.12)"
              strokeWidth="6"
              strokeLinecap="round"
            />

            {/* animated glowing path */}
            <motion.path
              d={pathD}
              fill="none"
              stroke="url(#grad)"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
              strokeDasharray="1 0"
            >
            </motion.path>

            <defs>
              <linearGradient id="grad" x1="0%" x2="100%">
                <stop offset="0%" stopColor="#8C49E9" />
                <stop offset="50%" stopColor="#4CC9F0" />
                <stop offset="100%" stopColor="#38E1B3" />
              </linearGradient>
              <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="6" result="coloredBlur" />
                <feMerge>
                  <feMergeNode in="coloredBlur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>
          </svg>

          {/* absolute checkpoints positioned relative to svg viewBox */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute inset-0"
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, amount: 0.2 }}
              variants={containerVariants}
            >
              {steps.map((step, i) => {
                // Map step.position (0..1) to a point along the path. 
                // For simplicity we have approximate x,y for positions (tweaked for the chosen path).
                // You can replace these with exact path sampling if you want exact placement.
                const t = Math.min(Math.max(step.position ?? i / (steps.length - 1 || 1), 0), 1);
                // We map t to viewBox coordinates for our 940x300 area
                const x = 40 + t * (900 - 40);
                // y mapping: follow curve roughly: low at ends, high at center
                const y = 260 - Math.sin(Math.PI * t) * 220 * 0.6; // tuned
                const left = `${x / 940 * 100}%`;
                const top = `${y / 300 * 100}%`;

                return (
                  <motion.div
                    key={step.id || i}
                    className="absolute pointer-events-auto"
                    style={{ left, top, transform: "translate(-50%, -50%)" }}
                    variants={pointVariants}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg"
                        style={{
                          background: "linear-gradient(135deg,#8C49E9,#4CC9F0)",
                          boxShadow: "0 8px 28px rgba(76,201,240,0.12)",
                        }}
                      >
                        {/* allow passing an icon; fallback to a dot */}
                        {step.icon ? (
                          <div className="w-7 h-7 text-white">{step.icon}</div>
                        ) : (
                          <div className="w-3 h-3 rounded-full bg-white/90" />
                        )}
                      </div>

                      <div className="hidden md:block max-w-xs bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow">
                        <h4 className="text-sm font-semibold text-gray-900">{step.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{step.subtitle}</p>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Mobile / vertical layout */}
        <div className="md:hidden flex flex-col items-start gap-6">
          <div className="w-full h-0.5 bg-gray-200/40 rounded-full mb-4" />
          {steps.map((s, i) => (
            <motion.div
              key={s.id || i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="w-full flex items-start gap-4"
            >
              <div className="flex flex-col items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{
                    background:
                      "linear-gradient(135deg,#8C49E9,#4CC9F0)",
                  }}
                >
                  {s.icon || <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
                {i !== steps.length - 1 && <div className="w-px h-8 bg-gray-200/30 mt-2" />}
              </div>

              <div className="flex-1">
                <h4 className="text-base font-semibold text-gray-900">{s.title}</h4>
                <p className="text-sm text-gray-600 mt-1">{s.subtitle}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';

const LegalPage = ({ title, lastUpdated, intro, children }) => (
  <div className="min-h-screen py-16 sm:py-20 relative overflow-hidden">
    <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

    <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
      <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2">{title}</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: {lastUpdated}</p>

      {intro && <p className="text-gray-400 leading-relaxed text-[15px] mb-10">{intro}</p>}

      <div className="space-y-9 text-gray-400 leading-relaxed text-[15px]">{children}</div>
    </div>
  </div>
);

export const LegalSection = ({ heading, children }) => (
  <section>
    <h2 className="text-lg font-bold text-white mb-3">{heading}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

export const LegalList = ({ items }) => (
  <ul className="space-y-2 pl-4">
    {items.map((item, i) => (
      <li key={i} className="relative pl-3 before:content-[''] before:absolute before:left-0 before:top-[0.6em] before:w-1.5 before:h-1.5 before:rounded-full before:bg-primary/60">
        {item}
      </li>
    ))}
  </ul>
);

export default LegalPage;

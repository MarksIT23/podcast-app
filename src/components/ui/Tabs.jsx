import { useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Tabs component with animated underline indicator.
 * Props: tabs [{id, label, content}], defaultTab, onChange, className
 */
export default function Tabs({ tabs = [], defaultTab, onChange, className = '' }) {
  const [active, setActive] = useState(defaultTab || tabs[0]?.id);

  const handleChange = (id) => {
    setActive(id);
    onChange?.(id);
  };

  return (
    <div className={className}>
      {/* Tab bar */}
      <div className="flex border-b border-[var(--color-border)] mb-6" role="tablist" aria-label="Content tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => handleChange(tab.id)}
            className={`relative px-4 py-3 text-small font-medium transition-colors duration-200 ${
              active === tab.id
                ? 'text-[var(--color-accent-purple-light)]'
                : 'text-[var(--text-tertiary)] hover:text-[var(--text-secondary)]'
            }`}
          >
            {tab.label}
            {active === tab.id && (
              <motion.div
                layoutId="tab-indicator"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--color-accent-purple)] rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      {tabs.map((tab) => (
        <div
          key={tab.id}
          id={`tabpanel-${tab.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${tab.id}`}
          hidden={active !== tab.id}
        >
          {active === tab.id && tab.content}
        </div>
      ))}
    </div>
  );
}

import { ArrowUp, ArrowDown } from 'lucide-react';

/**
 * StatCard — metric display with icon, value, and trend.
 * Props: label, value, change, trend ('up'|'down'), icon (component), color, className
 */
export default function StatCard({ label, value, change, trend, icon: Icon, color = 'var(--color-accent-purple)', className = '' }) {
  const isUp = trend === 'up';
  const trendColor = isUp ? 'var(--color-success)' : 'var(--color-danger)';

  return (
    <div className={`bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-xl)] p-5 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-small text-[var(--text-tertiary)]">{label}</span>
        {Icon && (
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }} aria-hidden="true">
            <Icon size={16} style={{ color }} aria-hidden="true" />
          </div>
        )}
      </div>
      <p className="text-display font-bold mb-1">{value}</p>
      {change && (
        <div className="flex items-center gap-1 text-caption" style={{ color: trendColor }}>
          {isUp ? <ArrowUp size={12} aria-hidden="true" /> : <ArrowDown size={12} aria-hidden="true" />}
          {change}
        </div>
      )}
    </div>
  );
}

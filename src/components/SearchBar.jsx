import { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Search, X, Sparkles, TrendingUp, Mic, Clock, ArrowRight } from 'lucide-react';

const mockResults = [
  { id: '1', title: 'AI Revolution in Tech', host: 'Sarah Chen', category: 'Technology', match: '95%', emoji: '🤖' },
  { id: '2', title: 'Quantum Computing Today', host: 'Dr. James Wilson', category: 'Science', match: '92%', emoji: '⚛️' },
  { id: '3', title: 'Startup Funding Guide', host: 'Maria Rodriguez', category: 'Business', match: '88%', emoji: '💼' },
  { id: '4', title: 'Creative AI Tools', host: 'Alex Thompson', category: 'Entertainment', match: '85%', emoji: '🎨' },
];

const suggestions = [
  { icon: TrendingUp, text: 'Trending: AI Podcasts', color: '#1DB954' },
  { icon: Mic, text: 'Top Hosts This Week', color: '#8B5CF6' },
  { icon: Clock, text: 'Recently Added Episodes', color: '#3B82F6' },
];

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [results, setResults] = useState([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef(null);
  const panelRef = useRef(null);
  const resultsId = 'search-results-list';

  useEffect(() => {
    if (!query.trim()) return;
    const timer = setTimeout(() => {
      setResults(
        mockResults.filter(
          (r) =>
            r.title.toLowerCase().includes(query.toLowerCase()) ||
            r.host.toLowerCase().includes(query.toLowerCase())
        )
      );
      setActiveIndex(-1);
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleKeyDown = (e) => {
    const items = query ? results : suggestions;
    if (!isOpen) return;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && items[activeIndex]) {
          setQuery(items[activeIndex].text || items[activeIndex].title);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setActiveIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  return (
    <div ref={panelRef} className="relative w-full max-w-lg">
      {/* Input */}
      <div className="relative" role="combobox" aria-expanded={isOpen} aria-haspopup="listbox" aria-controls={resultsId}>
        <Search
          size={15}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'rgba(255,255,255,0.3)' }}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search podcasts, hosts..."
          value={query}
          onChange={(e) => {
            const val = e.target.value;
            setQuery(val);
            setIsOpen(true);
            if (!val.trim()) {
              setResults([]);
              setActiveIndex(-1);
            }
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full text-sm focus:outline-none"
          style={{
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '999px',
            padding: '9px 36px 9px 36px',
            color: '#fff',
            transition: 'all 0.2s ease',
          }}
          onFocus={(e) => {
            setIsOpen(true);
            e.currentTarget.style.borderColor = 'rgba(29,185,84,0.5)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.09)';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(29,185,84,0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
            e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          aria-label="Search podcasts"
          aria-autocomplete="list"
          aria-controls={resultsId}
          aria-activedescendant={activeIndex >= 0 ? `result-${activeIndex}` : undefined}
          role="searchbox"
          autoComplete="off"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setActiveIndex(-1); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors duration-150"
            style={{ color: 'rgba(255,255,255,0.35)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.35)'; }}
            aria-label="Clear search"
          >
            <X size={14} aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="absolute top-full mt-2 left-0 right-0 overflow-hidden z-[var(--z-dropdown)]"
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '16px',
              boxShadow: '0 20px 60px rgba(0,0,0,0.7)',
            }}
            role="listbox"
            id={resultsId}
            aria-label="Search results"
          >
            {/* AI indicator when typing */}
            {query && (
              <div
                className="px-4 py-2.5 flex items-center gap-2"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', background: 'rgba(29,185,84,0.05)' }}
                role="status"
              >
                <Sparkles size={13} style={{ color: '#1DB954' }} aria-hidden="true" />
                <span style={{ color: '#1DB954', fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em' }}>
                  AI-powered search
                </span>
              </div>
            )}

            {query ? (
              <div className="py-2">
                {results.length === 0 ? (
                  <div className="px-4 py-8 text-center" role="status">
                    <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.85rem' }}>
                      No results for "{query}"
                    </p>
                  </div>
                ) : (
                  results.map((result, i) => (
                    <button
                      key={result.id}
                      id={`result-${i}`}
                      role="option"
                      aria-selected={activeIndex === i}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150"
                      style={{
                        background: activeIndex === i ? 'rgba(29,185,84,0.08)' : 'transparent',
                        color: '#fff',
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = activeIndex === i ? 'rgba(29,185,84,0.08)' : 'transparent';
                      }}
                      onClick={() => { setQuery(result.title); setIsOpen(false); }}
                    >
                      <span className="text-xl" aria-hidden="true">{result.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ fontSize: '0.875rem' }}>{result.title}</p>
                        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.72rem' }}>{result.host}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ background: 'rgba(29,185,84,0.15)', color: '#1DB954', border: '1px solid rgba(29,185,84,0.25)' }}
                        >
                          {result.match}
                        </span>
                        <ArrowRight size={13} style={{ color: 'rgba(255,255,255,0.25)' }} aria-hidden="true" />
                      </div>
                    </button>
                  ))
                )}
              </div>
            ) : (
              <div className="py-3">
                <p
                  className="px-4 mb-2"
                  style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem', letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 600 }}
                  id="search-suggestions-label"
                >
                  Suggestions
                </p>
                {suggestions.map((s, i) => {
                  const Icon = s.icon;
                  return (
                    <button
                      key={s.text}
                      id={`result-${i}`}
                      role="option"
                      aria-selected={activeIndex === i}
                      onClick={() => { setQuery(s.text); setIsOpen(true); inputRef.current?.focus(); }}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors duration-150"
                      style={{ background: activeIndex === i ? 'rgba(255,255,255,0.05)' : 'transparent' }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = activeIndex === i ? 'rgba(255,255,255,0.05)' : 'transparent';
                      }}
                    >
                      <Icon size={15} style={{ color: s.color }} aria-hidden="true" />
                      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.85rem' }}>{s.text}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Footer */}
            <div
              className="px-4 py-2.5 flex items-center gap-2"
              style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}
            >
              <Sparkles size={11} style={{ color: '#1DB954' }} aria-hidden="true" />
              <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.7rem' }}>AI-powered semantic search</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

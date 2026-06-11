/**
 * Mock data layer — simulates API responses.
 * All functions return { data, total, page, pageSize } matching what a real API would return.
 * Replace with real API calls later by swapping to api.js.
 */

const delay = (ms = 400) => new Promise((r) => setTimeout(r, ms));

/* ============================================
   Mock Data
   ============================================ */

export const MOCK_USERS = [
  { id: '1', name: 'Sarah Chen', email: 'sarah@example.com', role: 'admin', status: 'active', avatar: null, bio: 'Podcast creator and AI enthusiast. Building the future of audio.', joinedAt: '2025-01-15', lastActive: '2026-06-08', social: { twitter: '@sarahchen', github: 'sarahchen' }, preferences: { theme: 'dark', notifications: { email: true, push: true, digest: false } } },
  { id: '2', name: 'Alex Thompson', email: 'alex@example.com', role: 'user', status: 'active', avatar: null, bio: 'Avid podcast listener and tech enthusiast. 500+ episodes and counting.', joinedAt: '2026-03-20', lastActive: '2026-06-08', social: { twitter: '@alexthompson' }, preferences: { theme: 'dark', notifications: { email: true, push: false, digest: true } } },
  { id: '3', name: 'Maria Rodriguez', email: 'maria@example.com', role: 'user', status: 'active', avatar: null, bio: 'Technology enthusiast and startup advisor. Love learning on the go.', joinedAt: '2026-05-01', lastActive: '2026-06-07', social: { linkedin: 'mariarodriguez' }, preferences: { theme: 'system', notifications: { email: true, push: true, digest: true } } },
  { id: '4', name: 'Dr. James Wilson', email: 'james@example.com', role: 'moderator', status: 'active', avatar: null, bio: 'Science communicator and professor. Making complex topics accessible.', joinedAt: '2025-08-12', lastActive: '2026-06-06', social: { twitter: '@drjwilson', website: 'jameswilson.dev' }, preferences: { theme: 'dark', notifications: { email: false, push: true, digest: false } } },
  { id: '5', name: 'Emily Park', email: 'emily@example.com', role: 'user', status: 'suspended', avatar: null, bio: 'Former contributor. Account under review.', joinedAt: '2026-02-10', lastActive: '2026-05-20', social: {}, preferences: { theme: 'dark', notifications: { email: true, push: false, digest: false } } },
  { id: '6', name: 'Mike Johnson', email: 'mike@example.com', role: 'user', status: 'active', avatar: null, bio: 'Health and wellness advocate. Certified nutrition coach.', joinedAt: '2026-04-05', lastActive: '2026-06-07', social: { twitter: '@mikejohnson' }, preferences: { theme: 'dark', notifications: { email: true, push: true, digest: true } } },
  { id: '7', name: 'Lisa Wang', email: 'lisa@example.com', role: 'user', status: 'active', avatar: null, bio: 'Business strategist and VC. Always looking for the next big thing.', joinedAt: '2026-05-15', lastActive: '2026-06-08', social: { linkedin: 'lisawang' }, preferences: { theme: 'system', notifications: { email: true, push: false, digest: false } } },
  { id: '8', name: 'David Kim', email: 'david@example.com', role: 'admin', status: 'active', avatar: null, bio: 'Platform co-founder and CTO. Building the best podcast experience.', joinedAt: '2025-01-01', lastActive: '2026-06-08', social: { twitter: '@davidkim', github: 'davidkim' }, preferences: { theme: 'dark', notifications: { email: true, push: true, digest: true } } },
  { id: '9', name: 'Rachel Green', email: 'rachel@example.com', role: 'user', status: 'active', avatar: null, bio: 'Marketing professional and content creator. Podcast enthusiast.', joinedAt: '2026-04-20', lastActive: '2026-06-08', social: { twitter: '@rachelgreen' }, preferences: { theme: 'dark', notifications: { email: true, push: false, digest: true } } },
  { id: '10', name: 'Tom Baker', email: 'tom@example.com', role: 'user', status: 'active', avatar: null, bio: 'Software engineer and open source contributor.', joinedAt: '2026-05-25', lastActive: '2026-06-07', social: { github: 'tombaker' }, preferences: { theme: 'dark', notifications: { email: true, push: true, digest: false } } },
  { id: '11', name: 'Sophie Martin', email: 'sophie@example.com', role: 'moderator', status: 'active', avatar: null, bio: 'Community manager and podcast host. Keeping conversations healthy.', joinedAt: '2025-11-01', lastActive: '2026-06-08', social: { twitter: '@sophiemartin' }, preferences: { theme: 'system', notifications: { email: true, push: true, digest: true } } },
  { id: '12', name: 'Carlos Mendez', email: 'carlos@example.com', role: 'user', status: 'inactive', avatar: null, bio: 'Occasional listener. Last active 3 months ago.', joinedAt: '2026-01-10', lastActive: '2026-03-01', social: {}, preferences: { theme: 'dark', notifications: { email: false, push: false, digest: false } } },
  { id: '13', name: 'Aisha Patel', email: 'aisha@example.com', role: 'user', status: 'active', avatar: null, bio: 'Data scientist and ML engineer. Love technical deep dives.', joinedAt: '2026-06-01', lastActive: '2026-06-08', social: { twitter: '@aishapatel', github: 'aishapatel' }, preferences: { theme: 'dark', notifications: { email: true, push: true, digest: false } } },
];

export const MOCK_CATEGORIES = [
  { id: 'cat-1', name: 'Technology', slug: 'technology', description: 'Software, AI, gadgets, and digital innovation', color: '#8B3DFF', podcastCount: 6 },
  { id: 'cat-2', name: 'Science', slug: 'science', description: 'Research, discoveries, and scientific breakthroughs', color: '#00A8FF', podcastCount: 3 },
  { id: 'cat-3', name: 'Business', slug: 'business', description: 'Entrepreneurship, finance, and market insights', color: '#FF7A00', podcastCount: 3 },
  { id: 'cat-4', name: 'Entertainment', slug: 'entertainment', description: 'Pop culture, comedy, and creative conversations', color: '#F59E0B', podcastCount: 3 },
  { id: 'cat-5', name: 'Education', slug: 'education', description: 'Learning, skill-building, and academic topics', color: '#22C55E', podcastCount: 3 },
  { id: 'cat-6', name: 'Health', slug: 'health', description: 'Wellness, fitness, and mental health', color: '#EF4444', podcastCount: 2 },
];

export const MOCK_PODCASTS = [
  { id: '1', title: 'Tech Horizons', host: 'Sarah Chen', category: 'Technology', description: 'Exploring the latest trends and innovations in technology with industry experts and thought leaders.', episodes: 156, plays: 128400, status: 'published', coverImage: 'https://picsum.photos/seed/podcast1/400/400', createdAt: '2025-03-01', rating: 4.8, language: 'English' },
  { id: '2', title: 'The Science Hour', host: 'Dr. James Wilson', category: 'Science', description: 'Deep dives into scientific breakthroughs, research discoveries, and the people behind them.', episodes: 89, plays: 94700, status: 'published', coverImage: 'https://picsum.photos/seed/podcast2/400/400', createdAt: '2025-06-15', rating: 4.6, language: 'English' },
  { id: '3', title: 'Business Insights', host: 'Maria Rodriguez', category: 'Business', description: 'Market analysis, startup stories, financial strategies, and interviews with industry leaders.', episodes: 203, plays: 201300, status: 'published', coverImage: 'https://picsum.photos/seed/podcast3/400/400', createdAt: '2024-11-01', rating: 4.7, language: 'English' },
  { id: '4', title: 'Creative Minds', host: 'Alex Thompson', category: 'Entertainment', description: 'Conversations with artists, designers, musicians, and creators shaping culture.', episodes: 67, plays: 52300, status: 'published', coverImage: 'https://picsum.photos/seed/podcast4/400/400', createdAt: '2025-09-20', rating: 4.4, language: 'English' },
  { id: '5', title: 'Learn & Grow', host: 'Dr. Emily Park', category: 'Education', description: 'Lifelong learning strategies, study techniques, and educational insights for personal growth.', episodes: 112, plays: 78900, status: 'draft', coverImage: 'https://picsum.photos/seed/podcast5/400/400', createdAt: '2026-01-10', rating: 4.5, language: 'English' },
  { id: '6', title: 'Wellness Wave', host: 'Mike Johnson', category: 'Health', description: 'Mental health awareness, fitness tips, nutrition advice, and holistic wellbeing practices.', episodes: 45, plays: 34100, status: 'published', coverImage: 'https://picsum.photos/seed/podcast6/400/400', createdAt: '2026-02-14', rating: 4.3, language: 'English' },
  { id: '7', title: 'Future Frontiers', host: 'Dr. James Wilson', category: 'Science', description: 'Exploring emerging technologies, space exploration, and their impact on society.', episodes: 23, plays: 12100, status: 'draft', coverImage: 'https://picsum.photos/seed/podcast7/400/400', createdAt: '2026-04-01', rating: 4.2, language: 'English' },
  { id: '8', title: 'Market Pulse', host: 'Maria Rodriguez', category: 'Business', description: 'Daily market analysis, investment insights, and economic trends shaping the global economy.', episodes: 178, plays: 156700, status: 'published', coverImage: 'https://picsum.photos/seed/podcast8/400/400', createdAt: '2024-09-01', rating: 4.9, language: 'English' },
  { id: '9', title: 'Code & Coffee', host: 'Sarah Chen', category: 'Technology', description: 'Casual chats about software development, programming languages, and tech culture.', episodes: 34, plays: 28900, status: 'archived', coverImage: 'https://picsum.photos/seed/podcast9/400/400', createdAt: '2025-05-01', rating: 4.1, language: 'English' },
  { id: '10', title: 'The Daily Digest', host: 'Alex Thompson', category: 'Entertainment', description: 'Your daily dose of news, culture, entertainment, and everything in between.', episodes: 420, plays: 312000, status: 'published', coverImage: 'https://picsum.photos/seed/podcast10/400/400', createdAt: '2024-06-01', rating: 4.6, language: 'English' },
  { id: '11', title: 'AI Frontiers', host: 'Sarah Chen', category: 'Technology', description: 'Cutting-edge artificial intelligence research, applications, and ethical considerations.', episodes: 28, plays: 45300, status: 'published', coverImage: 'https://picsum.photos/seed/podcast11/400/400', createdAt: '2026-03-10', rating: 4.9, language: 'English' },
  { id: '12', title: 'History Uncovered', host: 'Dr. James Wilson', category: 'Education', description: 'Fascinating stories from history that shaped our modern world.', episodes: 52, plays: 61200, status: 'published', coverImage: 'https://picsum.photos/seed/podcast12/400/400', createdAt: '2025-10-05', rating: 4.7, language: 'English' },
  { id: '13', title: 'Startup Stories', host: 'Maria Rodriguez', category: 'Business', description: 'Founder journeys, funding insights, and lessons from the startup trenches.', episodes: 41, plays: 38900, status: 'published', coverImage: 'https://picsum.photos/seed/podcast13/400/400', createdAt: '2026-01-20', rating: 4.5, language: 'English' },
  { id: '14', title: 'Pixel Perfect', host: 'Alex Thompson', category: 'Entertainment', description: 'Design, photography, visual arts and creative technology intersections.', episodes: 19, plays: 12800, status: 'draft', coverImage: 'https://picsum.photos/seed/podcast14/400/400', createdAt: '2026-05-15', rating: 4.0, language: 'English' },
  { id: '15', title: 'Mindful Moments', host: 'Mike Johnson', category: 'Health', description: 'Guided meditations, mindfulness practices, and mental wellness strategies.', episodes: 67, plays: 48100, status: 'published', coverImage: 'https://picsum.photos/seed/podcast15/400/400', createdAt: '2025-07-01', rating: 4.8, language: 'English' },
  { id: '16', title: 'Data Deep Dive', host: 'Aisha Patel', category: 'Technology', description: 'Data science, analytics, machine learning and statistical thinking for practitioners.', episodes: 14, plays: 8900, status: 'published', coverImage: 'https://picsum.photos/seed/podcast16/400/400', createdAt: '2026-06-01', rating: 4.4, language: 'English' },
  { id: '17', title: 'Language Lab', host: 'Sophie Martin', category: 'Education', description: 'Language learning tips, polyglot interviews, and cultural linguistic insights.', episodes: 36, plays: 22100, status: 'published', coverImage: 'https://picsum.photos/seed/podcast17/400/400', createdAt: '2025-12-01', rating: 4.3, language: 'English' },
  { id: '18', title: 'Green Planet', host: 'Lisa Wang', category: 'Science', description: 'Climate science, sustainability, renewable energy, and environmental conservation.', episodes: 21, plays: 15600, status: 'published', coverImage: 'https://picsum.photos/seed/podcast18/400/400', createdAt: '2026-04-15', rating: 4.6, language: 'English' },
  { id: '19', title: 'Comedy Hour', host: 'Alex Thompson', category: 'Entertainment', description: 'Stand-up comedy highlights, comedic interviews, and laugh-out-loud stories.', episodes: 92, plays: 187000, status: 'published', coverImage: 'https://picsum.photos/seed/podcast19/400/400', createdAt: '2024-08-01', rating: 4.2, language: 'English' },
  { id: '20', title: 'Crypto Weekly', host: 'David Kim', category: 'Technology', description: 'Cryptocurrency analysis, blockchain technology, DeFi, and Web3 developments.', episodes: 78, plays: 103400, status: 'archived', coverImage: 'https://picsum.photos/seed/podcast20/400/400', createdAt: '2024-10-01', rating: 3.9, language: 'English' },
];

export const MOCK_EPISODES = [
  { id: 'e1', podcastId: '1', title: 'The Future of AI in Software Development', host: 'Sarah Chen', date: '2026-06-05', duration: '42:15', plays: 12400, category: 'Technology', excerpt: 'Exploring how large language models are transforming code generation and developer workflows.', tags: ['AI', 'software', 'development'] },
  { id: 'e2', podcastId: '2', title: 'Quantum Computing Breakthroughs', host: 'Dr. James Wilson', date: '2026-06-03', duration: '55:30', plays: 8700, category: 'Science', excerpt: 'New quantum algorithms for drug discovery and the race to commercial quantum advantage.', tags: ['quantum', 'computing', 'research'] },
  { id: 'e3', podcastId: '3', title: 'Building Sustainable Startups', host: 'Maria Rodriguez', date: '2026-06-01', duration: '35:45', plays: 15200, category: 'Business', excerpt: 'Balancing growth with responsibility — lessons from mission-driven founders.', tags: ['startups', 'sustainability', 'business'] },
  { id: 'e4', podcastId: '4', title: 'The Creative Renaissance', host: 'Alex Thompson', date: '2026-05-28', duration: '48:00', plays: 6800, category: 'Entertainment', excerpt: 'How AI tools are enabling new forms of creative expression across all mediums.', tags: ['AI', 'creativity', 'art'] },
  { id: 'e5', podcastId: '1', title: 'Rust vs Go in 2026', host: 'Sarah Chen', date: '2026-05-25', duration: '38:20', plays: 9200, category: 'Technology', excerpt: 'A practical comparison of two modern systems languages for production workloads.', tags: ['rust', 'go', 'programming'] },
  { id: 'e6', podcastId: '3', title: 'Market Trends Q2 2026', host: 'Maria Rodriguez', date: '2026-05-22', duration: '42:00', plays: 18400, category: 'Business', excerpt: 'Comprehensive analysis of Q2 market movements and predictions for the rest of the year.', tags: ['markets', 'investing', 'economy'] },
  { id: 'e7', podcastId: '6', title: 'Mindfulness in the Digital Age', host: 'Mike Johnson', date: '2026-05-20', duration: '31:15', plays: 5400, category: 'Health', excerpt: 'Practical mindfulness techniques for busy professionals navigating digital overwhelm.', tags: ['mindfulness', 'mental-health', 'productivity'] },
  { id: 'e8', podcastId: '2', title: 'CRISPR Latest Developments', host: 'Dr. James Wilson', date: '2026-05-18', duration: '49:45', plays: 11200, category: 'Science', excerpt: 'Latest advances in gene editing technology and ethical considerations for clinical use.', tags: ['genetics', 'crispr', 'medicine'] },
  { id: 'e9', podcastId: '11', title: 'GPT-5 and Beyond', host: 'Sarah Chen', date: '2026-06-06', duration: '46:30', plays: 18900, category: 'Technology', excerpt: 'What the next generation of language models means for businesses and society.', tags: ['AI', 'GPT', 'LLM'] },
  { id: 'e10', podcastId: '15', title: 'Morning Meditation Routine', host: 'Mike Johnson', date: '2026-06-04', duration: '18:00', plays: 8900, category: 'Health', excerpt: 'A guided morning meditation to start your day with clarity and intention.', tags: ['meditation', 'morning', 'wellness'] },
  { id: 'e11', podcastId: '10', title: 'Weekly News Roundup', host: 'Alex Thompson', date: '2026-06-07', duration: '34:20', plays: 21300, category: 'Entertainment', excerpt: 'The biggest stories from around the world, curated and discussed.', tags: ['news', 'weekly', 'culture'] },
  { id: 'e12', podcastId: '8', title: 'Global Market Outlook', host: 'Maria Rodriguez', date: '2026-06-06', duration: '38:50', plays: 14100, category: 'Business', excerpt: 'Interest rate trends, emerging market opportunities, and portfolio strategies.', tags: ['markets', 'global', 'outlook'] },
  { id: 'e13', podcastId: '12', title: 'The Fall of Rome', host: 'Dr. James Wilson', date: '2026-05-30', duration: '52:10', plays: 7800, category: 'Education', excerpt: 'New archaeological evidence challenging conventional narratives about Rome\'s collapse.', tags: ['history', 'rome', 'archaeology'] },
  { id: 'e14', podcastId: '16', title: 'Machine Learning in Production', host: 'Aisha Patel', date: '2026-06-05', duration: '41:25', plays: 3400, category: 'Technology', excerpt: 'Best practices for deploying, monitoring, and maintaining ML models in production.', tags: ['ML', 'production', 'engineering'] },
  { id: 'e15', podcastId: '17', title: 'How to Learn Any Language', host: 'Sophie Martin', date: '2026-06-02', duration: '33:40', plays: 4500, category: 'Education', excerpt: 'Proven techniques for language acquisition from polyglots and neuroscientists.', tags: ['language', 'learning', 'techniques'] },
  { id: 'e16', podcastId: '18', title: 'Solar Energy Revolution', host: 'Lisa Wang', date: '2026-05-28', duration: '37:15', plays: 5100, category: 'Science', excerpt: 'How solar technology breakthroughs are accelerating the renewable energy transition.', tags: ['solar', 'energy', 'renewable'] },
  { id: 'e17', podcastId: '19', title: 'Best of Open Mic Night', host: 'Alex Thompson', date: '2026-06-06', duration: '45:00', plays: 31200, category: 'Entertainment', excerpt: 'Highlights from our live comedy open mic event featuring rising comedians.', tags: ['comedy', 'live', 'standup'] },
  { id: 'e18', podcastId: '13', title: 'From 0 to IPO', host: 'Maria Rodriguez', date: '2026-05-25', duration: '56:20', plays: 6700, category: 'Business', excerpt: 'A founder\'s journey from garage startup to NASDAQ listing in 5 years.', tags: ['startup', 'IPO', 'founder'] },
  { id: 'e19', podcastId: '1', title: 'Edge Computing Explained', host: 'Sarah Chen', date: '2026-06-02', duration: '36:40', plays: 7800, category: 'Technology', excerpt: 'How edge computing is reshaping IoT, real-time analytics, and cloud architecture.', tags: ['edge', 'cloud', 'IoT'] },
  { id: 'e20', podcastId: '15', title: 'Stress Management at Work', host: 'Mike Johnson', date: '2026-05-30', duration: '28:30', plays: 6200, category: 'Health', excerpt: 'Evidence-based strategies for managing workplace stress and preventing burnout.', tags: ['stress', 'work', 'burnout'] },
  { id: 'e21', podcastId: '11', title: 'Ethics of Autonomous Systems', host: 'Sarah Chen', date: '2026-05-28', duration: '44:10', plays: 5600, category: 'Technology', excerpt: 'Navigating the ethical challenges of self-driving cars, drones, and robotic decision-making.', tags: ['ethics', 'autonomous', 'AI'] },
  { id: 'e22', podcastId: '5', title: 'Learning in the Age of AI', host: 'Dr. Emily Park', date: '2026-05-15', duration: '39:50', plays: 2800, category: 'Education', excerpt: 'How AI tutors and personalized learning are transforming education.', tags: ['AI', 'education', 'learning'] },
  { id: 'e23', podcastId: '20', title: 'Crypto Regulation Update', host: 'David Kim', date: '2026-04-20', duration: '42:00', plays: 4500, category: 'Technology', excerpt: 'Latest regulatory developments in crypto markets and what they mean for investors.', tags: ['crypto', 'regulation', 'blockchain'] },
];

export const MOCK_ANALYTICS = {
  totalUsers: 13240,
  totalPlays: 815600,
  totalPodcasts: 20,
  avgEngagement: 74.2,
  totalRevenue: 284500,
  revenueGrowth: 22.4,
  playsByMonth: [
    { month: 'Jul 2025', value: 45000 },
    { month: 'Aug 2025', value: 52000 },
    { month: 'Sep 2025', value: 58000 },
    { month: 'Oct 2025', value: 61000 },
    { month: 'Nov 2025', value: 67000 },
    { month: 'Dec 2025', value: 72000 },
    { month: 'Jan 2026', value: 68000 },
    { month: 'Feb 2026', value: 74000 },
    { month: 'Mar 2026', value: 79000 },
    { month: 'Apr 2026', value: 81000 },
    { month: 'May 2026', value: 84000 },
    { month: 'Jun 2026', value: 96000 },
  ],
  avgSessionDuration: '28:45',
  activeUsers: 3890,
  userRetention: 68.5,
  userGrowth: [
    { month: 'Jul 2025', value: 1200 },
    { month: 'Aug 2025', value: 1800 },
    { month: 'Sep 2025', value: 2400 },
    { month: 'Oct 2025', value: 3100 },
    { month: 'Nov 2025', value: 3900 },
    { month: 'Dec 2025', value: 4200 },
    { month: 'Jan 2026', value: 5100 },
    { month: 'Feb 2026', value: 5800 },
    { month: 'Mar 2026', value: 6700 },
    { month: 'Apr 2026', value: 7800 },
    { month: 'May 2026', value: 10600 },
    { month: 'Jun 2026', value: 13240 },
  ],
  revenueByMonth: [
    { month: 'Jul 2025', value: 12000 },
    { month: 'Aug 2025', value: 15500 },
    { month: 'Sep 2025', value: 18000 },
    { month: 'Oct 2025', value: 19500 },
    { month: 'Nov 2025', value: 22100 },
    { month: 'Dec 2025', value: 24800 },
    { month: 'Jan 2026', value: 25400 },
    { month: 'Feb 2026', value: 27000 },
    { month: 'Mar 2026', value: 28500 },
    { month: 'Apr 2026', value: 30200 },
    { month: 'May 2026', value: 31500 },
    { month: 'Jun 2026', value: 32000 },
  ],
  playsByCategory: [
    { category: 'Technology', value: 234000 },
    { category: 'Business', value: 198000 },
    { category: 'Entertainment', value: 152000 },
    { category: 'Science', value: 98000 },
    { category: 'Education', value: 76000 },
    { category: 'Health', value: 57600 },
  ],
  weeklyPlays: [
    { label: 'Mon', value: 6200 },
    { label: 'Tue', value: 7800 },
    { label: 'Wed', value: 6900 },
    { label: 'Thu', value: 9200 },
    { label: 'Fri', value: 8500 },
    { label: 'Sat', value: 12100 },
    { label: 'Sun', value: 14400 },
  ],
  devices: [
    { type: 'Mobile', value: 58 },
    { type: 'Desktop', value: 28 },
    { type: 'Tablet', value: 10 },
    { type: 'Smart Speaker', value: 4 },
  ],
  retentionByWeek: [
    { week: 'Week 1', value: 100 },
    { week: 'Week 2', value: 76 },
    { week: 'Week 3', value: 62 },
    { week: 'Week 4', value: 54 },
    { week: 'Week 5', value: 48 },
    { week: 'Week 6', value: 44 },
    { week: 'Week 7', value: 41 },
    { week: 'Week 8', value: 38 },
  ],
  topCountries: [
    { country: 'United States', value: 42 },
    { country: 'United Kingdom', value: 15 },
    { country: 'Canada', value: 11 },
    { country: 'Germany', value: 8 },
    { country: 'Australia', value: 7 },
    { country: 'Other', value: 17 },
  ],
};

export const MOCK_HISTORY = [
  { id: 'h1', episodeTitle: 'The Future of AI in Software Development', podcastTitle: 'Tech Horizons', podcastEmoji: '🚀', playedAt: '2026-06-08T10:30:00Z', duration: '42:15', progress: 85, episodeId: 'e1' },
  { id: 'h2', episodeTitle: 'Quantum Computing Breakthroughs', podcastTitle: 'The Science Hour', podcastEmoji: '🔬', playedAt: '2026-06-07T14:15:00Z', duration: '55:30', progress: 62, episodeId: 'e2' },
  { id: 'h3', episodeTitle: 'Building Sustainable Startups', podcastTitle: 'Business Insights', podcastEmoji: '💼', playedAt: '2026-06-06T09:00:00Z', duration: '35:45', progress: 100, episodeId: 'e3' },
  { id: 'h4', episodeTitle: 'Mindfulness in the Digital Age', podcastTitle: 'Wellness Wave', podcastEmoji: '🧠', playedAt: '2026-06-05T20:00:00Z', duration: '31:15', progress: 41, episodeId: 'e7' },
  { id: 'h5', episodeTitle: 'The Creative Renaissance', podcastTitle: 'Creative Minds', podcastEmoji: '🎨', playedAt: '2026-06-04T16:45:00Z', duration: '48:00', progress: 100, episodeId: 'e4' },
  { id: 'h6', episodeTitle: 'GPT-5 and Beyond', podcastTitle: 'AI Frontiers', podcastEmoji: '🤖', playedAt: '2026-06-08T08:00:00Z', duration: '46:30', progress: 30, episodeId: 'e9' },
  { id: 'h7', episodeTitle: 'Morning Meditation Routine', podcastTitle: 'Mindful Moments', podcastEmoji: '🧘', playedAt: '2026-06-08T07:00:00Z', duration: '18:00', progress: 100, episodeId: 'e10' },
  { id: 'h8', episodeTitle: 'Weekly News Roundup', podcastTitle: 'The Daily Digest', podcastEmoji: '📰', playedAt: '2026-06-07T12:00:00Z', duration: '34:20', progress: 55, episodeId: 'e11' },
  { id: 'h9', episodeTitle: 'Rust vs Go in 2026', podcastTitle: 'Tech Horizons', podcastEmoji: '🚀', playedAt: '2026-06-06T18:30:00Z', duration: '38:20', progress: 100, episodeId: 'e5' },
  { id: 'h10', episodeTitle: 'Machine Learning in Production', podcastTitle: 'Data Deep Dive', podcastEmoji: '📉', playedAt: '2026-06-05T15:00:00Z', duration: '41:25', progress: 78, episodeId: 'e14' },
];

export const MOCK_PLAYLISTS = [
  { id: 'p1', name: 'Favorites', description: 'My all-time favorite episodes', episodeCount: 5, createdAt: '2026-04-01', emoji: '⭐' },
  { id: 'p2', name: 'Drive Time', description: 'Perfect for the commute', episodeCount: 3, createdAt: '2026-05-10', emoji: '🚗' },
  { id: 'p3', name: 'Learning List', description: 'Educational content I want to finish', episodeCount: 8, createdAt: '2026-03-15', emoji: '📖' },
  { id: 'p4', name: 'Workout Mix', description: 'High energy for the gym', episodeCount: 4, createdAt: '2026-06-01', emoji: '💪' },
];

export const MOCK_SAVED_PODCASTS = ['1', '2', '3', '6', '11', '15', '18'];

export const MOCK_RECENT_ACTIVITY = [
  { id: 'a1', type: 'signup', user: 'Aisha Patel', detail: 'New user registered', timestamp: '2026-06-08T09:30:00Z' },
  { id: 'a2', type: 'podcast_created', user: 'Sarah Chen', detail: 'Created "Data Deep Dive"', timestamp: '2026-06-08T08:15:00Z' },
  { id: 'a3', type: 'episode_published', user: 'Mike Johnson', detail: 'Published "Morning Meditation"', timestamp: '2026-06-08T07:00:00Z' },
  { id: 'a4', type: 'milestone', user: 'Tech Horizons', detail: 'Reached 100K plays', timestamp: '2026-06-07T22:00:00Z' },
  { id: 'a5', type: 'signup', user: 'Tom Baker', detail: 'New user registered', timestamp: '2026-06-07T14:20:00Z' },
  { id: 'a6', type: 'podcast_updated', user: 'Maria Rodriguez', detail: 'Updated "Market Pulse" cover', timestamp: '2026-06-07T11:45:00Z' },
  { id: 'a7', type: 'signup', user: 'Carlos Mendez', detail: 'New user registered', timestamp: '2026-06-06T16:30:00Z' },
  { id: 'a8', type: 'report', user: 'System', detail: 'Monthly analytics report generated', timestamp: '2026-06-06T00:00:00Z' },
];

/* ============================================
   Helper Functions
   ============================================ */

function filterAndPaginate(items, { page = 1, pageSize = 10, search = '', searchFields = [], filters = {} } = {}) {
  let filtered = [...items];
  if (search && searchFields.length) {
    const s = search.toLowerCase();
    filtered = filtered.filter((item) => searchFields.some((field) => String(item[field]).toLowerCase().includes(s)));
  }
  Object.entries(filters).forEach(([key, value]) => {
    if (value) filtered = filtered.filter((item) => item[key] === value);
  });
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  return { data, total, page, pageSize };
}

/* ============================================
   API-like Functions
   ============================================ */

// --- Users ---
export async function fetchUsers({ page = 1, pageSize = 10, search = '', role = '', status = '' } = {}) {
  await delay();
  return filterAndPaginate(MOCK_USERS, { page, pageSize, search, searchFields: ['name', 'email'], filters: { role, status } });
}

export async function fetchUserById(id) {
  await delay(200);
  const user = MOCK_USERS.find((u) => u.id === id);
  if (!user) throw new Error('User not found');
  const safe = { ...user };
  delete safe.password;
  return { data: safe };
}

export async function updateUserStatus(userId, newStatus) {
  await delay(200);
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (user) user.status = newStatus;
  return { success: true };
}

export async function updateUserRole(userId, newRole) {
  await delay(200);
  const user = MOCK_USERS.find((u) => u.id === userId);
  if (user) user.role = newRole;
  return { success: true };
}

export async function deleteUser(userId) {
  await delay(200);
  const idx = MOCK_USERS.findIndex((u) => u.id === userId);
  if (idx >= 0) MOCK_USERS.splice(idx, 1);
  return { success: true };
}

// --- Categories ---
export async function fetchCategories() {
  await delay(150);
  return { data: MOCK_CATEGORIES };
}

// --- Podcasts ---
export async function fetchPodcasts({ page = 1, pageSize = 10, search = '', category = '', status = '' } = {}) {
  await delay();
  return filterAndPaginate(MOCK_PODCASTS, { page, pageSize, search, searchFields: ['title', 'host'], filters: { category, status } });
}

export async function fetchPodcastById(id) {
  await delay(200);
  const podcast = MOCK_PODCASTS.find((p) => p.id === id);
  if (!podcast) throw new Error('Podcast not found');
  return { data: podcast };
}

export async function createPodcast(podcastData) {
  await delay(300);
  const newPodcast = {
    id: String(Date.now()),
    ...podcastData,
    rating: 0,
    plays: 0,
    episodes: 0,
    language: 'English',
    createdAt: new Date().toISOString().split('T')[0],
  };
  MOCK_PODCASTS.unshift(newPodcast);
  return { data: newPodcast };
}

export async function updatePodcast(id, updates) {
  await delay(300);
  const idx = MOCK_PODCASTS.findIndex((p) => p.id === id);
  if (idx >= 0) {
    MOCK_PODCASTS[idx] = { ...MOCK_PODCASTS[idx], ...updates };
    return { data: MOCK_PODCASTS[idx] };
  }
  throw new Error('Podcast not found');
}

export async function deletePodcast(id) {
  await delay(200);
  const idx = MOCK_PODCASTS.findIndex((p) => p.id === id);
  if (idx >= 0) MOCK_PODCASTS.splice(idx, 1);
  return { success: true };
}

export async function duplicatePodcast(id) {
  await delay(300);
  const original = MOCK_PODCASTS.find((p) => p.id === id);
  if (!original) throw new Error('Podcast not found');
  const copy = { ...original, id: String(Date.now()), title: `${original.title} (Copy)`, status: 'draft', createdAt: new Date().toISOString().split('T')[0] };
  MOCK_PODCASTS.unshift(copy);
  return { data: copy };
}

export async function bulkUpdatePodcasts(ids, updates) {
  await delay(300);
  ids.forEach((id) => {
    const idx = MOCK_PODCASTS.findIndex((p) => p.id === id);
    if (idx >= 0) MOCK_PODCASTS[idx] = { ...MOCK_PODCASTS[idx], ...updates };
  });
  return { success: true };
}

// --- Episodes ---
export async function fetchEpisodes({ podcastId, page = 1, pageSize = 20 } = {}) {
  await delay();
  let filtered = [...MOCK_EPISODES];
  if (podcastId) filtered = filtered.filter((e) => e.podcastId === podcastId);
  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const data = filtered.slice(start, start + pageSize);
  return { data, total, page, pageSize };
}

// --- Analytics ---
export async function fetchAnalytics(timeRange = '30d') {
  await delay(300);
  if (timeRange) {
    // noop reference
  }
  return { data: MOCK_ANALYTICS };
}

// --- Activity ---
export async function fetchRecentActivity({ page = 1, pageSize = 10 } = {}) {
  await delay(200);
  const total = MOCK_RECENT_ACTIVITY.length;
  const start = (page - 1) * pageSize;
  const data = MOCK_RECENT_ACTIVITY.slice(start, start + pageSize);
  return { data, total, page, pageSize };
}

// --- User-specific ---
export async function fetchListeningHistory({ page = 1, pageSize = 10 } = {}) {
  await delay();
  const total = MOCK_HISTORY.length;
  const start = (page - 1) * pageSize;
  const data = MOCK_HISTORY.slice(start, start + pageSize);
  return { data, total, page, pageSize };
}

export async function fetchPlaylists() {
  await delay(200);
  return { data: MOCK_PLAYLISTS };
}

export async function fetchSavedPodcasts() {
  await delay(200);
  const saved = MOCK_PODCASTS.filter((p) => MOCK_SAVED_PODCASTS.includes(p.id));
  return { data: saved };
}

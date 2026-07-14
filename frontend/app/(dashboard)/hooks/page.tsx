'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

interface Hook {
  style: string;
  hook: string;
  score: number;
  explanation: string;
}

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'LinkedIn'];

const STYLE_BADGES: Record<string, string> = {
  question: 'text-sky-600 bg-sky-50 border-sky-100',
  statistic: 'text-amber-600 bg-amber-50 border-amber-100',
  story: 'text-purple-600 bg-purple-50 border-purple-100',
  controversial: 'text-red-600 bg-red-50 border-red-100',
  curiosity: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  default: 'text-gray-600 bg-gray-50 border-gray-100',
};

function getScoreColorClass(score: number): string {
  if (score >= 80) return 'bg-primary';
  if (score >= 60) return 'bg-secondary';
  return 'bg-tertiary';
}

function getScoreTextColorClass(score: number): string {
  if (score >= 80) return 'text-primary';
  if (score >= 60) return 'text-secondary';
  return 'text-tertiary';
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 24 } },
};

export default function HooksPage() {
  const fetchBillingState = useAuthStore(state => state.fetchBillingState);
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [hooks, setHooks] = useState<Hook[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [animated, setAnimated] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  useEffect(() => {
    if (hooks.length > 0) {
      setAnimated(false);
      const timer = setTimeout(() => setAnimated(true), 100);
      return () => clearTimeout(timer);
    }
  }, [hooks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;
    setLoading(true);
    setError('');
    setHooks([]);

    try {
      const res = await api.post('/hooks/generate', { topic, platform });
      const rawHooks = res.data.hooks || [];
      const formattedHooks = rawHooks.map((h: any) => ({
        style: h.style,
        hook: h.hook_text || h.hook,
        score: h.score,
        explanation: h.why_it_works || h.explanation,
      }));
      setHooks(formattedHooks);
      toast.success(`Generated ${formattedHooks.length} scroll-stopping hooks!`);
      fetchBillingState();
      
      // Save to local storage for dynamic dashboard
      if (formattedHooks.length > 0) {
        try {
          const saved = localStorage.getItem('curate_ai_workspace_pieces') || '[]';
          const list = JSON.parse(saved);
          list.unshift({
            id: Date.now().toString(),
            title: `Hooks: ${topic}`,
            platform: platform.toLowerCase(),
            type: 'Hook Generator',
            status: 'Optimized',
            score: `${formattedHooks[0].score}%`,
            date: 'Just now',
            description: `Generated 5 scroll-stopping hook variants. Top: "${formattedHooks[0].hook.substring(0, 80)}..."`
          });
          localStorage.setItem('curate_ai_workspace_pieces', JSON.stringify(list.slice(0, 12)));
        } catch (err) {
          console.error('Failed to save hooks to workspace', err);
        }
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Hooks generation failed. Please verify that the backend API is running.';
      setError(msg);
      toast.error(msg);
      setHooks([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast.success('Hook copied to clipboard!');
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in-up font-dm-sans">
      {/* Header */}
      <div className="space-y-1 reveal">
        <p className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em] mb-2">Conversion Tool</p>
        <h2 className="font-playfair text-headline-lg text-primary">Hook Generator & Scorer</h2>
        <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
          Pitch your topic and get 5 scroll-stopping variations scored for expected retention performance.
        </p>
      </div>

      {/* Input Frame */}
      <form
        onSubmit={handleSubmit}
        className="glass border border-outline-variant/10 rounded-[32px] p-6 space-y-6 shadow-sm reveal stagger-1"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest select-none">
              Content Topic
            </label>
            <motion.input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
              transition={{ duration: 0.2 }}
              placeholder="e.g. how I manage stress, dev workflows, budget tips..."
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-4 px-6 text-sm text-on-surface placeholder:text-outline/65 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-150"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest select-none">
              Channel
            </label>
            <div className="relative">
              <motion.select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                whileFocus={{ scale: 1.005, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                transition={{ duration: 0.2 }}
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-4 px-6 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none pr-12 font-semibold"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </motion.select>
              <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            type="submit"
            disabled={loading || !topic.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-container disabled:bg-surface-container-low text-on-primary disabled:text-outline/50 font-semibold text-xs rounded-full transition-all duration-150 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/5"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                <span>Analyzing retention drivers...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">hook</span>
                <span>Generate Hooks</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Error Note */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-xs flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">info</span> {error}
        </motion.div>
      )}

      {/* Skeleton loading block */}
      {loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="glass border border-outline-variant/10 rounded-[24px] p-6 space-y-6 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-4 bg-outline-variant/20 rounded w-20"></div>
                <div className="h-4 bg-outline-variant/20 rounded w-32"></div>
              </div>
              <div className="h-6 bg-outline-variant/10 rounded w-3/4"></div>
              <div className="border-t border-outline-variant/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 h-3 bg-outline-variant/15 rounded-full"></div>
                <div className="h-4 bg-outline-variant/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Hooks Grid */}
      {hooks.length > 0 && !loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6 reveal stagger-2"
        >
          {hooks.map((item, idx) => {
            const cleanStyle = item.style.toLowerCase();
            let styleClass = STYLE_BADGES.default;
            if (cleanStyle.includes('question')) styleClass = STYLE_BADGES.question;
            else if (cleanStyle.includes('stat')) styleClass = STYLE_BADGES.statistic;
            else if (cleanStyle.includes('story')) styleClass = STYLE_BADGES.story;
            else if (cleanStyle.includes('shock') || cleanStyle.includes('controversy')) styleClass = STYLE_BADGES.controversial;
            else if (cleanStyle.includes('curiosity')) styleClass = STYLE_BADGES.curiosity;

            const isCopied = copiedIndex === idx;

            return (
              <motion.div
                key={idx}
                variants={itemVariants}
                className="glass border border-outline-variant/10 rounded-[24px] p-6 hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 flex flex-col justify-between gap-5"
              >
                {/* Top Section */}
                <div className="flex items-center justify-between select-none">
                  <span className={`px-2.5 py-0.5 rounded border text-[9px] font-bold uppercase tracking-wider ${styleClass}`}>
                    {item.style} Hook
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-outline font-semibold uppercase tracking-widest">Expected Conversion</span>
                    <span className={`text-xs font-bold font-mono ${getScoreTextColorClass(item.score)}`}>
                      {item.score}%
                    </span>
                  </div>
                </div>

                {/* Hook Text */}
                <div className="relative group min-h-[50px]">
                  <p className="text-sm text-on-background font-semibold leading-relaxed pr-24 select-text">
                    &ldquo;{item.hook}&rdquo;
                  </p>
                  <motion.button
                    onClick={() => handleCopy(item.hook, idx)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`absolute right-0 top-0 px-3 py-1.5 rounded-full border transition-all duration-150 select-none cursor-pointer ${
                      isCopied
                        ? 'bg-secondary-container/40 border-secondary-container text-secondary font-bold'
                        : 'bg-white/50 border-outline-variant/30 text-outline hover:text-primary hover:border-primary/45'
                    }`}
                    title="Copy to clipboard"
                  >
                    {isCopied ? (
                      <span className="text-[10px] font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">done</span>
                        <span>Copied</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">content_copy</span>
                        <span>Copy</span>
                      </span>
                    )}
                  </motion.button>
                </div>

                {/* Bottom Retention Bar */}
                <div className="border-t border-outline-variant/10 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 select-none">
                  {/* Miniature Retention score bar */}
                  <div className="flex-1 flex items-center gap-3">
                    <span className="text-[9px] text-outline uppercase tracking-widest font-bold">Retention:</span>
                    <div className="flex-1 h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${getScoreColorClass(item.score)}`}
                        initial={{ width: 0 }}
                        animate={{ width: animated ? `${item.score}%` : '0%' }}
                        transition={{ duration: 1, ease: 'easeOut', delay: 0.1 + idx * 0.05 }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-on-surface-variant leading-relaxed italic flex items-center gap-1.5 sm:max-w-[70%]">
                    <span className="material-symbols-outlined text-sm text-primary">lightbulb</span>
                    <span>{item.explanation}</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}

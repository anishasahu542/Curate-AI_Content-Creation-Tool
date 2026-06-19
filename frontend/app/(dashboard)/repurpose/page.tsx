'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'LinkedIn'] as const;

const PLATFORM_EMOJIS: Record<string, string> = {
  youtube: '🎬',
  instagram: '📸',
  tiktok: '🎵',
  twitter: '🐦',
  linkedin: '💼',
};

function TypewriterText({ text }: { text: string }) {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    setDisplayedText('');
    let idx = 0;
    const words = text.split(' ');
    const timer = setInterval(() => {
      if (idx < words.length) {
        setDisplayedText((prev) => prev + (idx > 0 ? ' ' : '') + words[idx]);
        idx++;
      } else {
        clearInterval(timer);
      }
    }, 20); // 20ms per word
    return () => clearInterval(timer);
  }, [text]);

  return (
    <p className="text-on-surface-variant font-mono text-xs leading-relaxed whitespace-pre-wrap select-text">
      {displayedText}
    </p>
  );
}

export default function RepurposePage() {
  const [content, setContent] = useState('');
  const [sourcePlatform, setSourcePlatform] = useState('YouTube');
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const [activeTab, setActiveTab] = useState('instagram');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);

    try {
      const res = await api.post('/repurpose/generate', {
        content,
        source_platform: sourcePlatform,
      });
      const rawRepurposed = res.data.repurposed || {};
      const mappedResults: Record<string, string> = {};
      Object.entries(rawRepurposed).forEach(([key, val]) => {
        let cleanKey = key.toLowerCase();
        if (cleanKey.startsWith('twitter')) cleanKey = 'twitter';
        mappedResults[cleanKey] = val as string;
      });
      setResults(mappedResults);
      const keys = Object.keys(mappedResults);
      if (keys.length > 0) {
        setActiveTab(keys[0]);
        toast.success('Content repurposed successfully!');
        
        // Save to local storage for dynamic dashboard
        try {
          const saved = localStorage.getItem('curate_ai_workspace_pieces') || '[]';
          const list = JSON.parse(saved);
          list.unshift({
            id: Date.now().toString(),
            title: `Repurposed: ${content.substring(0, 30)}...`,
            platform: keys[0],
            type: 'Content Repurposer',
            status: 'Optimized',
            score: '90%',
            date: 'Just now',
            description: mappedResults[keys[0]].substring(0, 150) + '...'
          });
          localStorage.setItem('curate_ai_workspace_pieces', JSON.stringify(list.slice(0, 12)));
        } catch (err) {
          console.error('Failed to save repurposed content to workspace', err);
        }
      }
    } catch (err) {
      console.error('Repurpose failed:', err);
      const errMsg = 'Repurposing failed. Please verify that the backend API is running.';
      setError(errMsg);
      toast.error(errMsg);
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto animate-fade-in-up font-dm-sans">
      {/* Header */}
      <div className="space-y-1 reveal">
        <p className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em] mb-2">Advanced Tool</p>
        <h2 className="font-playfair text-headline-lg text-primary">Smart Content Repurposer</h2>
        <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
          Instantly reshape your video script, draft, or post to native formats across other platforms.
        </p>
      </div>

      {/* Editor Frame */}
      <form
        onSubmit={handleSubmit}
        className="glass border border-outline-variant/10 rounded-[32px] p-6 space-y-6 shadow-sm reveal stagger-1"
      >
        <div className="space-y-2">
          <div className="flex justify-between items-center select-none">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest">
              Paste Content Source
            </label>
            <span className="text-[10px] text-outline font-medium">{content.length} characters</span>
          </div>
          <motion.textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={5}
            whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
            transition={{ duration: 0.2 }}
            placeholder="Type or paste your content here (e.g. video outlines, blog text, raw notes)..."
            className="w-full bg-surface-container-low border border-outline-variant/10 rounded-[18px] px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-150 resize-none font-sans"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-auto flex items-center gap-3 select-none">
            <span className="text-[10px] text-outline whitespace-nowrap uppercase tracking-widest font-bold">Source Channel:</span>
            <div className="relative">
              <motion.select
                value={sourcePlatform}
                onChange={(e) => setSourcePlatform(e.target.value)}
                whileFocus={{ scale: 1.005, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                transition={{ duration: 0.2 }}
                className="bg-surface-container-low border border-outline-variant/10 rounded-full px-5 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none pr-10 font-semibold"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_EMOJIS[p.toLowerCase()] || '📄'} {p}
                  </option>
                ))}
              </motion.select>
              <span className="material-symbols-outlined absolute right-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-sm">
                expand_more
              </span>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={loading || !content.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-container disabled:bg-surface-container-low text-on-primary disabled:text-outline/50 font-semibold text-xs rounded-full transition-all duration-150 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/5"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                <span>Processing AI Adaptation...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">sync_alt</span>
                <span>Repurpose Content</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Error Alert */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-xs flex items-center gap-2 animate-scale-up">
          <span className="material-symbols-outlined text-sm">info</span> {error}
        </div>
      )}

      {/* Skeleton loading block */}
      {loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass border border-outline-variant/10 rounded-[24px] overflow-hidden shadow-sm space-y-6 max-w-4xl mx-auto p-6 animate-pulse"
        >
          <div className="flex border-b border-outline-variant/10 pb-4 gap-4">
            <div className="h-6 w-20 bg-outline-variant/20 rounded"></div>
            <div className="h-6 w-20 bg-outline-variant/20 rounded"></div>
            <div className="h-6 w-20 bg-outline-variant/20 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-outline-variant/20 rounded w-1/4"></div>
            <div className="h-24 bg-outline-variant/10 border border-outline-variant/10 rounded-xl"></div>
          </div>
        </motion.div>
      )}

      {/* Output Panel */}
      {results && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass border border-outline-variant/10 rounded-[24px] overflow-hidden shadow-sm reveal stagger-2"
        >
          {/* Custom Tabs */}
          <div className="flex border-b border-outline-variant/10 bg-white/20 relative select-none">
            {Object.keys(results).map((platform) => {
              const active = activeTab === platform;
              return (
                <button
                  key={platform}
                  type="button"
                  onClick={() => setActiveTab(platform)}
                  className={`px-5 py-3.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-150 border-b-2 flex items-center gap-2 cursor-pointer relative ${
                    active
                      ? 'border-primary text-primary bg-white/40 font-semibold'
                      : 'border-transparent text-outline hover:text-primary hover:bg-white/10'
                  }`}
                >
                  <span>{PLATFORM_EMOJIS[platform]}</span>
                  <span>{platform}</span>
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
          <div className="p-6">
            {Object.entries(results).map(([platform, text]) => {
              if (platform !== activeTab) return null;
              return (
                <div key={platform} className="space-y-4">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-widest flex items-center gap-1.5 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Output Preview
                    </span>
                    <motion.button
                      onClick={() => handleCopy(text)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2 rounded-full border text-xs font-semibold bg-white/50 border-outline-variant/30 text-outline hover:text-primary hover:border-primary/40 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-xs">content_copy</span>
                      <span>Copy Text</span>
                    </motion.button>
                  </div>

                  <div className="p-5 rounded-xl bg-surface-container-low border border-outline-variant/15 relative group">
                    <TypewriterText text={text} />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}

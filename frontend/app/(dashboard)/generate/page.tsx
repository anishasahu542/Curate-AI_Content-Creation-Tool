'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

const STEPS = [
  'Analyzing Prompt',
  'Building Content Structure',
  'Optimizing Engagement',
  'Finalizing Output'
];

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
    }, 30); // 30ms per word
    return () => clearInterval(timer);
  }, [text]);

  return <p className="whitespace-pre-wrap text-on-surface-variant text-sm leading-relaxed">{displayedText}</p>;
}

export default function GenerateContentPage() {
  const fetchBillingState = useAuthStore(state => state.fetchBillingState);
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('YouTube');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      setCurrentStep(0);
      interval = setInterval(() => {
        setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
      }, 1500); // 1.5 seconds per step
    }
    return () => clearInterval(interval);
  }, [loading]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const response = await api.post('/ai/generate', { topic, platform });
      setResult(response.data.script);
      toast.success('Script generated successfully!');
      fetchBillingState();

      // Save to local storage for dynamic dashboard
      try {
        const saved = localStorage.getItem('curate_ai_workspace_pieces') || '[]';
        const list = JSON.parse(saved);
        list.unshift({
          id: Date.now().toString(),
          title: topic,
          platform: platform.toLowerCase(),
          type: 'Script Generator',
          status: 'Optimized',
          score: '92%',
          date: 'Just now',
          description: response.data.script ? (response.data.script.substring(0, 150) + '...') : ''
        });
        localStorage.setItem('curate_ai_workspace_pieces', JSON.stringify(list.slice(0, 12)));
      } catch (err) {
        console.error('Failed to save piece to workspace', err);
      }

    } catch (err: any) {
      console.error('Generation failed', err);
      const errMsg = 'Generation failed. Please verify that the backend API is running.';
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const progressPercent = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-12 max-w-4xl mx-auto animate-fade-in-up font-dm-sans">
      {/* Header */}
      <header className="reveal">
        <p className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em] mb-2">Creator Tool</p>
        <h2 className="font-playfair text-headline-lg text-primary">Create New Content</h2>
      </header>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-xs flex items-center gap-2 select-none animate-scale-up max-w-2xl mx-auto">
          <span className="material-symbols-outlined text-sm">info</span> {error}
        </div>
      )}

      {/* Input Form Card */}
      <div className="glass rounded-[32px] p-8 border border-outline-variant/10 shadow-sm max-w-2xl mx-auto reveal stagger-1">
        <form onSubmit={handleGenerate} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-outline font-label-md text-label-md uppercase tracking-wider">Topic / Niche</label>
            <motion.input 
              type="text" 
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              whileFocus={{ scale: 1.005, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
              transition={{ duration: 0.2 }}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-4 px-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none text-on-background" 
              placeholder="E.g., How to start an AI business"
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="block text-outline font-label-md text-label-md uppercase tracking-wider">Platform</label>
            <div className="relative">
              <motion.select 
                value={platform} 
                onChange={(e) => setPlatform(e.target.value)} 
                whileFocus={{ scale: 1.005, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                transition={{ duration: 0.2 }}
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-4 px-6 focus:ring-2 focus:ring-primary/20 text-body-md transition-all outline-none text-on-background appearance-none cursor-pointer"
              >
                <option>YouTube</option>
                <option>Instagram</option>
                <option>TikTok</option>
              </motion.select>
              <span className="material-symbols-outlined absolute right-6 top-1/2 -translate-y-1/2 text-outline pointer-events-none">
                expand_more
              </span>
            </div>
          </div>
          
          <motion.button 
            type="submit" 
            disabled={loading} 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-full bg-primary text-on-primary py-4 rounded-full font-label-md text-label-md shadow-xl shadow-primary/10 flex items-center justify-center gap-2 cursor-pointer font-semibold"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                <span>Generating...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">auto_awesome</span>
                <span>Generate Content</span>
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* Multi-step loading status / Skeleton loader */}
      {loading && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 glass rounded-[24px] border border-outline-variant/10 p-6 space-y-6 max-w-2xl mx-auto animate-pulse-slow"
        >
          <div className="space-y-2">
            <div className="flex justify-between items-center text-xs text-outline">
              <span className="font-semibold uppercase tracking-wider">Engine Process</span>
              <span>{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-primary rounded-full"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </div>
          
          <div className="py-4 border-y border-outline-variant/10 flex flex-col items-center justify-center gap-3">
            <span className="animate-spin material-symbols-outlined text-primary text-xl">sync</span>
            <AnimatePresence mode="wait">
              <motion.p
                key={currentStep}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="text-xs font-semibold text-primary uppercase tracking-wider text-center"
              >
                {STEPS[currentStep]}
              </motion.p>
            </AnimatePresence>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 bg-outline-variant/20 rounded w-3/4"></div>
            <div className="h-4 bg-outline-variant/20 rounded w-5/6"></div>
            <div className="h-4 bg-outline-variant/20 rounded w-2/3"></div>
          </div>
        </motion.div>
      )}
      
      {result && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 glass rounded-[24px] border border-outline-variant/10 p-6 text-on-background reveal stagger-2"
        >
          <div className="flex justify-between items-center mb-4 border-b border-outline-variant/10 pb-3">
            <h3 className="font-playfair text-lg text-primary">Generated Script</h3>
            <motion.button 
              onClick={() => {
                navigator.clipboard.writeText(result);
                toast.success('Script copied to clipboard!');
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="text-primary font-label-md text-xs flex items-center gap-1 hover:opacity-60 transition-opacity cursor-pointer border border-outline-variant/30 px-3 py-1.5 rounded-full bg-white/50"
            >
              <span className="material-symbols-outlined text-xs">content_copy</span>
              Copy Script
            </motion.button>
          </div>
          <TypewriterText text={result} />
        </motion.div>
      )}
    </div>
  );
}
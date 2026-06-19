'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import CountUp from 'react-countup';

interface BreakdownMetric {
  metric: string;
  score: number;
  feedback: string;
}

interface ViralResult {
  overall_score: number;
  verdict: string;
  breakdown: BreakdownMetric[];
}

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'LinkedIn'];

function getScoreTextColorClass(score: number): string {
  if (score >= 80) return 'text-primary';
  if (score >= 60) return 'text-secondary';
  return 'text-tertiary';
}

function getMetricGradientClass(score: number): string {
  if (score >= 80) return 'bg-primary';
  if (score >= 60) return 'bg-secondary';
  return 'bg-tertiary';
}

export default function ViralScorePage() {
  const [content, setContent] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [result, setResult] = useState<ViralResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [optimized, setOptimized] = useState(false);

  const handleSubmit = async (e?: React.FormEvent, overrideContent?: string) => {
    if (e) e.preventDefault();
    const textToAnalyze = overrideContent !== undefined ? overrideContent : content;
    if (!textToAnalyze.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.post('/viral-score/analyze', { content: textToAnalyze, platform });
      const data = res.data;
      setResult(data);
      toast.success('Viral audit completed successfully!');

      if (data.overall_score >= 90) {
        toast('🔥 Highly Viral Potential! Excellent work.');
      }

      // Save to local storage for dynamic dashboard
      try {
        const saved = localStorage.getItem('curate_ai_workspace_pieces') || '[]';
        const list = JSON.parse(saved);
        const snippet = textToAnalyze.length > 80 ? (textToAnalyze.substring(0, 77) + '...') : textToAnalyze;
        list.unshift({
          id: Date.now().toString(),
          title: `Viral Score: ${data.overall_score}%`,
          platform: platform.toLowerCase(),
          type: 'Viral Predictor',
          status: 'Optimized',
          score: `${data.overall_score}%`,
          date: 'Just now',
          description: `Verdict: ${data.verdict} Content snippet: "${snippet}"`
        });
        localStorage.setItem('curate_ai_workspace_pieces', JSON.stringify(list.slice(0, 12)));
      } catch (err) {
        console.error('Failed to save piece to workspace', err);
      }
    } catch (err) {
      console.error('Analysis failed', err);
      const msg = 'Viral score analysis failed. Please verify that the backend API is running.';
      setError(msg);
      toast.error(msg);
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleOptimizeAction = () => {
    toast.info('Applying Auto-Hook & CTA Enhancer...');
    
    const originalLines = content.split('\n').filter(l => l.trim());
    let hook = "STOP wasting hours on templates that get zero conversion.";
    let body = originalLines.length > 0 
      ? originalLines.map(l => `▸ ${l.replace(/^[▸\-\*\d\.\s]+/g, '')}`).join('\n')
      : "▸ Master the key script framework.\n▸ Focus on value density.\n▸ Record 3 clips in parallel.";
    let cta = "Save this checklist for your next shoot and follow for more 🔥";
    
    const optimizedText = `${hook}\n\nHere is the exact workflow I use:\n\n${body}\n\n${cta}`;
    
    setContent(optimizedText);
    setOptimized(true);
    
    // Auto-run analysis with optimized text
    handleSubmit(undefined, optimizedText);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in-up font-dm-sans">
      {/* Header */}
      <div className="space-y-1 reveal">
        <p className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em] mb-2">Retainer Engine</p>
        <h2 className="font-playfair text-headline-lg text-primary">Viral Score Predictor</h2>
        <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
          Evaluate hooks, readability levels, emotional cues, and CTA effectiveness before publishing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Input Panel (Col 3) */}
        <div className="lg:col-span-3 space-y-6">
          <form
            onSubmit={(e) => { setOptimized(false); handleSubmit(e); }}
            className="glass border border-outline-variant/10 rounded-[32px] p-6 space-y-6 shadow-sm reveal stagger-1"
          >
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-outline uppercase tracking-widest select-none">
                Paste Content Copy
              </label>
              <motion.textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                transition={{ duration: 0.2 }}
                rows={7}
                placeholder="Paste your caption, script draft, thread, or email outline here..."
                className="w-full bg-surface-container-low border border-outline-variant/10 rounded-[18px] px-4 py-3 text-sm text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-150 resize-none font-sans"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="w-full sm:w-auto flex items-center gap-3 select-none">
                <span className="text-[10px] text-outline whitespace-nowrap uppercase tracking-widest font-bold">Channel:</span>
                <div className="relative">
                  <motion.select
                    value={platform}
                    onChange={(e) => setPlatform(e.target.value)}
                    whileFocus={{ scale: 1.005, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                    transition={{ duration: 0.2 }}
                    className="bg-surface-container-low border border-outline-variant/10 rounded-full px-5 py-2.5 text-xs text-on-surface focus:ring-2 focus:ring-primary/20 outline-none cursor-pointer appearance-none pr-10 font-semibold"
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>{p}</option>
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
                    <span>Auditing copywriting styles...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-sm">local_fire_department</span>
                    <span>Run Audit</span>
                  </>
                )}
              </motion.button>
            </div>
          </form>

          {/* Quick Optimize Workspace Drawer */}
          {result && !optimized && result.overall_score < 85 && !loading && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass border border-outline-variant/10 bg-primary-container/10 rounded-[24px] p-5 space-y-4 shadow-sm select-none reveal stagger-2"
            >
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-primary text-xl">rocket_launch</span>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Copy Optimization Workspace</h3>
                  <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                    Our analyzer detected weaknesses in your hook and call-to-action indicators. Let our algorithm auto-adjust the content structure to raise the performance probability.
                  </p>
                </div>
              </div>
              <motion.button
                onClick={handleOptimizeAction}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold rounded-full transition-all duration-150 cursor-pointer shadow-md shadow-primary/5"
              >
                🚀 Apply Auto-Hook & CTA Enhancer
              </motion.button>
            </motion.div>
          )}

          {optimized && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-xs text-emerald-700 flex items-center gap-2 select-none"
            >
              <span className="material-symbols-outlined text-sm">done</span>
              <span>Auto-Hook & CTA formats applied successfully. Score updated.</span>
            </motion.div>
          )}
        </div>

        {/* Results Panel (Col 2) */}
        <div className="lg:col-span-2 space-y-6 reveal stagger-2">
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-xs flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-sm">info</span> {error}
            </motion.div>
          )}

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              {/* Radial Meter Skeleton */}
              <div className="glass border border-outline-variant/10 rounded-[24px] p-6 text-center space-y-4 shadow-sm animate-pulse">
                <div className="h-4 bg-outline-variant/20 rounded w-1/3 mx-auto"></div>
                <div className="flex justify-center py-2">
                  <div className="w-32 h-32 rounded-full border-8 border-outline-variant/15 flex items-center justify-center">
                    <div className="h-6 bg-outline-variant/20 rounded w-12"></div>
                  </div>
                </div>
                <div className="h-4 bg-outline-variant/10 rounded w-2/3 mx-auto"></div>
              </div>

              {/* Breakdown Skeleton */}
              <div className="glass border border-outline-variant/10 rounded-[24px] p-6 space-y-4 shadow-sm animate-pulse">
                <div className="h-4 bg-outline-variant/20 rounded w-1/3 border-b border-outline-variant/10 pb-2"></div>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="h-4 bg-outline-variant/20 rounded w-1/4"></div>
                      <div className="h-4 bg-outline-variant/20 rounded w-10"></div>
                    </div>
                    <div className="w-full h-1.5 bg-outline-variant/10 rounded-full"></div>
                    <div className="h-3 bg-outline-variant/10 rounded w-5/6"></div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : result ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              {/* Radial Meter Card */}
              <div className={`glass border border-outline-variant/10 rounded-[24px] p-6 text-center space-y-4 shadow-sm select-none transition-all duration-500 ${
                result.overall_score >= 90 ? 'shadow-lg shadow-primary/10 ring-1 ring-primary/20 bg-primary/5' : ''
              }`}>
                <p className="text-[10px] font-bold text-outline uppercase tracking-widest font-semibold">Audited Virality Index</p>
                <div className="flex justify-center py-2">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    {/* SVG Progress Circle */}
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="64"
                        cy="64"
                        r="54"
                        stroke="#f4f2fa"
                        strokeWidth="8"
                        fill="transparent"
                      />
                      <motion.circle
                        cx="64"
                        cy="64"
                        r="54"
                        stroke={result.overall_score >= 80 ? '#6f5656' : result.overall_score >= 60 ? '#556256' : '#6c5754'}
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray={339}
                        initial={{ strokeDashoffset: 339 }}
                        animate={{ strokeDashoffset: 339 - (339 * result.overall_score) / 100 }}
                        transition={{ duration: 1.2, ease: 'easeOut' }}
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-3xl font-black font-mono leading-none ${getScoreTextColorClass(result.overall_score)}`}>
                        <CountUp start={0} end={result.overall_score} duration={1.2} />%
                      </span>
                      <span className="text-[9px] text-outline uppercase tracking-wider font-bold mt-1">Probability</span>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant leading-relaxed italic px-2 select-text">
                  &ldquo;{result.verdict}&rdquo;
                </p>
              </div>

              {/* Metric Breakdown Progress */}
              <div className="glass border border-outline-variant/10 rounded-[24px] p-6 space-y-4 shadow-sm">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline border-b border-outline-variant/10 pb-2.5 select-none font-semibold">Diagnostic Details</h3>
                <div className="space-y-4">
                  {result.breakdown.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 group">
                      <div className="flex justify-between text-xs font-semibold select-none">
                        <span className="text-on-surface">{item.metric}</span>
                        <span className={getScoreTextColorClass(item.score)}>{item.score}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden select-none">
                        <motion.div
                          className={`h-full rounded-full ${getMetricGradientClass(item.score)}`}
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1, ease: 'easeOut', delay: 0.15 + idx * 0.05 }}
                        />
                      </div>
                      <p className="text-[10px] text-outline leading-relaxed pt-0.5 group-hover:text-on-surface-variant transition-colors duration-300 select-text">
                        {item.feedback}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="glass border border-dashed border-outline-variant/30 rounded-[24px] p-12 text-center text-outline text-xs flex flex-col items-center justify-center gap-2 h-64 select-none animate-fade-in">
              <span className="material-symbols-outlined text-3xl">analytics</span>
              <span>Submit copy draft to compile algorithm retaining audits.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

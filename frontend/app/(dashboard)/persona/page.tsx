'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { motion, Variants } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

interface Persona {
  name: string;
  age: string | number;
  location: string;
  occupation: string;
  pain_points: string[];
  desires: string[];
  content_preferences: string[];
  platforms_used: string[];
  language_style: string;
  buying_triggers: string[];
  content_strategy_tips: string[];
}

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'LinkedIn'];

const PLATFORM_BADGE_COLORS: Record<string, string> = {
  youtube: 'text-red-650 bg-red-55 border-red-100',
  instagram: 'text-pink-655 bg-pink-55 border-pink-100',
  tiktok: 'text-teal-650 bg-teal-55 border-teal-100',
  twitter: 'text-sky-650 bg-sky-55 border-sky-100',
  linkedin: 'text-blue-650 bg-blue-55 border-blue-100',
  default: 'text-gray-650 bg-gray-55 border-gray-100',
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 25 } },
};

export default function PersonaPage() {
  const fetchBillingState = useAuthStore(state => state.fetchBillingState);
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setLoading(true);
    setError('');
    setPersona(null);

    try {
      const res = await api.post('/persona/generate', { niche, platform });
      const personaData = res.data.persona || res.data;
      setPersona(personaData);
      toast.success(`Dossier compiled for ${personaData.name}!`);
      fetchBillingState();
      
      // Save to local storage for dynamic dashboard
      try {
        const saved = localStorage.getItem('curate_ai_workspace_pieces') || '[]';
        const list = JSON.parse(saved);
        list.unshift({
          id: Date.now().toString(),
          title: `Persona: ${personaData.name}`,
          platform: platform.toLowerCase(),
          type: 'Audience Persona',
          status: 'Optimized',
          score: '93%',
          date: 'Just now',
          description: `Audience dossier for ${personaData.occupation} in the ${niche} niche.`
        });
        localStorage.setItem('curate_ai_workspace_pieces', JSON.stringify(list.slice(0, 12)));
      } catch (err) {
        console.error('Failed to save persona to workspace', err);
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Persona generation failed. Please verify that the backend API is running.';
      setError(msg);
      toast.error(msg);
      setPersona(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPersona = (data: Persona) => {
    const textStr = `Audience Persona Profile:
Name: ${data.name}
Occupation: ${data.occupation}
Age Range: ${data.age}
Location: ${data.location}

Pain Points:
${data.pain_points.map(p => `- ${p}`).join('\n')}

Desires:
${data.desires.map(d => `- ${d}`).join('\n')}

Content Strategy Rules:
${data.content_strategy_tips.map((t, idx) => `${idx + 1}. ${t}`).join('\n')}`;

    navigator.clipboard.writeText(textStr);
    setCopied(true);
    toast.success('Dossier copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in-up font-dm-sans">
      {/* Header */}
      <div className="space-y-1 reveal">
        <p className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em] mb-2">Audience Engine</p>
        <h2 className="font-playfair text-headline-lg text-primary">Audience Persona Builder</h2>
        <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
          Construct structured demographic profiles and psychographic maps to frame your core messaging.
        </p>
      </div>

      {/* Input Form */}
      <form
        onSubmit={handleSubmit}
        className="glass border border-outline-variant/10 rounded-[32px] p-6 space-y-6 shadow-sm reveal stagger-1"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest select-none">Target Niche</label>
            <motion.input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
              transition={{ duration: 0.2 }}
              placeholder="e.g. personal finance for Gen Z, SaaS developers..."
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-4 px-6 text-sm text-on-surface placeholder:text-outline/65 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-150"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest select-none">Social Platform</label>
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
            disabled={loading || !niche.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary-container disabled:bg-surface-container-low text-on-primary disabled:text-outline/50 font-semibold text-xs rounded-full transition-all duration-150 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-primary/5"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                <span>Compiling psychographic dossier...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">psychology</span>
                <span>Build Profile</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Error Info */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-xs flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">info</span> {error}
        </motion.div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          <div className="glass border border-outline-variant/10 rounded-[24px] overflow-hidden shadow-sm animate-pulse">
            <div className="p-6 md:p-8 bg-white/20 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-outline-variant/20 rounded-xl"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-outline-variant/20 rounded w-24"></div>
                  <div className="h-3 bg-outline-variant/10 rounded w-20"></div>
                </div>
              </div>
              <div className="flex gap-2.5">
                <div className="h-7 w-20 bg-outline-variant/20 rounded-lg"></div>
                <div className="h-7 w-20 bg-outline-variant/20 rounded-lg"></div>
                <div className="h-7 w-24 bg-outline-variant/20 rounded-lg"></div>
              </div>
            </div>
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="h-3 bg-outline-variant/20 rounded w-24"></div>
                  <div className="h-12 bg-outline-variant/10 rounded-xl"></div>
                  <div className="h-12 bg-outline-variant/10 rounded-xl"></div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-outline-variant/20 rounded w-24"></div>
                  <div className="h-12 bg-outline-variant/10 rounded-xl"></div>
                  <div className="h-12 bg-outline-variant/10 rounded-xl"></div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-16 bg-outline-variant/10 rounded-xl"></div>
                <div className="h-24 bg-outline-variant/10 rounded-xl"></div>
                <div className="h-16 bg-outline-variant/10 rounded-xl"></div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Persona Dashboard Grid */}
      {persona && !loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-8 reveal stagger-2"
        >
          {/* Main profile card */}
          <motion.div
            variants={itemVariants}
            className="glass border border-outline-variant/10 rounded-[24px] overflow-hidden shadow-sm"
          >
            {/* Header profile banner */}
            <div className="p-6 md:p-8 bg-white/20 border-b border-outline-variant/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 select-none">
              <div className="flex items-center gap-4">
                <span className="w-12 h-12 bg-primary/10 border border-outline-variant/20 text-xl flex items-center justify-center rounded-xl text-primary font-bold">
                  <span className="material-symbols-outlined text-xl">person</span>
                </span>
                <div>
                  <h2 className="text-sm font-bold text-gray-900 tracking-tight">{persona.name}</h2>
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-wide mt-0.5">{persona.occupation}</p>
                </div>
              </div>

              {/* Meta stats tags */}
              <div className="flex flex-wrap gap-2.5">
                <span className="bg-white/40 border border-outline-variant/15 text-[9px] text-outline font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                  🎂 Age {persona.age}
                </span>
                <span className="bg-white/40 border border-outline-variant/15 text-[9px] text-outline font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg">
                  📍 {persona.location}
                </span>
                <motion.button
                  type="button"
                  onClick={() => handleCopyPersona(persona)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`px-3 py-1.5 rounded-lg border text-[9px] uppercase font-bold tracking-wider transition-colors cursor-pointer flex items-center gap-1.5 ${
                    copied
                      ? 'bg-secondary-container/40 border-secondary-container text-secondary'
                      : 'bg-white/50 border-outline-variant/30 text-outline hover:text-primary hover:border-primary/40'
                  }`}
                >
                  {copied ? '✓ Profile Copied' : '📋 Copy Profile'}
                </motion.button>
              </div>
            </div>

            {/* Structured Info Panels */}
            <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left Column: Psychological pain vs goals */}
              <div className="space-y-6">
                {/* Pain Points Card */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline select-none">😣 Critical Pain Points</h3>
                  <div className="space-y-2">
                    {persona.pain_points.map((p, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + idx * 0.05 }}
                        className="bg-red-50/20 border border-red-200/60 text-xs text-red-950 px-3.5 py-2.5 rounded-xl leading-relaxed flex items-start gap-2.5 select-text"
                      >
                        <span className="text-red-500 font-bold mt-0.5">✗</span>
                        <span>{p}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Desires Card */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline select-none">✨ Desired Outcomes</h3>
                  <div className="space-y-2">
                    {persona.desires.map((d, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 + idx * 0.05 }}
                        className="bg-emerald-50/20 border border-emerald-250 text-xs text-emerald-950 px-3.5 py-2.5 rounded-xl leading-relaxed flex items-start gap-2.5 select-text"
                      >
                        <span className="text-emerald-500 font-bold mt-0.5">✓</span>
                        <span>{d}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Platform details & behaviors */}
              <div className="space-y-6">
                {/* Channels & formats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 select-none">
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline">🌐 Active Channels</h3>
                    <div className="flex flex-wrap gap-1.5">
                      {persona.platforms_used.map((plat) => {
                        const platKey = plat.toLowerCase();
                        const colorClass = PLATFORM_BADGE_COLORS[platKey] || PLATFORM_BADGE_COLORS.default;
                        return (
                          <span key={plat} className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wider border ${colorClass}`}>
                            {plat}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline">🛍 Triggers</h3>
                    <div className="flex flex-wrap gap-1">
                      {persona.buying_triggers.slice(0, 3).map((trig, i) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-secondary-container/40 border border-secondary-container/60 text-secondary text-[9px] font-bold uppercase tracking-wider leading-relaxed">
                          ⚡ {trig.split(' ')[0]} trigger
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Content Preferences */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline select-none">📱 Content Preferences</h3>
                  <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-4 space-y-2 text-xs text-on-surface-variant">
                    {persona.content_preferences.map((pref, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <span className="text-primary font-bold">•</span>
                        <span className="select-text">{pref}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Language Style */}
                <div className="space-y-3">
                  <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline select-none">🗣 Copy/Language Style</h3>
                  <div className="bg-surface-container-low border border-outline-variant/10 rounded-xl p-4 text-xs text-on-surface-variant leading-relaxed italic select-text">
                    &ldquo;{persona.language_style}&rdquo;
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Strategy Section */}
          <div className="space-y-4">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline select-none">🎯 Content Engagement Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {persona.content_strategy_tips.slice(0, 3).map((tip, idx) => (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  className="glass border border-outline-variant/10 p-4 rounded-[20px] space-y-2 shadow-sm"
                >
                  <div className="flex items-center gap-2 select-none">
                    <span className="w-6 h-6 rounded bg-primary/10 text-primary border border-outline-variant/20 text-[9px] font-bold flex items-center justify-center animate-pulse">
                      0{idx + 1}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-outline">Rule</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed select-text">{tip}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}

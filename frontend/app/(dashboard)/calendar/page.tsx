'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { toast } from 'sonner';

interface CalendarDay {
  day: number;
  day_name: string;
  topic: string;
  content_type: string;
  best_time: string;
  trending_angle: string;
}

const PLATFORMS = ['YouTube', 'Instagram', 'TikTok', 'Twitter', 'LinkedIn'];

const CONTENT_TYPE_COLORS: Record<string, string> = {
  reel: 'text-purple-600 bg-purple-50 border-purple-100',
  carousel: 'text-amber-600 bg-amber-50 border-amber-100',
  story: 'text-pink-600 bg-pink-50 border-pink-100',
  'long-form': 'text-blue-600 bg-blue-50 border-blue-100',
  live: 'text-red-650 bg-red-50 border-red-100',
  short: 'text-teal-650 bg-teal-50 border-teal-100',
  poll: 'text-green-650 bg-green-50 border-green-100',
  thread: 'text-sky-650 bg-sky-50 border-sky-100',
  default: 'text-gray-650 bg-gray-50 border-gray-100',
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04
    }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, scale: 0.96, y: 12 },
  show: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 22 } }
};

const backdropVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 }
};

const modalVariants: Variants = {
  hidden: { opacity: 0, scale: 0.93, y: 15 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } },
  exit: { opacity: 0, scale: 0.95, y: 10, transition: { duration: 0.15 } }
};

export default function CalendarPage() {
  const [niche, setNiche] = useState('');
  const [platform, setPlatform] = useState('Instagram');
  const [days, setDays] = useState(7);
  const [calendar, setCalendar] = useState<CalendarDay[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Modal State
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!niche.trim()) return;
    setLoading(true);
    setError('');
    setCalendar([]);

    try {
      const res = await api.post('/calendar/generate', { niche, platform, days });
      const calendarData = res.data.calendar || res.data;
      setCalendar(calendarData);
      toast.success(`Generated a strategic ${days}-day content calendar!`);
      
      // Save to local storage for dynamic dashboard
      try {
        const saved = localStorage.getItem('curate_ai_workspace_pieces') || '[]';
        const list = JSON.parse(saved);
        list.unshift({
          id: Date.now().toString(),
          title: `Calendar: ${niche}`,
          platform: platform.toLowerCase(),
          type: 'Content Calendar',
          status: 'Scheduled',
          score: '95%',
          date: 'Just now',
          description: `Planned a ${days}-day content calendar strategy for ${platform}.`
        });
        localStorage.setItem('curate_ai_workspace_pieces', JSON.stringify(list.slice(0, 12)));
      } catch (err) {
        console.error('Failed to save calendar to workspace', err);
      }
    } catch {
      const msg = 'Calendar generation failed. Please verify that the backend API is running.';
      setError(msg);
      toast.error(msg);
      setCalendar([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleChecklistItem = (key: string) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Day plan details copied to clipboard!');
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto animate-fade-in-up relative select-none font-dm-sans">
      {/* Header */}
      <div className="space-y-1 reveal">
        <p className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em] mb-2">Strategic Planner</p>
        <h2 className="font-playfair text-headline-lg text-primary">Content Calendar Planner</h2>
        <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
          Establish niche topics, content format distributions, and schedule posts based on high-traffic times.
        </p>
      </div>

      {/* Input Frame */}
      <form
        onSubmit={handleSubmit}
        className="glass border border-outline-variant/10 rounded-[32px] p-6 space-y-6 shadow-sm reveal stagger-1"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Niche / Topic Niche</label>
            <motion.input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
              transition={{ duration: 0.2 }}
              placeholder="e.g. weight loss, UI design, stock trading..."
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-4 px-6 text-sm text-on-surface placeholder:text-outline/60 focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-150"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Social Platform</label>
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
          <div className="space-y-2">
            <label className="text-[10px] font-bold text-outline uppercase tracking-widest">Total Days</label>
            <motion.input
              type="number"
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
              transition={{ duration: 0.2 }}
              min={1}
              max={30}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-4 px-6 text-sm text-on-surface focus:ring-2 focus:ring-primary/20 outline-none transition-all duration-150"
            />
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
                <span>Structuring calendar grid...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">calendar_today</span>
                <span>Generate Plan</span>
              </>
            )}
          </motion.button>
        </div>
      </form>

      {/* Error Notice */}
      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-xs flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-sm">info</span> {error}
        </motion.div>
      )}

      {/* Interactive Helper Text */}
      {calendar.length > 0 && !loading && (
        <div className="text-[10px] text-outline font-bold uppercase tracking-widest text-center flex items-center justify-center gap-1.5 reveal">
          <span className="material-symbols-outlined text-xs">info</span>
          <span>Click any day card to open the interactive Visual Production Drawer</span>
        </div>
      )}

      {/* Skeleton loading grid */}
      {loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
        >
          {Array.from({ length: days || 7 }).map((_, idx) => (
            <div
              key={idx}
              className="glass border border-outline-variant/10 rounded-[24px] p-5 space-y-6 animate-pulse"
            >
              <div className="flex justify-between items-center">
                <div className="h-8 w-8 rounded-full bg-outline-variant/20"></div>
                <div className="h-4 bg-outline-variant/20 rounded w-16"></div>
              </div>
              <div className="h-6 bg-outline-variant/10 rounded w-5/6"></div>
              <div className="space-y-2 border-t border-outline-variant/10 pt-4">
                <div className="h-4 bg-outline-variant/20 rounded w-1/3"></div>
                <div className="h-3 bg-outline-variant/10 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      {/* Calendar Grid */}
      {calendar.length > 0 && !loading && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 reveal stagger-2"
        >
          {calendar.map((item, idx) => {
            const cleanType = item.content_type.toLowerCase();
            const badgeClass = CONTENT_TYPE_COLORS[cleanType] || CONTENT_TYPE_COLORS.default;
            return (
              <motion.button
                key={idx}
                type="button"
                variants={itemVariants}
                onClick={() => {
                  setSelectedDay(item);
                  setChecklist({}); // Reset checklist on selection
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="glass border border-outline-variant/10 hover:shadow-2xl transition-all duration-500 rounded-[24px] p-5 text-left flex flex-col justify-between gap-4 group cursor-pointer"
              >
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="w-8 h-8 rounded-full bg-primary/10 border border-outline-variant/20 text-[10px] font-black text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                      D{item.day}
                    </span>
                    <span className="text-[10px] text-outline font-bold uppercase tracking-widest">{item.day_name}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-on-background leading-snug group-hover:text-primary transition-colors select-text">
                    {item.topic}
                  </h3>
                </div>

                <div className="space-y-3">
                  <span className={`inline-block px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${badgeClass}`}>
                    {item.content_type}
                  </span>
                  <div className="text-[9px] text-outline font-semibold uppercase tracking-wider flex items-center gap-1.5 border-t border-outline-variant/10 pt-2.5">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    <span>Post at {item.best_time}</span>
                  </div>
                </div>
              </motion.button>
            );
          })}
        </motion.div>
      )}

      {/* Production Overlay Drawer (Modal) */}
      <AnimatePresence>
        {selectedDay && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setSelectedDay(null)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-dm-sans"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="glass border border-outline-variant/15 rounded-[32px] max-w-xl w-full p-6 md:p-8 space-y-6 shadow-xl relative"
            >
              {/* Close Button */}
              <motion.button
                onClick={() => setSelectedDay(null)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-4 top-4 w-8 h-8 rounded-full border border-outline-variant/30 text-outline hover:text-primary hover:border-primary bg-white/50 flex items-center justify-center transition-all cursor-pointer font-bold text-sm"
              >
                ✕
              </motion.button>

              {/* Header info */}
              <div className="border-b border-outline-variant/10 pb-4 pr-6">
                <div className="flex items-center gap-2 text-[10px] font-bold uppercase text-outline tracking-wider mb-1">
                  <span>📅 Day {selectedDay.day} Production Dashboard</span>
                  <span>•</span>
                  <span>{selectedDay.day_name}</span>
                </div>
                <h2 className="text-lg font-playfair font-bold text-primary leading-tight select-text">
                  {selectedDay.topic}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wider ${
                    CONTENT_TYPE_COLORS[selectedDay.content_type.toLowerCase()] || CONTENT_TYPE_COLORS.default
                  }`}>
                    {selectedDay.content_type}
                  </span>
                  <span className="text-[10px] text-outline font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-xs">schedule</span>
                    <span>Target Post Time: {selectedDay.best_time}</span>
                  </span>
                </div>
              </div>

              {/* Visual B-Roll Plan */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline">Recommended Visual Plan</h3>
                <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-xl space-y-2 text-xs leading-relaxed text-on-surface-variant">
                  <p className="text-on-surface font-bold">Trending Hook Angle:</p>
                  <p className="italic bg-white/60 p-2.5 rounded border border-outline-variant/10 text-on-surface-variant mb-2 select-text">{selectedDay.trending_angle}</p>
                  <div className="space-y-1.5 pt-1">
                    <p className="text-outline uppercase text-[9px] font-bold">Suggested Shot Plan:</p>
                    <p>📸 Scene 1: Close-up talking head establishing the core myth or concept.</p>
                    <p>⚡ Scene 2: Screencast/B-roll overlay illustrating the problem step-by-step.</p>
                  </div>
                </div>
              </div>

              {/* Checklist items */}
              <div className="space-y-2">
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline">Production Checklist</h3>
                <div className="space-y-1.5">
                  {[
                    'Draft Platform Script / Outline',
                    'Record audio/voiceover track',
                    'Add visual text overlays and captions',
                    'Format caption copy & hash elements',
                    'Publish at scheduled window (' + selectedDay.best_time + ')'
                  ].map((item, idx) => {
                    const itemKey = `item_${idx}`;
                    const isChecked = !!checklist[itemKey];
                    return (
                      <motion.button
                        key={idx}
                        onClick={() => toggleChecklistItem(itemKey)}
                        whileHover={{ scale: 1.005 }}
                        whileTap={{ scale: 0.995 }}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border border-outline-variant/10 hover:border-outline-variant/30 bg-white/30 hover:bg-white/70 text-left transition-all cursor-pointer text-xs"
                      >
                        <motion.span
                          layout
                          className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] ${
                            isChecked
                              ? 'bg-primary border-primary text-white font-bold'
                              : 'border-outline-variant/40 bg-white/50 text-transparent'
                          }`}
                        >
                          {isChecked && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="material-symbols-outlined text-[10px]"
                            >
                              done
                            </motion.span>
                          )}
                        </motion.span>
                        <span className={isChecked ? 'line-through text-outline' : 'text-on-surface font-medium'}>
                          {item}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Utility Drawer Footer */}
              <div className="flex justify-between items-center pt-2">
                <span className="text-[10px] text-outline font-medium">Checklist state preserved.</span>
                <motion.button
                  onClick={() => {
                    const copyString = `Topic: ${selectedDay.topic}\nFormat: ${selectedDay.content_type}\nBest time: ${selectedDay.best_time}\nAngle: ${selectedDay.trending_angle}`;
                    handleCopyText(copyString);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-5 py-2.5 bg-primary hover:bg-primary-container text-on-primary font-semibold text-xs rounded-full transition-all shadow-md shadow-primary/5 flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-xs">content_copy</span>
                  <span>Copy Day Details</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

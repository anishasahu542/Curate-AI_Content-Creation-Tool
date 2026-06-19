'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import CountUp from 'react-countup';
import { motion } from 'framer-motion';

interface SocialIntegration {
  connected: boolean;
  username: string;
  followers: string;
}

interface IntegrationsMap {
  [key: string]: SocialIntegration;
}

const SOCIAL_EMOJIS: Record<string, string> = {
  youtube: '🎬',
  instagram: '📸',
  tiktok: '🎵',
  twitter: '🐦',
  linkedin: '💼',
};

const SOCIAL_NAMES: Record<string, string> = {
  youtube: 'YouTube',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  twitter: 'Twitter/X',
  linkedin: 'LinkedIn',
};

function parseFollowers(val: string | undefined): number {
  if (!val) return 0;
  const cleaned = val.trim().toUpperCase().replace(/,/g, '');
  if (cleaned.endsWith('K')) {
    return parseFloat(cleaned.slice(0, -1)) * 1000;
  }
  if (cleaned.endsWith('M')) {
    return parseFloat(cleaned.slice(0, -1)) * 1000000;
  }
  if (cleaned.endsWith('B')) {
    return parseFloat(cleaned.slice(0, -1)) * 1000000000;
  }
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

function formatFollowers(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

export default function DashboardPage() {
  const [integrations, setIntegrations] = useState<IntegrationsMap>({});
  const [recentPosts, setRecentPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchIntegrations = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/users/integrations');
      setIntegrations(res.data);
    } catch (err) {
      console.error('Failed to load integrations, using fallback', err);
      setError('API Offline — Please run the backend server.');
      setIntegrations({
        youtube: { connected: false, username: '', followers: '' },
        instagram: { connected: false, username: '', followers: '' },
        tiktok: { connected: false, username: '', followers: '' },
        twitter: { connected: false, username: '', followers: '' },
        linkedin: { connected: false, username: '', followers: '' }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
    
    // Load dynamic workspace pieces from localStorage
    const saved = localStorage.getItem('curate_ai_workspace_pieces');
    if (saved) {
      try {
        setRecentPosts(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse workspace pieces', e);
      }
    }
  }, []);

  // Compute metrics
  const activePlatformsCount = Object.values(integrations).filter(item => item.connected).length;
  
  const totalFollowersCount = Object.values(integrations)
    .filter(item => item.connected)
    .reduce((sum, item) => sum + parseFollowers(item.followers), 0);

  const formattedReach = formatFollowers(totalFollowersCount);

  return (
    <div className="space-y-12 max-w-7xl mx-auto animate-fade-in-up">
      {/* Header / Hero Section */}
      <header className="reveal font-dm-sans">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-6 border-b border-outline-variant/10">
          <div>
            <p className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em] mb-2">Workspace Overview</p>
            <h2 className="font-playfair text-headline-lg text-primary">Welcome, Curate.</h2>
          </div>
          <div className="relative w-full max-w-xl group">
            <span className="material-symbols-outlined absolute left-5 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">search</span>
            <input 
              className="w-full bg-surface-container-low border-none rounded-full py-4 pl-14 pr-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none" 
              placeholder="Search your creative universe..." 
              type="text"
            />
          </div>
        </div>
      </header>

      {error && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-700 text-xs flex items-center gap-2 select-none animate-scale-up">
          <span className="material-symbols-outlined text-sm">info</span> {error}
        </div>
      )}

      {/* Expanded Insights (Horizontally oriented metrics) */}
      <section className="reveal stagger-1 font-dm-sans">
        <div className="glass rounded-[32px] p-8 border border-outline-variant/10 shadow-sm hover-glow">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-playfair text-headline-md text-primary">Performance Insights</h3>
            <button 
              onClick={fetchIntegrations} 
              disabled={loading}
              className="text-primary font-label-md text-label-md flex items-center gap-1.5 hover:opacity-60 transition-opacity cursor-pointer"
            >
              <span>{loading ? 'Syncing...' : 'Sync Stats'}</span>
              <span className={`material-symbols-outlined text-sm ${loading ? 'animate-spin' : ''}`}>sync</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Metric 1: Audience Reach */}
            <div className="space-y-4">
              <p className="text-outline font-label-md text-label-md">Audience Reach</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-playfair text-primary font-semibold">
                  {loading ? '...' : (
                    <CountUp
                      end={totalFollowersCount}
                      duration={1.5}
                      formattingFn={formatFollowers}
                      enableScrollSpy
                      scrollSpyOnce
                    />
                  )}
                </span>
                <span className="text-secondary text-sm font-bold flex items-center mb-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span> 12%
                </span>
              </div>
              <div className="h-12 flex items-end gap-1">
                <div className="w-full bg-secondary-container rounded-t-sm h-[40%] transition-all hover:h-[50%]"></div>
                <div className="w-full bg-secondary-container rounded-t-sm h-[60%] transition-all hover:h-[70%]"></div>
                <div className="w-full bg-primary-container rounded-t-sm h-[85%] transition-all hover:h-[95%]"></div>
                <div className="w-full bg-secondary-container rounded-t-sm h-[45%] transition-all hover:h-[55%]"></div>
                <div className="w-full bg-secondary-container rounded-t-sm h-[70%] transition-all hover:h-[80%]"></div>
              </div>
            </div>

            {/* Metric 2: Avg. Engagement */}
            <div className="space-y-4">
              <p className="text-outline font-label-md text-label-md">Avg. Engagement</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-playfair text-primary font-semibold">
                  <CountUp
                    end={4.2}
                    decimals={1}
                    suffix="%"
                    duration={1.5}
                    enableScrollSpy
                    scrollSpyOnce
                  />
                </span>
                <span className="text-secondary text-sm font-bold flex items-center mb-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span> 0.8%
                </span>
              </div>
              <div className="h-12 flex items-end gap-1">
                <div className="w-full bg-tertiary-fixed-dim rounded-t-sm h-[30%]"></div>
                <div className="w-full bg-tertiary-fixed-dim rounded-t-sm h-[55%]"></div>
                <div className="w-full bg-tertiary-fixed-dim rounded-t-sm h-[40%]"></div>
                <div className="w-full bg-tertiary-container rounded-t-sm h-[75%]"></div>
                <div className="w-full bg-tertiary-fixed-dim rounded-t-sm h-[50%]"></div>
              </div>
            </div>

            {/* Metric 3: Active Channels */}
            <div className="space-y-4">
              <p className="text-outline font-label-md text-label-md">Active Channels</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-playfair text-primary font-semibold">
                  {loading ? '...' : (
                    <>
                      <CountUp
                        end={activePlatformsCount}
                        duration={1.5}
                        enableScrollSpy
                        scrollSpyOnce
                      />
                      {' / 5'}
                    </>
                  )}
                </span>
                <span className="text-secondary text-sm font-bold flex items-center mb-1">
                  <span className="material-symbols-outlined text-xs">trending_up</span> 5%
                </span>
              </div>
              <div className="h-12 flex items-end gap-1">
                <div className="w-full bg-secondary-fixed-dim rounded-t-sm h-[60%]"></div>
                <div className="w-full bg-secondary-fixed-dim rounded-t-sm h-[40%]"></div>
                <div className="w-full bg-secondary-fixed-dim rounded-t-sm h-[80%]"></div>
                <div className="w-full bg-secondary-fixed-dim rounded-t-sm h-[55%]"></div>
                <div className="w-full bg-secondary-fixed-dim rounded-t-sm h-[90%]"></div>
              </div>
            </div>

            {/* Metric 4: Engine Status */}
            <div className="space-y-4">
              <p className="text-outline font-label-md text-label-md">Engine Status</p>
              <div className="flex items-end gap-3">
                <span className="text-3xl font-playfair text-primary text-emerald-700 font-semibold">Online</span>
                <span className="text-emerald-700 text-sm font-bold flex items-center mb-1">
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse mr-1"></span> Stable
                </span>
              </div>
              <div className="h-12 flex items-end gap-1">
                <div className="w-full bg-outline-variant rounded-t-sm h-[70%]"></div>
                <div className="w-full bg-outline-variant rounded-t-sm h-[60%]"></div>
                <div className="w-full bg-outline-variant rounded-t-sm h-[50%]"></div>
                <div className="w-full bg-outline-variant rounded-t-sm h-[40%]"></div>
                <div className="w-full bg-outline-variant rounded-t-sm h-[30%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Pieces (Masonry Grid) */}
      <section className="reveal stagger-2 font-dm-sans">
        <div className="flex items-center justify-between mb-8">
          <h3 className="font-playfair text-headline-md text-primary">Recent Pieces</h3>
          <div className="flex gap-4">
            <button className="px-6 py-2 rounded-full border border-outline-variant text-label-md font-label-md hover:bg-surface-variant/30 hover-scale transition-all cursor-pointer">Filter</button>
            <button className="px-6 py-2 rounded-full bg-surface-container-high text-label-md font-label-md hover-scale transition-all cursor-pointer">Sort by Date</button>
          </div>
        </div>
        
        <motion.div 
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          initial="hidden"
          animate="show"
          className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
        >
          {/* Card 1 (Synchronization Nodes - Custom Card) */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="break-inside-avoid glass rounded-[24px] p-6 border border-outline-variant/10 group hover:shadow-2xl transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4 border-b border-outline-variant/10 pb-2">
              <div>
                <h4 className="font-playfair text-lg text-primary">Sync Nodes</h4>
                <p className="text-xs text-outline">Social media integrations</p>
              </div>
              <Link href="/profile" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <span>Manage</span>
                <span className="material-symbols-outlined text-sm">settings</span>
              </Link>
            </div>
            
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="animate-pulse flex items-center justify-between border border-outline-variant/10 rounded-xl p-3 bg-white/40">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-outline-variant/20 rounded-lg"></div>
                      <div className="space-y-1">
                        <div className="h-3 w-16 bg-outline-variant/20 rounded"></div>
                        <div className="h-2 w-10 bg-outline-variant/20 rounded"></div>
                      </div>
                    </div>
                    <div className="h-4 w-12 bg-outline-variant/20 rounded-full"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {Object.entries(integrations).map(([key, val]) => {
                  const name = SOCIAL_NAMES[key] || key;
                  const emoji = SOCIAL_EMOJIS[key] || '🔗';
                  return (
                    <div 
                      key={key} 
                      className={`flex items-center justify-between border rounded-xl p-3 bg-white/40 hover:bg-white/85 transition-all duration-150 ${
                        val.connected ? 'border-outline-variant/30' : 'border-outline-variant/10 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-lg bg-white border border-outline-variant/10 p-1.5 rounded-lg flex items-center justify-center select-none">
                          {emoji}
                        </span>
                        <div>
                          <h5 className="text-xs font-bold text-gray-900 select-none">{name}</h5>
                          {val.connected ? (
                            <p className="text-[9px] text-gray-500 mt-0.5 select-text font-semibold line-clamp-1 max-w-[80px]">
                              {val.username}
                            </p>
                          ) : (
                            <p className="text-[9px] text-gray-400 mt-0.5 select-none font-medium">Inactive</p>
                          )}
                        </div>
                      </div>

                      <div>
                        {val.connected ? (
                          <span className="text-[10px] font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full select-text">
                            {val.followers}
                          </span>
                        ) : (
                          <Link href="/profile">
                            <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 px-2 py-1 rounded transition-colors select-none cursor-pointer border border-indigo-100">
                              Link
                            </span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>

          {/* Render User Generated Pieces */}
          {recentPosts.map((post) => {
            const isNew = Date.now() - Number(post.id) < 5000;
            return (
              <motion.div 
                key={post.id} 
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  show: { opacity: 1, y: 0 }
                }}
                animate={isNew ? {
                  scale: [0.95, 1],
                  opacity: [0, 1],
                  boxShadow: ["0 0 0px rgba(111,86,86,0)", "0 0 20px rgba(111,86,86,0.3)", "0 0 0px rgba(111,86,86,0)"],
                  borderColor: ["rgba(211,195,194,0.1)", "rgba(111,86,86,0.4)", "rgba(211,195,194,0.1)"]
                } : undefined}
                whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
                transition={{ duration: isNew ? 1.0 : 0.25, ease: "easeOut" }}
                className="break-inside-avoid glass rounded-[24px] p-6 border border-outline-variant/10 group cursor-pointer hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-[10px] font-bold uppercase tracking-wider">
                    {post.type}
                  </span>
                  <span className="text-outline text-xs">{post.date}</span>
                </div>
                <h4 className="font-playfair text-lg text-primary mb-2 leading-snug">{post.title}</h4>
                <p className="text-on-surface-variant text-xs leading-relaxed mb-4">{post.description}</p>
                <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-lg bg-surface-container-lowest border border-outline-variant/10 p-1.5 rounded-lg flex items-center justify-center select-none shadow-sm">
                      {SOCIAL_EMOJIS[post.platform] || '🔗'}
                    </span>
                    <span className="text-xs font-semibold text-on-surface capitalize">{post.platform}</span>
                  </div>
                  <span className="text-xs font-bold font-mono text-primary bg-primary/10 px-2.5 py-0.5 rounded-full">
                    {post.score}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* Interactive Placeholder / Call-to-action Card */}
          <motion.div 
            variants={{
              hidden: { opacity: 0, y: 20 },
              show: { opacity: 1, y: 0 }
            }}
            whileHover={{ y: -4, boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04)" }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="break-inside-avoid glass rounded-[24px] p-6 border border-dashed border-outline-variant/40 group hover:border-primary/50 transition-all duration-300 flex flex-col justify-between min-h-[220px] text-center"
          >
            <div className="py-4 space-y-2 select-none">
              <motion.span 
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
                className="material-symbols-outlined text-primary text-3xl inline-block"
              >
                auto_awesome
              </motion.span>
              <h4 className="font-playfair text-lg text-primary">Start Generating</h4>
              <p className="text-xs text-outline leading-relaxed">Create scripts, calendars, hooks, or personas to populate your workspace.</p>
            </div>
            <div className="flex gap-2">
              <Link href="/generate" className="flex-1 py-2 bg-primary text-on-primary font-semibold text-xs rounded-xl hover:scale-[1.02] active:scale-95 transition-all text-center cursor-pointer shadow-sm">
                Create Script
              </Link>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <footer className="mt-20 mb-10 text-center text-outline text-sm font-dm-sans">
        <p>© 2026 Curate AI. Designed for a serene creative experience.</p>
      </footer>
    </div>
  );
}
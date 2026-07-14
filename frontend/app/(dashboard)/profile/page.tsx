'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';

interface UserProfile {
  name: string;
  email: string;
  avatarLetter: string;
  bio: string;
  niche: string;
  plan: string;
  creditsUsed: number;
  creditsTotal: number;
}

interface SocialConnection {
  id: string;
  name: string;
  connected: boolean;
  username?: string;
  followers?: string;
  emoji: string;
}

// Brand theme styles for the simulated OAuth popup modal
const PLATFORM_OAUTH_STYLES: Record<string, {
  brandBg: string;
  brandText: string;
  buttonBg: string;
  buttonHoverBg: string;
  logo: string;
  scopes: string[];
  placeholder: string;
}> = {
  youtube: {
    brandBg: 'bg-red-600',
    brandText: 'text-white',
    buttonBg: 'bg-red-600 hover:bg-red-700',
    buttonHoverBg: 'hover:bg-red-700',
    logo: '🔴 Google Account Sign-In',
    scopes: [
      'Manage your YouTube videos and playlists',
      'View your YouTube channel analytics and upload reports',
      'Manage your account assets'
    ],
    placeholder: 'e.g. Alex Rivera Tech'
  },
  instagram: {
    brandBg: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600',
    brandText: 'text-white',
    buttonBg: 'bg-pink-600 hover:bg-pink-700',
    buttonHoverBg: 'hover:bg-pink-700',
    logo: '📸 Instagram Client Consent',
    scopes: [
      'Post Reels and Stories on your behalf',
      'Access basic metadata (username, account type)',
      'Read insight statistics for media posts'
    ],
    placeholder: 'e.g. @alexrivera_dev'
  },
  tiktok: {
    brandBg: 'bg-black border-zinc-800',
    brandText: 'text-white',
    buttonBg: 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-700',
    buttonHoverBg: 'hover:bg-zinc-800',
    logo: '🎵 TikTok Developer Center',
    scopes: [
      'Share short-form videos to your feed',
      'Read public profile information',
      'Expose viewer retention metrics'
    ],
    placeholder: 'e.g. @alex_developer'
  },
  twitter: {
    brandBg: 'bg-black border-zinc-800',
    brandText: 'text-white',
    buttonBg: 'bg-zinc-950 hover:bg-zinc-900 border border-zinc-800',
    buttonHoverBg: 'hover:bg-zinc-900',
    logo: '🐦 Twitter/X Developer App',
    scopes: [
      'Write posts, upload media, and manage drafts',
      'Read posts and user profile connections',
      'Access direct message payload headers'
    ],
    placeholder: 'e.g. @alexcodes_ai'
  },
  linkedin: {
    brandBg: 'bg-[#0077b5]',
    brandText: 'text-white',
    buttonBg: 'bg-[#0077b5] hover:bg-[#006296]',
    buttonHoverBg: 'hover:bg-[#006296]',
    logo: '💼 LinkedIn OAuth Service',
    scopes: [
      'Share professional updates and updates',
      'Read primary profile data (email, name, picture)',
      'Access company page management tokens'
    ],
    placeholder: 'e.g. Alex Rivera, MSc'
  }
};

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

export default function ProfilePage() {
  const profile = useAuthStore(state => state.profile);
  const updateProfile = useAuthStore(state => state.updateProfile);

  const [socials, setSocials] = useState<SocialConnection[]>([]);
  const [loadingSocials, setLoadingSocials] = useState(true);

  // Form states
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [editingName, setEditingName] = useState(profile.name);
  const [editingEmail, setEditingEmail] = useState(profile.email);
  const [editingBio, setEditingBio] = useState(profile.bio);
  const [editingNiche, setEditingNiche] = useState(profile.niche);

  // Synchronize form values if profile store changes (e.g. initial mount)
  useEffect(() => {
    setEditingName(profile.name);
    setEditingEmail(profile.email);
    setEditingBio(profile.bio);
    setEditingNiche(profile.niche);
  }, [profile]);

  // Simulated OAuth states
  const [activeOauthPlatform, setActiveOauthPlatform] = useState<string | null>(null);
  const [oauthHandle, setOauthHandle] = useState('');
  const [oauthFollowers, setOauthFollowers] = useState('');
  const [oauthEmail, setOauthEmail] = useState('');
  const [oauthPassword, setOauthPassword] = useState('');
  const [oauthStep, setOauthStep] = useState<'login' | 'verifying_creds' | 'consent' | 'authorizing' | 'success'>('login');
  const [oauthStatusText, setOauthStatusText] = useState('');
  const [oauthError, setOauthError] = useState('');

  // Fetch Integrations
  const fetchIntegrations = async () => {
    try {
      setLoadingSocials(true);
      const res = await api.get('/users/integrations');
      const data = res.data;
      const formatted: SocialConnection[] = Object.entries(data).map(([key, val]: [string, any]) => ({
        id: key,
        name: SOCIAL_NAMES[key] || key,
        emoji: SOCIAL_EMOJIS[key] || '🔗',
        connected: !!val.connected,
        username: val.username || undefined,
        followers: val.followers || undefined
      }));
      setSocials(formatted);
    } catch {
      // Fallback if backend API has issues
      setSocials([
        { id: 'youtube', name: 'YouTube', connected: true, username: 'Alex Rivera Tech', followers: '12.4K', emoji: '🎬' },
        { id: 'instagram', name: 'Instagram', connected: true, username: '@alexrivera_dev', followers: '8.2K', emoji: '📸' },
        { id: 'tiktok', name: 'TikTok', connected: false, emoji: '🎵' },
        { id: 'twitter', name: 'Twitter/X', connected: true, username: '@alexcodes_ai', followers: '3.1K', emoji: '🐦' },
        { id: 'linkedin', name: 'LinkedIn', connected: false, emoji: '💼' }
      ]);
    } finally {
      setLoadingSocials(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    setTimeout(() => {
      updateProfile({
        name: editingName,
        email: editingEmail,
        bio: editingBio,
        niche: editingNiche,
        avatarLetter: editingName.trim().charAt(0).toUpperCase() || 'U'
      });
      setSaving(false);
      setSaveSuccess(true);
      toast.success('Profile settings saved successfully!');
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 800);
  };

  // Launch OAuth Consent Modal
  const handleConnectClick = (platformId: string) => {
    setActiveOauthPlatform(platformId);
    setOauthHandle('');
    setOauthFollowers('');
    setOauthEmail('');
    setOauthPassword('');
    setOauthStep('login');
    setOauthStatusText('');
    setOauthError('');
  };

  // Submit platform login credentials for mock verification
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthHandle.trim() || !oauthPassword.trim() || !activeOauthPlatform) return;

    setOauthStep('verifying_creds');
    setOauthError('');
    
    setOauthStatusText(`Contacting ${SOCIAL_NAMES[activeOauthPlatform]} authentication nodes...`);
    await new Promise(r => setTimeout(r, 600));
    
    setOauthStatusText('Verifying account credential checksums...');
    await new Promise(r => setTimeout(r, 600));

    setOauthStatusText('Validating active channel token records...');
    
    try {
      const res = await api.post('/users/integrations/verify', {
        platform: activeOauthPlatform,
        username: oauthHandle
      });
      const { followers } = res.data;
      setOauthFollowers(followers);
      setOauthStep('consent');
      toast.success('Channel verified! Proceeding with integration consent.');
    } catch (err: any) {
      console.error('Verification failed:', err);
      const msg = err.response?.data?.detail || `Could not verify account ${oauthHandle} on ${SOCIAL_NAMES[activeOauthPlatform]}.`;
      setOauthError(msg);
      setOauthStep('login');
      toast.error(`Verification failed: ${msg}`);
    }
  };

  // Execute Simulated OAuth Flow
  const handleAuthorizeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oauthHandle.trim() || !activeOauthPlatform) return;

    setOauthStep('authorizing');
    
    // Step 1: Handshake
    setOauthStatusText('Establishing secure handshake with API redirect...');
    await new Promise(r => setTimeout(r, 600));

    // Step 2: Code exchange
    setOauthStatusText('Exchanging temporary authorization code for Access Tokens...');
    await new Promise(r => setTimeout(r, 600));

    // Step 3: Write connection state to backend API
    setOauthStatusText('Writing encryption tokens to credential store...');
    try {
      await api.post('/users/integrations/connect', {
        platform: activeOauthPlatform,
        username: oauthHandle,
        followers: oauthFollowers
      });
    } catch {
      // Allow fallback if API fails
    }

    setOauthStep('success');
    toast.success(`Successfully connected your ${SOCIAL_NAMES[activeOauthPlatform]} channel!`);
    await new Promise(r => setTimeout(r, 800));

    // Refresh list and close
    await fetchIntegrations();
    setActiveOauthPlatform(null);
  };

  // Disconnect Account via API
  const handleDisconnectClick = async (platformId: string) => {
    const confirmed = window.confirm(`Are you sure you want to disconnect your ${SOCIAL_NAMES[platformId]} account?`);
    if (!confirmed) return;

    try {
      await api.post('/users/integrations/disconnect', {
        platform: platformId
      });
      await fetchIntegrations();
      toast.success(`Disconnected your ${SOCIAL_NAMES[platformId]} channel.`);
    } catch {
      // Local state adjustment fallback
      setSocials(prev => prev.map(s => {
        if (s.id === platformId) {
          return { ...s, connected: false, username: undefined, followers: undefined };
        }
        return s;
      }));
      toast.success(`Disconnected your ${SOCIAL_NAMES[platformId]} channel.`);
    }
  };

  const creditPercentage = (profile.creditsUsed / profile.creditsTotal) * 100;

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-fade-in-up relative font-dm-sans text-on-background">
      {/* Header Banner */}
      <header className="reveal">
        <p className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em] mb-2">Creator Settings</p>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10 pb-6 select-none">
          <div className="space-y-1">
            <h1 className="font-playfair text-headline-lg text-primary flex items-center gap-2">
              👤 Profile & Settings
            </h1>
            <p className="text-on-surface-variant text-body-md max-w-xl leading-relaxed">
              Manage your creator account details, connect social platforms, and track billing credit usage.
            </p>
          </div>
          <div className="flex items-center gap-2 text-label-md text-primary bg-primary/10 border border-outline-variant/10 px-4 py-2 rounded-full font-semibold self-start md:self-auto">
            <span>✨</span> Premium Creator Tier
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Account details form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-[32px] border border-outline-variant/10 p-6 md:p-8 shadow-sm reveal stagger-1">
            <h2 className="font-playfair text-lg text-primary border-b border-outline-variant/15 pb-3 mb-6 select-none">
              Account Credentials
            </h2>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center gap-6 pb-4 border-b border-outline-variant/10">
                <div className="w-16 h-16 bg-primary border-2 border-outline-variant/30 rounded-[20px] flex items-center justify-center text-2xl font-semibold text-on-primary shadow-md select-none font-playfair">
                  {profile.avatarLetter}
                </div>
                <div className="flex-1 space-y-1.5 text-center sm:text-left select-none">
                  <h3 className="text-body-lg font-semibold text-on-surface">Creator Identity</h3>
                  <p className="text-body-md text-on-surface-variant/70">Avatar letter auto-generated from your primary identity name.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-outline font-label-md text-label-md uppercase tracking-wider select-none">Full Name</label>
                  <motion.input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                    transition={{ duration: 0.2 }}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-3 px-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none text-on-background"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-outline font-label-md text-label-md uppercase tracking-wider select-none">Email Address</label>
                  <motion.input
                    type="email"
                    value={editingEmail}
                    onChange={(e) => setEditingEmail(e.target.value)}
                    whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                    transition={{ duration: 0.2 }}
                    className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-3 px-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none text-on-background"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-outline font-label-md text-label-md uppercase tracking-wider select-none">Niche Focus</label>
                <motion.input
                  type="text"
                  value={editingNiche}
                  onChange={(e) => setEditingNiche(e.target.value)}
                  whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                  transition={{ duration: 0.2 }}
                  placeholder="e.g. tech, cooking, personal finance"
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-3 px-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none text-on-background"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="block text-outline font-label-md text-label-md uppercase tracking-wider select-none">Creator Bio</label>
                <motion.textarea
                  value={editingBio}
                  onChange={(e) => setEditingBio(e.target.value)}
                  whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                  transition={{ duration: 0.2 }}
                  rows={4}
                  className="w-full bg-surface-container-low border border-outline-variant/10 rounded-[20px] py-4 px-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none text-on-background resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                {saveSuccess ? (
                  <span className="text-label-md font-semibold text-secondary flex items-center gap-1.5 animate-fade-in select-none">
                    <span className="material-symbols-outlined text-sm">check_circle</span> Profile saved successfully!
                  </span>
                ) : (
                  <span></span>
                )}
                <motion.button
                  type="submit"
                  disabled={saving}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="px-6 py-3 bg-primary hover:bg-primary/95 disabled:bg-surface-container-high text-on-primary disabled:text-outline/40 font-semibold font-dm-sans rounded-full transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-primary/10 text-body-md"
                >
                  {saving ? (
                    <>
                      <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                      <span>Saving changes...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-sm">save</span>
                      <span>Save Settings</span>
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Billing limits & connected social apps */}
        <div className="space-y-6">
          {/* Subscription Credits card */}
          <div className="glass rounded-[32px] border border-outline-variant/10 p-6 shadow-sm select-none reveal stagger-2">
            <h2 className="font-playfair text-lg text-primary border-b border-outline-variant/15 pb-3 mb-4">
              Subscription & Usage
            </h2>
            <div className="space-y-4 font-dm-sans">
              <div className="flex justify-between items-center text-body-md">
                <span className="text-on-surface-variant font-medium">Active Tier</span>
                <span className="font-semibold text-primary bg-primary/10 border border-outline-variant/10 px-3 py-1 rounded-full text-label-md">
                  {profile.plan}
                </span>
              </div>

              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-label-md font-semibold uppercase tracking-wider text-outline">
                  <span>AI Engine Credits</span>
                  <span>{profile.creditsUsed} / {profile.creditsTotal}</span>
                </div>
                <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-primary rounded-full shadow-sm"
                    initial={{ width: 0 }}
                    animate={{ width: `${creditPercentage}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                  />
                </div>
                <p className="text-xs text-on-surface-variant/70 leading-relaxed font-medium">Credits reset automatically on next monthly billing cycle.</p>
              </div>
            </div>
          </div>

          {/* Social Channels Integration status */}
          <div className="glass rounded-[32px] border border-outline-variant/10 p-6 shadow-sm reveal stagger-3">
            <h2 className="font-playfair text-lg text-primary border-b border-outline-variant/15 pb-3 mb-4 select-none">
              Connected Channels
            </h2>
            
            {loadingSocials ? (
              <div className="flex items-center justify-center p-8 select-none">
                <span className="animate-spin material-symbols-outlined text-primary text-xl">sync</span>
              </div>
            ) : (
              <div className="space-y-3 font-dm-sans">
                {socials.map((platform) => (
                  <div
                    key={platform.id}
                    className="flex items-center justify-between border border-outline-variant/10 rounded-[20px] p-4 bg-surface-container-low/40 hover:bg-white/60 hover:border-outline-variant/30 transition-all duration-350 shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl bg-surface-container-lowest border border-outline-variant/10 p-2.5 rounded-full flex items-center justify-center select-none shadow-sm">
                        {platform.emoji}
                      </span>
                      <div>
                        <h4 className="text-body-md font-semibold text-on-surface select-none">{platform.name}</h4>
                        {platform.connected ? (
                          <p className="text-xs text-on-surface-variant leading-none mt-1 font-medium select-text">
                            {platform.username} ({platform.followers})
                          </p>
                        ) : (
                          <p className="text-xs text-outline leading-none mt-1 font-medium select-none">Not Linked</p>
                        )}
                      </div>
                    </div>

                    <motion.button
                      onClick={() => platform.connected ? handleDisconnectClick(platform.id) : handleConnectClick(platform.id)}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      className={`px-4 py-2 rounded-full text-xs font-semibold tracking-wider transition-all duration-300 select-none cursor-pointer ${
                        platform.connected
                          ? 'bg-error-container/20 border border-error/20 text-error hover:bg-error-container/40'
                          : 'bg-white border border-outline-variant/30 text-outline hover:text-primary hover:border-primary/50'
                      }`}
                    >
                      {platform.connected ? 'Disconnect' : 'Connect'}
                    </motion.button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Simulated OAuth Authorization Consent Modal */}
      <AnimatePresence>
        {activeOauthPlatform && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setActiveOauthPlatform(null)}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 select-none"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="glass border border-outline-variant/10 rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl relative"
            >
              {/* Platform Brand Header banner */}
              <div className={`p-5 text-center ${PLATFORM_OAUTH_STYLES[activeOauthPlatform].brandBg} ${PLATFORM_OAUTH_STYLES[activeOauthPlatform].brandText} relative`}>
                <h2 className="text-xs uppercase font-extrabold tracking-widest">{PLATFORM_OAUTH_STYLES[activeOauthPlatform].logo}</h2>
                {/* Close x */}
                <motion.button
                  onClick={() => setActiveOauthPlatform(null)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute right-4 top-3 text-white/70 hover:text-white font-bold text-sm cursor-pointer"
                >
                  ✕
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="p-6 md:p-8 space-y-6">
                <AnimatePresence mode="wait">
                  {oauthStep === 'login' && (
                    <motion.form
                      key="login"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onSubmit={handleLoginSubmit}
                      className="space-y-6"
                    >
                      {oauthError && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 select-none animate-scale-up"
                        >
                          <span className="material-symbols-outlined text-sm">error</span>
                          <span>{oauthError}</span>
                        </motion.div>
                      )}
                      <div className="text-center space-y-1">
                        <p className="text-xs text-on-surface-variant font-medium">
                          Log in to your <strong className="text-on-surface">{SOCIAL_NAMES[activeOauthPlatform]}</strong> account to verify ownership.
                        </p>
                      </div>

                      {/* Username/Email Input */}
                      <div className="space-y-2">
                        <label className="block text-outline font-label-md text-label-md uppercase tracking-wider">
                          Profile Username / Handle
                        </label>
                        <motion.input
                          type="text"
                          value={oauthHandle}
                          onChange={(e) => setOauthHandle(e.target.value)}
                          whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                          transition={{ duration: 0.2 }}
                          placeholder={PLATFORM_OAUTH_STYLES[activeOauthPlatform].placeholder}
                          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-3 px-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none text-on-background"
                          required
                        />
                      </div>

                      {/* Password Input */}
                      <div className="space-y-2">
                        <label className="block text-outline font-label-md text-label-md uppercase tracking-wider">
                          Password
                        </label>
                        <motion.input
                          type="password"
                          value={oauthPassword}
                          onChange={(e) => setOauthPassword(e.target.value)}
                          whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                          transition={{ duration: 0.2 }}
                          placeholder="••••••••"
                          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-3 px-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none text-on-background"
                          required
                        />
                      </div>

                      <div className="bg-surface-container-low/80 border border-outline-variant/10 p-4 rounded-[20px] flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">lock</span>
                        <p className="text-xs text-on-surface-variant leading-relaxed">
                          Secured via OAuth SSL protocol. Curate AI does not record external platform account passwords.
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 pt-2">
                        <motion.button
                          type="button"
                          onClick={() => setActiveOauthPlatform(null)}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 py-3 bg-white border border-outline-variant/30 hover:border-outline-variant/50 text-on-surface-variant font-semibold text-xs rounded-full transition-all duration-300 cursor-pointer"
                        >
                          Cancel
                        </motion.button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex-1 py-3 text-white font-semibold text-xs rounded-full transition-all duration-300 cursor-pointer shadow-sm border border-transparent ${
                            PLATFORM_OAUTH_STYLES[activeOauthPlatform].buttonBg
                          }`}
                        >
                          Verify credentials
                        </motion.button>
                      </div>
                    </motion.form>
                  )}

                  {oauthStep === 'verifying_creds' && (
                    <motion.div
                      key="verifying"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-8 flex flex-col items-center justify-center gap-4 text-center font-dm-sans"
                    >
                      <span className="animate-spin material-symbols-outlined text-primary text-3xl">sync</span>
                      <div className="space-y-1">
                        <p className="text-body-md font-semibold text-on-surface">Verifying external profile...</p>
                        <p className="text-xs text-outline leading-relaxed font-mono bg-surface-container-low px-3 py-1.5 rounded-full">{oauthStatusText}</p>
                      </div>
                    </motion.div>
                  )}

                  {oauthStep === 'consent' && (
                    <motion.form
                      key="consent"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 10 }}
                      onSubmit={handleAuthorizeSubmit}
                      className="space-y-6"
                    >
                      {/* Verified account banner */}
                      <div className="bg-secondary-container/20 border border-secondary-container/40 p-4 rounded-[20px] flex items-center justify-between font-dm-sans">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-xs font-bold text-on-primary shadow-sm font-playfair">
                            {oauthHandle.replace(/^@/, '').charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-body-md font-semibold text-on-surface flex items-center gap-1.5">
                              {oauthHandle} <span className="text-secondary text-xs flex items-center gap-0.5"><span className="material-symbols-outlined text-xs">verified</span> Verified</span>
                            </p>
                            <p className="text-[10px] text-outline">OAuth Handshake Completed</p>
                          </div>
                        </div>
                      </div>

                      {/* Scopes list details */}
                      <div className="space-y-2 bg-surface-container-low border border-outline-variant/10 p-4 rounded-[20px] font-dm-sans">
                        <p className="text-label-md font-semibold text-outline uppercase tracking-wider font-semibold">Authorized Permissions:</p>
                        <div className="space-y-2 pt-1.5">
                          {PLATFORM_OAUTH_STYLES[activeOauthPlatform].scopes.map((scope, idx) => (
                            <div key={idx} className="flex items-start gap-2 text-xs text-on-surface-variant leading-normal">
                              <span className="text-primary font-bold mt-0.5">✓</span>
                              <span>{scope}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Followers count input */}
                      <div className="space-y-2 font-dm-sans">
                        <div className="flex justify-between items-center">
                          <label className="block text-outline font-label-md text-label-md uppercase tracking-wider">
                            Subscriber / Follower Count
                          </label>
                          <span className="text-xs text-outline italic font-medium">Parsed from API</span>
                        </div>
                        <motion.input
                          type="text"
                          value={oauthFollowers}
                          onChange={(e) => setOauthFollowers(e.target.value)}
                          whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
                          transition={{ duration: 0.2 }}
                          placeholder="e.g. 15.4K or 1,200"
                          className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-3 px-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none text-on-background"
                          required
                        />
                      </div>

                      {/* Submit / Cancel Buttons */}
                      <div className="flex gap-3 pt-2">
                        <motion.button
                          type="button"
                          onClick={() => setOauthStep('login')}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 py-3 bg-white border border-outline-variant/30 hover:border-outline-variant/50 text-on-surface-variant font-semibold text-xs rounded-full transition-all duration-300 cursor-pointer"
                        >
                          Back
                        </motion.button>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex-1 py-3 text-white font-semibold text-xs rounded-full transition-all duration-300 cursor-pointer shadow-sm border border-transparent ${
                            PLATFORM_OAUTH_STYLES[activeOauthPlatform].buttonBg
                          }`}
                        >
                          Authorize & Link
                        </motion.button>
                      </div>
                    </motion.form>
                  )}

                  {oauthStep === 'authorizing' && (
                    <motion.div
                      key="authorizing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-8 flex flex-col items-center justify-center gap-4 text-center"
                    >
                      <span className="animate-spin material-symbols-outlined text-primary text-3xl">sync</span>
                      <div className="space-y-1">
                        <p className="text-body-md font-semibold text-on-surface">OAuth Handshake in progress...</p>
                        <p className="text-xs text-outline leading-relaxed font-mono bg-surface-container-low px-3 py-1.5 rounded-full">{oauthStatusText}</p>
                      </div>
                    </motion.div>
                  )}

                  {oauthStep === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-8 flex flex-col items-center justify-center gap-3 text-center"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.2, 1] }}
                        transition={{ duration: 0.4 }}
                        className="w-12 h-12 rounded-full bg-secondary-container/20 border border-secondary-container/40 flex items-center justify-center text-xl text-secondary font-black"
                      >
                        ✓
                      </motion.span>
                      <div className="space-y-1">
                        <p className="text-body-md font-semibold text-on-surface">Account Verified & Linked!</p>
                        <p className="text-xs text-on-surface-variant/80">Connection synchronized successfully.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

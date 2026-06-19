'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { useRouter } from 'next/navigation';
import { motion, Variants } from 'framer-motion';
import { toast } from 'sonner';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Simulate slight loader for premium feel
    setTimeout(async () => {
      try {
        const mockUser = { id: 1, email };
        const mockToken = "fake-jwt-token";
        setAuth(mockUser, mockToken);
        toast.success(`Welcome back, ${email}!`);
        router.push('/dashboard');
      } catch (err: any) {
        setError('Invalid credentials. Please try again.');
        toast.error('Login failed. Please check credentials.');
      } finally {
        setLoading(false);
      }
    }, 800);
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.96, y: 15 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 280, damping: 24 } }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background text-on-background font-dm-sans px-4 relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-secondary/5 blur-[120px] pointer-events-none" />

      {/* Main Glass Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="glass rounded-[32px] border border-outline-variant/10 p-8 md:p-10 shadow-2xl w-full max-w-md relative z-10"
      >
        {/* Animated SVG Brand Logo */}
        <div className="flex justify-center select-none mb-2">
          <svg className="w-16 h-16" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Outer rotating ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke="#6f5656"
              strokeWidth="2"
              strokeDasharray="12 6 8 6"
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
            />
            {/* Inner reverse rotating ring */}
            <motion.circle
              cx="50"
              cy="50"
              r="30"
              stroke="#556256"
              strokeWidth="1.5"
              strokeDasharray="6 6"
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
            />
            {/* Core glowing circle */}
            <motion.circle
              cx="50"
              cy="50"
              r="12"
              fill="#6f5656"
              animate={{ scale: [1, 1.15, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            />
            {/* Morphing lines */}
            <motion.path
              d="M 50 10 L 50 50 M 50 50 L 76 65 M 50 50 L 24 65"
              stroke="#6c5754"
              strokeWidth="1.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatType: "reverse" }}
            />
          </svg>
        </div>

        {/* Brand/Header */}
        <div className="text-center mb-8 select-none">
          <h1 className="font-playfair text-display-lg text-primary tracking-tight mb-2 select-text">Curate AI</h1>
          <p className="text-on-surface-variant text-body-md font-medium">Sign in to your creator workspace</p>
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 bg-error-container/20 border border-error/20 text-error text-xs rounded-xl p-3.5 flex items-start gap-2"
          >
            <span className="material-symbols-outlined text-sm mt-0.5">error</span>
            <p className="font-medium">{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="block text-outline font-label-md text-label-md uppercase tracking-wider select-none">Email Address</label>
            <motion.input 
              type="email" 
              value={email}
              onChange={e => setEmail(e.target.value)}
              whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
              transition={{ duration: 0.2 }}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-3 px-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none text-on-background" 
              placeholder="name@example.com"
              required 
            />
          </div>

          <div className="space-y-2">
            <label className="block text-outline font-label-md text-label-md uppercase tracking-wider select-none">Password</label>
            <motion.input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              whileFocus={{ scale: 1.002, boxShadow: '0 0 0 3px rgba(111,86,86,0.15)' }}
              transition={{ duration: 0.2 }}
              className="w-full bg-surface-container-low border border-outline-variant/10 rounded-full py-3 px-6 focus:ring-2 focus:ring-primary/20 text-body-md placeholder:text-outline/60 transition-all outline-none text-on-background" 
              placeholder="••••••••"
              required 
            />
          </div>

          <motion.button 
            type="submit" 
            disabled={loading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="w-full bg-primary hover:bg-primary/95 text-on-primary py-4 rounded-full font-semibold font-dm-sans shadow-xl shadow-primary/10 flex items-center justify-center gap-2 transition-all cursor-pointer text-body-md mt-4"
          >
            {loading ? (
              <>
                <span className="animate-spin material-symbols-outlined text-sm">sync</span>
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">login</span>
                <span>Sign In</span>
              </>
            )}
          </motion.button>
        </form>

        {/* Footer info block */}
        <div className="mt-8 border-t border-outline-variant/10 pt-6 flex items-start gap-2.5 bg-surface-container-low/50 border border-outline-variant/5 p-4 rounded-[20px] select-none">
          <span className="material-symbols-outlined text-primary text-sm mt-0.5">lock</span>
          <p className="text-xs text-on-surface-variant/80 leading-normal">
            Secure offline template authentication. No external request overheads.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
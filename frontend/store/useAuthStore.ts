import { create } from 'zustand';
import { api } from '@/lib/api';

export interface UserProfile {
  name: string;
  email: string;
  avatarLetter: string;
  bio: string;
  niche: string;
  plan: string;
  creditsUsed: number;
  creditsTotal: number;
  renewsOn?: string;
}

interface AuthState {
  user: any | null;
  token: string | null;
  profile: UserProfile;
  setAuth: (user: any, token: string) => void;
  updateProfile: (profile: Partial<UserProfile>) => void;
  logout: () => void;
  fetchBillingState: () => Promise<any>;
  checkoutSubscription: (paymentData: {
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
    cardHolder: string;
    planName: string;
    amount: string;
  }) => Promise<any>;
  buyCredits: (paymentData: {
    cardNumber: string;
    cardExpiry: string;
    cardCvv: string;
    cardHolder: string;
    creditsAmount: number;
    priceAmount: string;
  }) => Promise<any>;
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'Anisha Sahu',
  email: 'anisha.980sahu@gmail.com',
  avatarLetter: 'A',
  bio: 'Tech content creator making programming tutorials, tool comparisons, and software engineering career advice.',
  niche: 'Software Engineering & Tech Life',
  plan: 'Creator Premium',
  creditsUsed: 1450,
  creditsTotal: 5000,
  renewsOn: ''
};

// Safe localStorage access helper
const getLocalStorageItem = (key: string) => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem(key);
  }
  return null;
};

const setLocalStorageItem = (key: string, value: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, value);
  }
};

const removeLocalStorageItem = (key: string) => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(key);
  }
};

export const useAuthStore = create<AuthState>((set, get) => {
  // Initialize states lazily inside the store creation context
  const initialUser = (() => {
    try {
      const u = getLocalStorageItem('curate_ai_user');
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  })();

  const initialToken = getLocalStorageItem('curate_ai_token');

  const initialProfile = (() => {
    try {
      const p = getLocalStorageItem('curate_ai_profile');
      return p ? JSON.parse(p) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  })();

  return {
    user: initialUser,
    token: initialToken,
    profile: initialProfile,
    setAuth: (user, token) => {
      setLocalStorageItem('curate_ai_user', JSON.stringify(user));
      setLocalStorageItem('curate_ai_token', token);
      
      set((state) => {
        const emailVal = user?.email || '';
        const nameVal = emailVal === 'anisha.980sahu@gmail.com' ? 'Anisha Sahu' : (emailVal ? emailVal.split('@')[0] : state.profile.name);
        const letterVal = emailVal === 'anisha.980sahu@gmail.com' ? 'A' : (emailVal ? emailVal.charAt(0).toUpperCase() : state.profile.avatarLetter);

        const updatedProfile = {
          ...state.profile,
          email: emailVal || state.profile.email,
          name: nameVal,
          avatarLetter: letterVal
        };
        setLocalStorageItem('curate_ai_profile', JSON.stringify(updatedProfile));
        return { user, token, profile: updatedProfile };
      });
    },
    updateProfile: (updated) => {
      set((state) => {
        const newProfile = { ...state.profile, ...updated };
        setLocalStorageItem('curate_ai_profile', JSON.stringify(newProfile));
        return { profile: newProfile };
      });
    },
    logout: () => {
      removeLocalStorageItem('curate_ai_user');
      removeLocalStorageItem('curate_ai_token');
      set({ user: null, token: null });
    },
    fetchBillingState: async () => {
      try {
        const res = await api.get('/billing/state');
        const { profile } = res.data;
        if (profile) {
          set((state) => {
            const newProfile = {
              ...state.profile,
              plan: profile.plan || state.profile.plan,
              creditsUsed: typeof profile.creditsUsed === 'number' ? profile.creditsUsed : state.profile.creditsUsed,
              creditsTotal: typeof profile.creditsTotal === 'number' ? profile.creditsTotal : state.profile.creditsTotal,
              renewsOn: profile.renewsOn || state.profile.renewsOn
            };
            setLocalStorageItem('curate_ai_profile', JSON.stringify(newProfile));
            return { profile: newProfile };
          });
        }
        return res.data;
      } catch (err) {
        console.error('Failed to sync billing state:', err);
        return { profile: get().profile, invoices: [] };
      }
    },
    checkoutSubscription: async (paymentData) => {
      const res = await api.post('/billing/checkout', paymentData);
      const { data } = res.data;
      if (data && data.profile) {
        set((state) => {
          const newProfile = {
            ...state.profile,
            plan: data.profile.plan,
            creditsUsed: data.profile.creditsUsed,
            creditsTotal: data.profile.creditsTotal,
            renewsOn: data.profile.renewsOn
          };
          setLocalStorageItem('curate_ai_profile', JSON.stringify(newProfile));
          return { profile: newProfile };
        });
      }
      return res.data;
    },
    buyCredits: async (paymentData) => {
      const res = await api.post('/billing/buy-credits', paymentData);
      const { data } = res.data;
      if (data && data.profile) {
        set((state) => {
          const newProfile = {
            ...state.profile,
            creditsTotal: data.profile.creditsTotal
          };
          setLocalStorageItem('curate_ai_profile', JSON.stringify(newProfile));
          return { profile: newProfile };
        });
      }
      return res.data;
    }
  };
});
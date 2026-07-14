'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/useAuthStore';
import { api } from '@/lib/api';

interface Invoice {
  id: string;
  date: string;
  amount: string;
  plan: string;
  status: string;
  paymentMethod: string;
}

const AVAILABLE_PLANS = [
  {
    name: 'Starter Tier',
    price: '$0',
    billing: 'Free Forever',
    amountVal: '$0.00',
    description: 'Perfect for exploring creator tools and drafting initial script hooks.',
    features: [
      '500 AI credits per month',
      '1 connected social platform',
      'Basic scripting workflow generator',
      'Standard diagnostic scoring'
    ],
    highlight: false,
    badge: 'Starter'
  },
  {
    name: 'Creator Premium',
    price: '$19',
    billing: '/ month',
    amountVal: '$19.00',
    description: 'Our most popular plan for active creators looking to boost consistency.',
    features: [
      '5,000 AI credits per month',
      '3 connected social platforms',
      'Complete strategic content calendar',
      'Advanced hook scorer',
      'Direct copy-paste clipboard integrations'
    ],
    highlight: true,
    badge: 'Popular'
  },
  {
    name: 'Pro Creator',
    price: '$49',
    amountVal: '$49.00',
    billing: '/ month',
    description: 'For growing brands needing high-throughput script orchestration.',
    features: [
      '15,000 AI credits per month',
      'Unlimited connected channels',
      'Audience persona dossiers',
      'Extended diagnostic viral scoring models',
      'Direct YouTube scraper validation access'
    ],
    highlight: false,
    badge: 'Pro'
  },
  {
    name: 'Enterprise Agency',
    price: '$149',
    amountVal: '$149.00',
    billing: '/ month',
    description: 'For media companies and teams scaling cross-platform production.',
    features: [
      '50,000 AI credits per month',
      'Unlimited accounts & workspaces',
      'Dedicated backend processing prioritization',
      'Dedicated account support resources',
      'Custom persona generation configurations'
    ],
    highlight: false,
    badge: 'Agency'
  }
];

const CREDIT_PACKS = [
  { credits: 2500, price: '$5.99', amountVal: '$5.99', desc: 'Quick credit top-up' },
  { credits: 10000, price: '$14.99', amountVal: '$14.99', desc: 'Popular growth boost' },
  { credits: 25000, price: '$29.99', amountVal: '$29.99', desc: 'High volume pack' }
];

export default function BillingPage() {
  const profile = useAuthStore(state => state.profile);
  const fetchBillingState = useAuthStore(state => state.fetchBillingState);
  const checkoutSubscription = useAuthStore(state => state.checkoutSubscription);
  const buyCredits = useAuthStore(state => state.buyCredits);

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loadingBilling, setLoadingBilling] = useState(true);

  // Checkout modal states
  const [activeCheckout, setActiveCheckout] = useState<{
    type: 'plan' | 'addon';
    name: string;
    amount: string;
    creditsAmount?: number;
  } | null>(null);

  // Form states
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [checkingOut, setCheckingOut] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState('');
  const [checkoutStep, setCheckoutStep] = useState<'form' | 'processing' | 'success'>('form');
  const [checkoutError, setCheckoutError] = useState('');
  const [successInvoiceId, setSuccessInvoiceId] = useState('');
  const [mounted, setMounted] = useState(false);

  // Fetch initial billing history on mount
  const syncBillingData = async () => {
    try {
      setLoadingBilling(true);
      const data = await fetchBillingState();
      if (data && data.invoices) {
        setInvoices(data.invoices);
      }
    } catch (err) {
      console.error('Could not fetch billing details:', err);
    } finally {
      setLoadingBilling(false);
    }
  };

  useEffect(() => {
    setMounted(true);
    syncBillingData();
  }, []);

  // Format Card Number (Adding spaces)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    // Group by 4
    const parts = [];
    for (let i = 0; i < value.length; i += 4) {
      parts.push(value.substring(i, i + 4));
    }
    setCardNumber(parts.join(' '));
  };

  // Format Card Expiration Date (MM/YY)
  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      setCardExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setCardExpiry(value);
    }
  };

  // Detect card brand name
  const getCardBrand = () => {
    const rawNumber = cardNumber.replace(/\s/g, '');
    if (!rawNumber) return 'Unknown';
    const firstDigit = rawNumber[0];
    if (firstDigit === '4') return 'Visa';
    if (firstDigit === '5') return 'Mastercard';
    if (firstDigit === '3') return 'Amex';
    if (firstDigit === '6') return 'Discover';
    return 'Card';
  };

  const getCardBrandEmoji = () => {
    const brand = getCardBrand();
    if (brand === 'Visa') return '💳 Visa';
    if (brand === 'Mastercard') return '💳 Mastercard';
    if (brand === 'Amex') return '💳 American Express';
    if (brand === 'Discover') return '💳 Discover';
    return '💳 Credit Card';
  };

  // Open Checkout Modal
  const openCheckout = (type: 'plan' | 'addon', name: string, amount: string, creditsAmount?: number) => {
    setActiveCheckout({ type, name, amount, creditsAmount });
    setCardNumber('');
    setCardExpiry('');
    setCardCvv('');
    setCardHolder('');
    setCheckoutStep('form');
    setCheckoutError('');
    setSuccessInvoiceId('');
  };

  // Submit checkout simulation
  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCheckout) return;

    setCheckingOut(true);
    setCheckoutStep('processing');
    setCheckoutError('');

    setCheckoutStatus('Validating card parameters...');
    await new Promise(r => setTimeout(r, 600));

    setCheckoutStatus('Connecting securely to payment gateway...');
    await new Promise(r => setTimeout(r, 700));

    setCheckoutStatus('Exchanging secure transactional tokens...');
    await new Promise(r => setTimeout(r, 600));

    setCheckoutStatus('Finalizing upgrade parameters...');

    try {
      let response;
      if (activeCheckout.type === 'plan') {
        response = await checkoutSubscription({
          cardNumber,
          cardExpiry,
          cardCvv,
          cardHolder,
          planName: activeCheckout.name,
          amount: activeCheckout.amount
        });
      } else {
        response = await buyCredits({
          cardNumber,
          cardExpiry,
          cardCvv,
          cardHolder,
          creditsAmount: activeCheckout.creditsAmount || 0,
          priceAmount: activeCheckout.amount
        });
      }

      if (response && response.status === 'success') {
        const invList = response.data?.invoices || [];
        setInvoices(invList);
        setSuccessInvoiceId(invList[0]?.id || `INV-${Math.floor(Math.random() * 10000)}`);
        setCheckoutStep('success');
        toast.success(response.message || 'Payment processed successfully!');
      } else {
        throw new Error('Transaction failed.');
      }

    } catch (err: any) {
      console.error('Checkout failed:', err);
      const errMsg = err.response?.data?.detail || 'Transaction failed. Please verify your card details and try again.';
      setCheckoutError(errMsg);
      setCheckoutStep('form');
      setCheckingOut(false);
      toast.error(`Payment failed: ${errMsg}`);
    }
  };

  // Opens a printable invoice layout in a new tab which triggers browser print dialog
  const handleDownloadInvoice = (invId: string) => {
    window.open(`/billing/invoice/${invId}`, '_blank');
  };

  // Motion variants
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.08 }
    }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 260, damping: 25 } }
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

  const creditPercentage = (profile.creditsUsed / profile.creditsTotal) * 100;

  return (
    <div className="space-y-12 max-w-5xl mx-auto animate-fade-in-up relative font-dm-sans text-on-background select-none">
      {/* Header Banner */}
      <header className="reveal select-text">
        <p className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em] mb-2">Creator Billing</p>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10 pb-6">
          <div className="space-y-1">
            <h1 className="font-playfair text-headline-lg text-primary flex items-center gap-2">
              💳 Subscription & Plans
            </h1>
            <p className="text-on-surface-variant text-body-md max-w-xl leading-relaxed">
              Track credits usage, upgrade subscription tiers, buy add-on credit packs, and manage transaction history.
            </p>
          </div>
        </div>
      </header>

      {/* Credit usage dashboard card */}
      <section className="glass rounded-[32px] border border-outline-variant/10 p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8 reveal">
        <div className="space-y-4 flex-1">
          <h2 className="font-playfair text-lg text-primary flex items-center gap-2">
            📊 Current Subscription Usage
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between text-label-md font-semibold uppercase tracking-wider text-outline">
              <span>AI Credits Allocated</span>
              <span>
                {mounted ? profile.creditsUsed.toLocaleString() : '1,450'} / {mounted ? profile.creditsTotal.toLocaleString() : '5,000'}
              </span>
            </div>
            <div className="w-full h-3 bg-surface-container rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-primary rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${mounted ? creditPercentage : 29}%` }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
            </div>
            <p className="text-xs text-on-surface-variant/70 font-medium">
              Plan renewal on <strong className="text-on-surface">{mounted ? (profile.renewsOn || 'Next month') : 'August 14, 2026'}</strong>. Credits refresh automatically.
            </p>
          </div>
        </div>
        
        <div className="border-t md:border-t-0 md:border-l border-outline-variant/10 pt-6 md:pt-0 md:pl-8 flex flex-col items-start md:items-center justify-center gap-2 select-text">
          <p className="text-xs text-outline font-bold uppercase tracking-wider">Active Workspace Plan</p>
          <span className="font-playfair text-2xl text-primary font-black bg-primary/5 px-4 py-2 border border-outline-variant/10 rounded-2xl shadow-inner font-bold">
            {mounted ? profile.plan : 'Creator Premium'}
          </span>
        </div>
      </section>

      {/* Pricing Cards Grid */}
      <section className="space-y-6">
        <div className="text-center md:text-left select-text">
          <h2 className="font-playfair text-headline-sm text-primary">Upgrade Workspace Capacity</h2>
          <p className="text-on-surface-variant text-body-md">Choose the perfect tier that scales with your cross-platform content production workflow.</p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {AVAILABLE_PLANS.map((plan) => {
            const activePlanName = mounted ? profile.plan : 'Creator Premium';
            const isCurrent = activePlanName.toLowerCase().trim() === plan.name.toLowerCase().trim();
            
            return (
              <motion.div
                key={plan.name}
                variants={cardVariants}
                className={`glass rounded-[32px] border p-6 flex flex-col justify-between relative transition-all duration-300 ${
                  plan.highlight 
                    ? 'border-primary/45 shadow-lg shadow-primary/5 scale-[1.01]' 
                    : 'border-outline-variant/15 hover:border-outline-variant/30'
                }`}
              >
                {/* Highlight Badge */}
                {plan.highlight && (
                  <span className="absolute top-4 right-4 bg-primary text-on-primary text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-full tracking-wider shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div className="space-y-4">
                  <div>
                    <h3 className="font-playfair text-md text-primary font-bold">{plan.name}</h3>
                    <p className="text-xs text-on-surface-variant/80 mt-1 min-h-[36px]">{plan.description}</p>
                  </div>

                  <div className="flex items-baseline gap-1 py-2 select-text">
                    <span className="font-playfair text-3xl font-black text-on-surface">{plan.price}</span>
                    <span className="text-xs text-outline font-medium">{plan.billing}</span>
                  </div>

                  <ul className="space-y-2.5 border-t border-outline-variant/10 pt-4">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs text-on-surface-variant">
                        <span className="text-primary font-bold">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  {isCurrent ? (
                    <button
                      disabled
                      className="w-full py-3 bg-primary/10 border border-primary/20 text-primary font-semibold text-xs rounded-full cursor-default"
                    >
                      Active Plan
                    </button>
                  ) : (
                    <motion.button
                      onClick={() => openCheckout('plan', plan.name, plan.amountVal)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`w-full py-3 font-semibold text-xs rounded-full cursor-pointer shadow-sm ${
                        plan.highlight
                          ? 'bg-primary hover:bg-primary/95 text-on-primary shadow-primary/10'
                          : 'bg-white hover:bg-surface-container-low border border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      {plan.price === '$0' ? 'Downgrade' : 'Upgrade Plan'}
                    </motion.button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </section>

      {/* Credit Packs */}
      <section className="space-y-6">
        <div className="select-text">
          <h2 className="font-playfair text-headline-sm text-primary">Need More Credits?</h2>
          <p className="text-on-surface-variant text-body-md">Buy instant credit top-ups without changing your subscription billing cycle.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_PACKS.map((pack, idx) => (
            <div
              key={idx}
              className="glass border border-outline-variant/15 rounded-[24px] p-5 flex items-center justify-between hover:border-outline-variant/30 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-xl bg-primary/10 border border-outline-variant/10 p-2.5 rounded-full">
                  add_circle
                </span>
                <div>
                  <h4 className="text-body-md font-semibold text-on-surface">+{pack.credits.toLocaleString()} Credits</h4>
                  <p className="text-xs text-outline">{pack.desc}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 select-text">
                <span className="font-playfair text-lg font-bold text-on-surface">{pack.price}</span>
                <motion.button
                  onClick={() => openCheckout('addon', `+${pack.credits.toLocaleString()} Credits`, pack.amountVal, pack.credits)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 bg-white hover:bg-surface-container-low border border-outline-variant/30 text-xs font-semibold rounded-full cursor-pointer"
                >
                  Buy
                </motion.button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Invoice History Table */}
      <section className="space-y-6">
        <div className="select-text">
          <h2 className="font-playfair text-headline-sm text-primary flex items-center gap-2">
            📄 Payment & Invoice History
          </h2>
          <p className="text-on-surface-variant text-body-md">Review historical transaction invoices and download receipts.</p>
        </div>

        <div className="glass rounded-[32px] border border-outline-variant/10 overflow-hidden shadow-sm">
          {loadingBilling ? (
            <div className="flex items-center justify-center p-12">
              <span className="animate-spin material-symbols-outlined text-primary text-xl">sync</span>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center text-xs text-outline font-medium">
              No historical invoices recorded in database.
            </div>
          ) : (
            <div className="overflow-x-auto select-text">
              <table className="w-full border-collapse text-left text-xs font-dm-sans">
                <thead>
                  <tr className="border-b border-outline-variant/10 bg-surface-container-low/30 font-bold uppercase tracking-wider text-outline">
                    <th className="p-4 pl-6">Invoice ID</th>
                    <th className="p-4">Billing Date</th>
                    <th className="p-4">Service Tier</th>
                    <th className="p-4">Amount</th>
                    <th className="p-4">Payment Method</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 pr-6 text-right">Receipts</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map((inv) => (
                    <tr
                      key={inv.id}
                      className="border-b border-outline-variant/10 hover:bg-surface-container-low/20 transition-all font-medium text-on-surface-variant"
                    >
                      <td className="p-4 pl-6 font-mono text-on-surface font-semibold">{inv.id}</td>
                      <td className="p-4">{inv.date}</td>
                      <td className="p-4 font-semibold text-primary">{inv.plan}</td>
                      <td className="p-4 text-on-surface font-semibold">{inv.amount}</td>
                      <td className="p-4">{inv.paymentMethod}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                          {inv.status}
                        </span>
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <button
                          onClick={() => handleDownloadInvoice(inv.id)}
                          className="text-primary hover:text-primary-fixed-dim font-bold flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">receipt_long</span> PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* Stripe Payment Checkout Modal Overlay */}
      <AnimatePresence>
        {activeCheckout && (
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => !checkingOut && setActiveCheckout(null)}
            className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={(e) => e.stopPropagation()}
              className="glass border border-outline-variant/10 rounded-[32px] max-w-md w-full overflow-hidden shadow-2xl relative"
            >
              {/* Header */}
              <div className="p-5 text-center bg-primary text-on-primary relative">
                <h2 className="text-xs uppercase font-extrabold tracking-widest flex items-center justify-center gap-1">
                  🔒 Secure checkout gateway
                </h2>
                {!checkingOut && (
                  <button
                    onClick={() => setActiveCheckout(null)}
                    className="absolute right-4 top-3 text-white/70 hover:text-white font-bold text-sm cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Body Content */}
              <div className="p-6 md:p-8">
                <AnimatePresence mode="wait">
                  {checkoutStep === 'form' && (
                    <motion.form
                      key="form"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onSubmit={handlePaymentSubmit}
                      className="space-y-5"
                    >
                      {checkoutError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">error</span>
                          <span>{checkoutError}</span>
                        </div>
                      )}

                      {/* Transaction details block */}
                      <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-[20px] flex items-center justify-between text-xs">
                        <div>
                          <p className="text-outline uppercase tracking-wider font-bold">Subscription upgrade</p>
                          <p className="font-semibold text-on-surface mt-0.5 text-sm">{activeCheckout.name}</p>
                        </div>
                        <div className="text-right select-text">
                          <p className="font-playfair text-lg font-black text-primary">{activeCheckout.amount}</p>
                          <p className="text-[10px] text-outline">Due immediately</p>
                        </div>
                      </div>

                      {/* Cardholder name */}
                      <div className="space-y-1.5">
                        <label className="block text-[10px] text-outline font-bold uppercase tracking-wider">
                          Cardholder Name
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-3.5 text-outline text-md">
                            person
                          </span>
                          <input
                            type="text"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            placeholder="Anisha Sahu"
                            className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-full py-3.5 pl-11 pr-6 focus:ring-2 focus:ring-primary/20 text-xs placeholder:text-outline/60 outline-none text-on-background font-semibold"
                            required
                          />
                        </div>
                      </div>

                      {/* Card Number */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[10px] text-outline font-bold uppercase tracking-wider">
                          <label>Card Number</label>
                          <span className="text-[9px] lowercase italic font-medium">
                            {getCardBrandEmoji()}
                          </span>
                        </div>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-4 top-3.5 text-outline text-md">
                            credit_card
                          </span>
                          <input
                            type="text"
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                            placeholder="4242 4242 4242 4242"
                            className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-full py-3.5 pl-11 pr-6 focus:ring-2 focus:ring-primary/20 text-xs placeholder:text-outline/60 outline-none text-on-background font-semibold font-mono"
                            required
                          />
                        </div>
                      </div>

                      {/* Expiry / CVV Row */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-outline font-bold uppercase tracking-wider">
                            Expiration Date
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-3.5 text-outline text-md">
                              calendar_month
                            </span>
                            <input
                              type="text"
                              value={cardExpiry}
                              onChange={handleCardExpiryChange}
                              placeholder="MM/YY"
                              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-full py-3.5 pl-11 pr-6 focus:ring-2 focus:ring-primary/20 text-xs placeholder:text-outline/60 outline-none text-on-background font-semibold font-mono"
                              required
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-outline font-bold uppercase tracking-wider">
                            CVV Code
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-3.5 text-outline text-md">
                              lock
                            </span>
                            <input
                              type="password"
                              value={cardCvv}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '');
                                if (val.length > 4) val = val.slice(0, 4);
                                setCardCvv(val);
                              }}
                              placeholder="•••"
                              className="w-full bg-surface-container-lowest border border-outline-variant/10 rounded-full py-3.5 pl-11 pr-6 focus:ring-2 focus:ring-primary/20 text-xs placeholder:text-outline/60 outline-none text-on-background font-semibold font-mono"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      {/* Security text */}
                      <div className="pt-2 border-t border-outline-variant/10 flex items-start gap-2.5">
                        <span className="material-symbols-outlined text-primary text-sm mt-0.5">lock</span>
                        <p className="text-[10px] text-on-surface-variant/80 leading-normal">
                          This is a secure simulation checkpoint. Credit cards are audited locally to verify structure without executing real-world processing charges.
                        </p>
                      </div>

                      {/* Submit actions */}
                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setActiveCheckout(null)}
                          className="flex-1 py-3 bg-white border border-outline-variant/30 hover:border-outline-variant/50 text-on-surface-variant font-semibold text-xs rounded-full transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="flex-1 py-3 bg-primary hover:bg-primary/95 text-on-primary font-semibold text-xs rounded-full transition-all cursor-pointer shadow-lg shadow-primary/10 flex items-center justify-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">payments</span>
                          <span>Pay & Subscribe</span>
                        </button>
                      </div>
                    </motion.form>
                  )}

                  {checkoutStep === 'processing' && (
                    <motion.div
                      key="processing"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="py-12 flex flex-col items-center justify-center gap-4 text-center"
                    >
                      <span className="animate-spin material-symbols-outlined text-primary text-3xl">sync</span>
                      <div className="space-y-1">
                        <p className="text-body-md font-semibold text-on-surface">Processing secure payment...</p>
                        <p className="text-xs text-outline leading-relaxed font-mono bg-surface-container-low px-3 py-1.5 rounded-full">
                          {checkoutStatus}
                        </p>
                      </div>
                    </motion.div>
                  )}

                  {checkoutStep === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-6 flex flex-col items-center justify-center gap-5 text-center font-dm-sans select-text"
                    >
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: [0, 1.25, 1] }}
                        transition={{ duration: 0.4 }}
                        className="w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-xl text-emerald-500 font-bold"
                      >
                        ✓
                      </motion.span>
                      
                      <div className="space-y-2">
                        <h3 className="text-body-lg font-bold text-on-surface">Payment Successful!</h3>
                        <p className="text-xs text-on-surface-variant leading-relaxed max-w-xs mx-auto">
                          Thank you! Your workspace account has been successfully updated.
                        </p>
                      </div>

                      <div className="bg-surface-container-low border border-outline-variant/10 p-4 rounded-[20px] w-full text-xs text-left space-y-2 font-mono">
                        <div className="flex justify-between">
                          <span className="text-outline">Receipt No:</span>
                          <span className="font-bold text-on-surface">{successInvoiceId}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-outline">Paid Amount:</span>
                          <span className="font-bold text-on-surface">{activeCheckout.amount}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-outline">Plan Tier:</span>
                          <span className="font-bold text-primary">{activeCheckout.name}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => setActiveCheckout(null)}
                        className="w-full py-3 bg-primary hover:bg-primary/95 text-on-primary font-semibold text-xs rounded-full transition-all cursor-pointer shadow-lg shadow-primary/10 mt-2"
                      >
                        Continue to Workspace
                      </button>
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

'use client';

import { useState } from 'react';

interface GuideItem {
  id: string;
  title: string;
  emoji: string;
  shortDesc: string;
  features: string[];
  tips: string[];
  exampleInput: string;
  expectedOutput: string;
}

const GUIDES: GuideItem[] = [
  {
    id: 'repurpose',
    title: 'Content Repurposer',
    emoji: '🔄',
    shortDesc: 'Convert written content or script from one platform format to fit all other major social channels.',
    features: [
      'Automatic Platform Adaptation: Generates platform-native content formats (Instagram Reels, TikTok openers, YouTube outlines, Twitter threads, and LinkedIn professional insights) in parallel.',
      'Algorithmic Formatting: Adjusts formatting dynamically — adds spacing, custom emojis, and bullet points based on the target platform.',
      'Integrated Hashtags: Extracts keywords from input content and appends relevant trending tags.'
    ],
    tips: [
      'Input long-form text (like a YouTube script or blog draft) for the best results.',
      'Check different tabs to see how the tone matches the audience. Twitter/X is formatted as a thread, while LinkedIn uses a professional insight tone.'
    ],
    exampleInput: '5 mistakes beginner content creators make: 1. Inconsistent scheduling. 2. Bad audio quality. 3. Ignoring audience comments. 4. Overcomplicating edits. 5. Not having a clear hook.',
    expectedOutput: 'An interactive tabbed array containing tailored posts for Instagram (visual reels format), TikTok (POV style script), Twitter/X (a numbered thread layout), and LinkedIn (a professional case breakdown).'
  },
  {
    id: 'hooks',
    title: 'Hook Generator & Scorer',
    emoji: '🎣',
    shortDesc: 'Generate 5 high-impact scroll-stopping hooks classified by copy styles, scored on expected conversion.',
    features: [
      '5 Strategic Copystyles: Generates Curiosity, Shock, Story, Statistic, and Question openers.',
      'Calculated Scores: Provides an expected conversion score (65-98) based on platform-specific keywords.',
      'Strategic Insight: Lists a concise "Why it works" logic segment explaining the psychological driver behind the hook.'
    ],
    tips: [
      'Use short, clear topics (e.g. "python programming tips" rather than full paragraphs) for stronger template rendering.',
      'Combine a statistic hook with a curiosity video layout to maximize watch time in the first 3 seconds.'
    ],
    exampleInput: 'productivity tips for developers',
    expectedOutput: 'A ranked stack of 5 hook cards, each featuring style badges, bold typography, and gradient strength bars indicating conversion potential.'
  },
  {
    id: 'calendar',
    title: 'AI Content Calendar',
    emoji: '📅',
    shortDesc: 'Automate a weekly content scheduler displaying optimal posting hours, types, and trending angles.',
    features: [
      'Custom Length Scheduling: Plan content for 1 to 30 days instantly.',
      'Intelligent Content Rotation: Cycles formats (Reels, Carousels, Stories, Long-form, Lives, Shorts, Polls) to maintain high feed variety.',
      'Best Post Timing: Uses historical platform peak engagement times (e.g. 9 AM for LinkedIn, 7 PM for TikTok) to schedule cards.',
      'Angle Integration: Offers actionable tips like "duet stitching" or "expectation vs. reality" visual angles for each day.'
    ],
    tips: [
      'Click on any Day Card to view the dynamic slide-down popover displaying visual plans and checklists.',
      'Map your weekly schedule against the calendar content types to save production time.'
    ],
    exampleInput: 'remote software engineer lifestyle',
    expectedOutput: 'A responsive calendar grid containing color-coded post cards with posting times and creative angles.'
  },
  {
    id: 'persona',
    title: 'Audience Persona Builder',
    emoji: '🧠',
    shortDesc: 'Build detailed demographic, psychographic, and strategic profiles of your ideal target viewer.',
    features: [
      'Full Persona Dossiers: Automatically generates realistic name, location, age, occupation, and income details.',
      'Psychology Breakdown: Identifies primary pain points, desires, and buying triggers.',
      'Media Consumption Profile: Pinpoints platforms used and content preferences (e.g., short-form tutorial, text case studies).',
      'Actionable Strategy: Outlines 3 precise rules to hook this viewer immediately.'
    ],
    tips: [
      'Adjust your scripts based on the generated pain points to speak directly to your target audience.',
      'Use the suggested language style (e.g. casual with metaphors, or dry/analytical) to adjust your voiceover tone.'
    ],
    exampleInput: 'freelance digital illustrator',
    expectedOutput: 'An immersive dashboard layout displaying the avatar, demographic statistics, pain-point lists, and strategy tips.'
  },
  {
    id: 'viral-score',
    title: 'Viral Score Predictor',
    emoji: '🔥',
    shortDesc: 'Test draft scripts or captions to score overall virality and view readability advice.',
    features: [
      'Algorithmic Scoring: Evaluates hook strength, emotional resonance, CTA presence, trend alignment, and readability.',
      'Actionable Critiques: Under each score bar, the engine describes how to optimize the content.',
      'Inline Optimizer: Dynamic feedback drawer that highlights copy adjustments to raise the overall score.'
    ],
    tips: [
      'If your Hook Strength is low, check the explanation and insert power words (like "secret", "never", or "fails").',
      'Always verify that your post contains a call-to-action (CTA) to avoid losing algorithm shares.'
    ],
    exampleInput: 'Want to scale your business? Here is a simple checklist. 1. Automate workflows. 2. delegate tasks. 3. hire freelancers. Let me know if this helps.',
    expectedOutput: 'A circular progress dial showing overall viral potential, metric breakdown lists, and a text recommendation drawer.'
  }
];

export default function HelpPage() {
  const [activeTab, setActiveTab] = useState<string>('repurpose');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const activeGuide = GUIDES.find((g) => g.id === activeTab) || GUIDES[0];

  const FAQS = [
    {
      q: 'Do I need real API keys to use these creator tools?',
      a: 'No. AegisCreator AI comes with a built-in algorithmic template engine in Python, meaning it functions completely offline without requiring OpenAI or Anthropic API keys.'
    },
    {
      q: 'How does the Content Repurposer choose different platform tones?',
      a: 'The backend parses your text and adapts it dynamically. YouTube gets outlines, Twitter/X gets threads, LinkedIn receives formal industry summaries, and Instagram gets Reels formats.'
    },
    {
      q: 'Can I export or copy the calendar and scripts generated?',
      a: 'Absolutely. We have integrated quick copy-to-clipboard utilities across the repurpose, hook generator, and calendar cards. Clicking "Copy" immediately places the formatted text into your clipboard.'
    },
    {
      q: 'How are the posting times calculated in the Calendar?',
      a: 'Times are mapped deterministically based on high-traffic windows for each social platform. For instance, LinkedIn focuses on morning slots, whereas TikTok rotates through peak evening hours.'
    }
  ];

  return (
    <div className="space-y-8 animate-fade-in-up font-dm-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/10 pb-6 reveal">
        <div className="space-y-1">
          <p className="text-secondary font-label-md text-label-md uppercase tracking-[0.2em] mb-2">Help Desk</p>
          <h2 className="font-playfair text-headline-lg text-primary">Help Center & Manual</h2>
          <p className="text-on-surface-variant text-sm max-w-xl leading-relaxed">
            Learn how to operate the advanced creator engines and optimize your social media workflows.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-primary bg-primary/10 border border-outline-variant/30 px-3 py-1.5 rounded-full font-semibold self-start md:self-auto">
          <span className="material-symbols-outlined text-sm">menu_book</span>
          <span>Documentation</span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2 select-none reveal stagger-1">
          <p className="text-[10px] font-bold text-outline uppercase tracking-widest px-3 pb-2">
            Features Guide
          </p>
          <div className="flex flex-col gap-1.5">
            {GUIDES.map((guide) => (
              <button
                key={guide.id}
                onClick={() => setActiveTab(guide.id)}
                className={`flex items-center justify-between text-left px-4 py-3 rounded-xl transition-all duration-300 cursor-pointer ${
                  activeTab === guide.id
                    ? 'bg-primary/15 text-primary font-bold shadow-sm border border-primary/20'
                    : 'text-outline hover:text-primary hover:bg-white/40'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-base">{guide.emoji}</span>
                  <span className="text-xs uppercase tracking-wide font-semibold">{guide.title}</span>
                </div>
                {activeTab === guide.id && <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>}
              </button>
            ))}
          </div>
        </div>

        {/* Manual Content Pane */}
        <div className="lg:col-span-3 space-y-8 reveal stagger-2">
          <div className="glass border border-outline-variant/10 rounded-[24px] p-6 md:p-8 space-y-6 shadow-sm">
            {/* Guide Header */}
            <div className="flex items-start gap-4 pb-4 border-b border-outline-variant/10">
              <span className="text-3xl bg-white/50 p-3 rounded-2xl border border-outline-variant/20 flex items-center justify-center">{activeGuide.emoji}</span>
              <div>
                <h2 className="text-lg font-playfair font-bold text-primary">{activeGuide.title} Guide</h2>
                <p className="text-on-surface-variant text-xs mt-1 leading-relaxed">{activeGuide.shortDesc}</p>
              </div>
            </div>

            {/* Core Features */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline">Key Capabilities</h3>
              <ul className="grid grid-cols-1 gap-2.5">
                {activeGuide.features.map((feature, idx) => {
                  const parts = feature.split(':');
                  return (
                    <li key={idx} className="flex items-start gap-3 bg-surface-container-low border border-outline-variant/10 p-3.5 rounded-xl text-xs leading-relaxed text-on-surface-variant">
                      <span className="text-primary font-bold mt-0.5">•</span>
                      <span>
                        {parts.length > 1 ? (
                          <>
                            <strong className="text-on-surface">{parts[0]}:</strong>
                            {parts.slice(1).join(':')}
                          </>
                        ) : (
                          feature
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Best Practice Tips */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-bold uppercase tracking-widest text-outline">Pro Tips for Creators</h3>
              <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 space-y-2">
                {activeGuide.tips.map((tip, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-primary leading-relaxed font-semibold">
                    <span className="mt-0.5">💡</span>
                    <p>{tip}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Example Sandbox */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-outline">Sample Test Input</h4>
                <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl p-3.5 text-xs text-on-surface font-mono leading-relaxed select-all cursor-pointer" title="Click to select all">
                  {activeGuide.exampleInput}
                </div>
              </div>
              <div className="space-y-2">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-outline">Expected Dashboard Layout</h4>
                <div className="bg-surface-container-low border border-outline-variant/15 rounded-xl p-3.5 text-xs text-on-surface-variant leading-relaxed italic">
                  {activeGuide.expectedOutput}
                </div>
              </div>
            </div>
          </div>

          {/* FAQS Accordion */}
          <div className="glass border border-outline-variant/10 rounded-[24px] p-6 md:p-8 space-y-4 shadow-sm">
            <h2 className="text-lg font-playfair font-bold text-primary mb-2">Frequently Asked Questions</h2>
            <div className="space-y-2">
              {FAQS.map((faq, idx) => {
                const isOpen = expandedFaq === idx;
                return (
                  <div
                    key={idx}
                    className="border border-outline-variant/10 rounded-xl overflow-hidden transition-all duration-200 bg-white/20"
                  >
                    <button
                      onClick={() => setExpandedFaq(isOpen ? null : idx)}
                      className="w-full flex items-center justify-between text-left px-4 py-3.5 text-xs font-semibold text-on-surface hover:text-primary transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <span className={`text-[10px] text-outline transform transition-transform duration-200 ${isOpen ? 'rotate-180 text-primary font-bold' : ''}`}>
                        ▼
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-3 text-xs text-on-surface-variant leading-relaxed border-t border-outline-variant/10 pt-2.5 bg-white/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

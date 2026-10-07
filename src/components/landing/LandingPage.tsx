import React from 'react';
import {
  CheckSquare,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Sun,
  Flame,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onGetStarted,
  onExploreDemo,
}) => {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-stone-200/80 dark:border-stone-800 bg-stone-50/80 dark:bg-stone-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-600 flex items-center justify-center text-white font-serif font-bold text-lg shadow-2xs">
              D
            </span>
            <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif">
              DayFlow
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onExploreDemo}
              className="px-3.5 py-1.5 text-xs font-semibold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100 transition-colors"
            >
              Explore Demo
            </button>
            <button
              onClick={onGetStarted}
              className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 hover:bg-stone-800 dark:hover:bg-white rounded-xl shadow-xs transition-colors"
            >
              Get Started
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-4xl mx-auto px-6 pt-16 sm:pt-24 pb-16 text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100/70 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800/60 text-xs font-medium text-amber-900 dark:text-amber-200">
            <Sparkles className="w-3.5 h-3.5 text-amber-600" />
            <span>The Personal Productivity & Daily Journal Operating System</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading max-w-3xl mx-auto leading-[1.15]">
            Plan your day. <br />
            <span className="text-amber-600 dark:text-amber-500">Tell your story.</span>
          </h1>

          <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
            Organize what you need to do, capture what actually happened, and turn your everyday moments into a personal story.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <button
              onClick={onGetStarted}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto px-6 py-3 text-sm font-semibold text-stone-800 dark:text-stone-200 bg-white dark:bg-stone-900 hover:bg-stone-100 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-800 rounded-xl transition-all"
            >
              Explore Live Demo
            </button>
          </div>

          {/* Interactive Interactive Preview Card */}
          <div className="mt-12 text-left bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-3xl p-6 sm:p-8 shadow-xl max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 dark:border-stone-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider font-semibold text-stone-400 font-mono">
                  Monday, September 28
                </span>
                <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-heading">
                  Good evening, Shamyuktha 👋
                </h3>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs font-medium text-amber-900 dark:text-amber-200">
                <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                <span>7 day streak</span>
              </div>
            </div>

            {/* Preview Task Row */}
            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                Today's Accomplishments
              </span>
              <div className="space-y-1.5">
                {[
                  { text: 'Complete Java assignment on Multi-threading', done: true },
                  { text: 'Attend DBMS lecture & database normalization lab', done: true },
                  { text: 'Work on DayFlow personal portfolio project', done: true },
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/50 border border-stone-100 dark:border-stone-700/60 text-xs"
                  >
                    <CheckCircle2 className="w-4 h-4 text-amber-600" />
                    <span className="line-through text-stone-500 dark:text-stone-400">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview Diary Excerpt */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/40 text-xs space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-900 dark:text-stone-100">
                  A Productive Rhythm & Clear Progress
                </span>
                <span>😊 Happy</span>
              </div>
              <p className="text-stone-600 dark:text-stone-300 font-serif italic leading-relaxed">
                “Today felt grounded and genuinely fulfilling. Finishing the Java assignment before lunch gave me momentum. The evening workout helped clear my mind...”
              </p>
            </div>
          </div>
        </div>

        {/* 4 Core Pillars: Plan, Live, Remember, Reflect */}
        <section className="border-t border-stone-200/80 dark:border-stone-800 bg-white dark:bg-stone-900/60 py-16">
          <div className="max-w-6xl mx-auto px-6 space-y-10">
            <div className="text-center space-y-2 max-w-xl mx-auto">
              <span className="text-xs uppercase tracking-wider font-semibold text-amber-600 dark:text-amber-500 font-mono">
                The DayFlow Architecture
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
                Four phases, one seamless rhythm
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Pillar 1 */}
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 font-serif-heading">
                  1. Plan
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Organize what you need to accomplish with clear categories, priorities, and realistic deadlines.
                </p>
              </div>

              {/* Pillar 2 */}
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 font-serif-heading">
                  2. Live
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Track your daily progress smoothly without noisy distractions or cumbersome gamification.
                </p>
              </div>

              {/* Pillar 3 */}
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 flex items-center justify-center">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 font-serif-heading">
                  3. Remember
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Write your story in a calm distraction-free editor with rich formatting, autosave, and mood tracking.
                </p>
              </div>

              {/* Pillar 4 */}
              <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-800/40 border border-stone-200/70 dark:border-stone-800 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-950/60 text-violet-800 dark:text-violet-300 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-semibold text-stone-900 dark:text-stone-100 font-serif-heading">
                  4. Reflect
                </h3>
                <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">
                  Understand your growth through daily prompts, special moments, and journal reflections.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-200/80 dark:border-stone-800 py-8 px-6 text-center text-xs text-stone-500 dark:text-stone-400">
        <p>DayFlow — Plan your day. Live your day. Record your day. Reflect on your progress.</p>
      </footer>
    </div>
  );
};

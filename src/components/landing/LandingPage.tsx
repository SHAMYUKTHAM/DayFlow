import React, { useEffect, useState, useRef } from 'react';
import {
  CheckSquare,
  BookOpen,
  Calendar,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  Mail,
  ChevronRight,
  Menu,
  X,
  Lock,
  User as UserIcon,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LandingPageProps {
  onGetStarted: () => void;
  onExploreDemo: () => void;
}

const useIntersectionObserver = (options = {}) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, { threshold: 0.1, ...options });

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, [options]);

  return { ref, isIntersecting };
};

const FadeIn: React.FC<{ children: React.ReactNode; delay?: number }> = ({ children, delay = 0 }) => {
  const { ref, isIntersecting } = useIntersectionObserver();
  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out ${
        isIntersecting ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      }`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted, onExploreDemo }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    // In this mock application, any password is accepted.
    // It creates or logs in a mock user based on the email.
    login(email);
    setIsAuthModalOpen(false);
    onGetStarted();
  };

  const openAuthModal = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-stone-950 text-stone-900 dark:text-stone-100 font-sans overflow-x-hidden relative">
      {/* Navigation */}
      <header
        className={`fixed top-0 w-full z-40 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/80 dark:bg-stone-950/80 backdrop-blur-md border-b border-stone-200/50 dark:border-stone-800' 
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <button 
            onClick={() => scrollToSection('home')}
            className="flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-stone-800 to-stone-900 dark:from-stone-700 dark:to-stone-800 flex items-center justify-center text-white font-serif font-bold text-lg shadow-sm group-hover:scale-105 transition-transform">
              D
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif">
              DayFlow
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('home')} className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">Home</button>
            <button onClick={() => scrollToSection('about')} className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">About</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('contact')} className="text-sm font-medium text-stone-600 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 transition-colors">Contact</button>
            
            <button
              onClick={() => openAuthModal('signup')}
              className="px-5 py-2.5 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all flex items-center gap-2"
            >
              Sign Up
            </button>
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-stone-600 dark:text-stone-400"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-white dark:bg-stone-950 border-b border-stone-200 dark:border-stone-800 shadow-lg py-4 px-6 flex flex-col gap-4">
            <button onClick={() => scrollToSection('home')} className="text-left py-2 font-medium">Home</button>
            <button onClick={() => scrollToSection('about')} className="text-left py-2 font-medium">About</button>
            <button onClick={() => scrollToSection('how-it-works')} className="text-left py-2 font-medium">How It Works</button>
            <button onClick={() => scrollToSection('contact')} className="text-left py-2 font-medium">Contact</button>
            <button
              onClick={() => {
                setIsMobileMenuOpen(false);
                openAuthModal('signup');
              }}
              className="mt-2 py-3 w-full justify-center text-sm font-semibold text-white bg-stone-900 dark:bg-stone-100 dark:text-stone-900 rounded-xl flex items-center gap-2"
            >
              Sign Up
            </button>
          </div>
        )}
      </header>

      {/* SECTION 1 - HERO / HOME */}
      <section id="home" className="pt-32 pb-20 md:pt-40 md:pb-32 px-6">
        <div className="max-w-6xl mx-auto text-center space-y-8">
          <FadeIn>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading max-w-4xl mx-auto leading-[1.1]">
              Your Days, Organized.<br />
              <span className="text-stone-500 dark:text-stone-400">Your Journey, Remembered.</span>
            </h1>
          </FadeIn>
          
          <FadeIn delay={150}>
            <p className="text-lg md:text-xl text-stone-600 dark:text-stone-400 max-w-2xl mx-auto leading-relaxed">
              Bring your tasks, daily experiences, and personal reflections together in one beautiful space. Plan what matters, capture what happens, and watch your journey unfold with DayFlow.
            </p>
          </FadeIn>

          <FadeIn delay={300}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-4 text-base font-semibold text-white bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                Let's Track
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => scrollToSection('about')}
                className="w-full sm:w-auto px-8 py-4 text-base font-medium text-stone-700 dark:text-stone-300 bg-white/50 dark:bg-stone-900/50 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-2xl transition-all"
              >
                Discover DayFlow
              </button>
            </div>
          </FadeIn>

          {/* Hero Visual Preview */}
          <FadeIn delay={500}>
            <div className="mt-16 relative max-w-4xl mx-auto">
              {/* Decorative background glow */}
              <div className="absolute -inset-1 bg-gradient-to-r from-stone-200 to-stone-300 dark:from-stone-800 dark:to-stone-700 rounded-[2rem] blur-lg opacity-50"></div>
              
              <div className="relative bg-white dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-[2rem] p-4 sm:p-8 shadow-2xl overflow-hidden flex flex-col md:flex-row gap-6">
                
                {/* Dashboard Left Side: Tasks */}
                <div className="flex-1 space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-widest">Today</p>
                      <h3 className="text-2xl font-serif-heading font-bold text-stone-900 dark:text-stone-100">Tasks</h3>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 flex items-center justify-center">
                      <CheckSquare className="w-4 h-4 text-stone-500" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { t: 'Finalize presentation deck', d: true },
                      { t: 'Review pull requests', d: true },
                      { t: 'Evening reading (30 mins)', d: false },
                    ].map((task, i) => (
                      <div key={i} className={`flex items-start gap-3 p-4 rounded-xl border ${task.d ? 'bg-stone-50 dark:bg-stone-800/50 border-transparent' : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700'} shadow-sm`}>
                        <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center ${task.d ? 'bg-stone-800 text-white dark:bg-stone-200 dark:text-stone-900' : 'border-2 border-stone-300 dark:border-stone-600'}`}>
                          {task.d && <CheckCircle2 className="w-3.5 h-3.5" />}
                        </div>
                        <span className={`text-sm ${task.d ? 'line-through text-stone-400 dark:text-stone-500' : 'text-stone-700 dark:text-stone-300 font-medium'}`}>
                          {task.t}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Dashboard Right Side: Journal */}
                <div className="flex-1 bg-[#FAF9F6] dark:bg-stone-950/50 rounded-2xl p-6 border border-stone-100 dark:border-stone-800/50 flex flex-col">
                  <div className="flex items-center gap-2 mb-4 text-amber-700 dark:text-amber-500 text-sm font-medium">
                    <BookOpen className="w-4 h-4" />
                    Journal Entry
                  </div>
                  <h4 className="text-xl font-serif font-semibold text-stone-900 dark:text-stone-100 mb-3">
                    A moment of clarity
                  </h4>
                  <p className="text-stone-600 dark:text-stone-400 font-serif leading-relaxed text-sm flex-1">
                    "The afternoon walk really helped. Instead of rushing through the final tasks, I took a moment to organize my thoughts. The presentation is finally coming together..."
                  </p>
                  <div className="mt-4 pt-4 border-t border-stone-200 dark:border-stone-800/50 flex items-center justify-between text-xs text-stone-400 font-mono">
                    <span>Oct 9, 2026</span>
                    <span>168 words</span>
                  </div>
                </div>

              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 2 - ABOUT DAYFLOW */}
      <section id="about" className="py-24 px-6 bg-white dark:bg-stone-900/40 border-y border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
                More Than Tasks.<br />A Record of Your Life.
              </h2>
              <p className="text-lg text-stone-600 dark:text-stone-400">
                Every day has two sides: what you plan to do and what you actually experience. DayFlow brings both together, helping you stay organized while preserving the little moments that make your journey yours.
              </p>
            </div>
          </FadeIn>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <CheckSquare className="w-6 h-6" />,
                title: 'Plan Your Day',
                desc: 'Turn your intentions into organized tasks. Keep your priorities clear and approach each day with purpose.'
              },
              {
                icon: <BookOpen className="w-6 h-6" />,
                title: 'Capture Your Story',
                desc: 'Record what happened during your day, write personal diary entries, and preserve the experiences you want to remember.'
              },
              {
                icon: <Calendar className="w-6 h-6" />,
                title: 'Reflect on Your Journey',
                desc: 'Bring your daily plans and personal reflections together to build a more meaningful record of your progress over time.'
              }
            ].map((card, i) => (
              <FadeIn key={i} delay={i * 150}>
                <div className="bg-[#FAFAFA] dark:bg-stone-900 p-8 rounded-3xl border border-stone-200/60 dark:border-stone-800 hover:shadow-lg transition-all duration-300 h-full">
                  <div className="w-12 h-12 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-800 dark:text-stone-200 mb-6">
                    {card.icon}
                  </div>
                  <h3 className="text-xl font-bold text-stone-900 dark:text-stone-100 font-serif-heading mb-3">
                    {card.title}
                  </h3>
                  <p className="text-stone-600 dark:text-stone-400 leading-relaxed text-sm">
                    {card.desc}
                  </p>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={400}>
            <div className="mt-20 p-8 md:p-12 bg-stone-900 dark:bg-stone-950 rounded-[2.5rem] text-center text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-stone-800 via-stone-900 to-stone-900 opacity-50"></div>
              <div className="relative z-10 max-w-2xl mx-auto space-y-6">
                <h3 className="text-2xl md:text-3xl font-serif-heading font-semibold">The DayFlow Approach</h3>
                <p className="text-stone-300 text-lg leading-relaxed">
                  Daily tasks often live in one place while personal reflections live somewhere else. This separation makes it harder to connect daily actions with personal growth. We bring them into one coherent experience.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 3 - HOW IT WORKS */}
      <section id="how-it-works" className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <FadeIn>
            <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
                From Daily Plans to Personal Progress.
              </h2>
              <p className="text-lg text-stone-600 dark:text-stone-400">
                A simple flow that helps you organize your day and remember your journey.
              </p>
            </div>
          </FadeIn>

          <div className="relative">
            {/* Connecting line (desktop) */}
            <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] h-0.5 bg-stone-200 dark:bg-stone-800 z-0"></div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
              {[
                {
                  step: '01',
                  title: 'Start With Your Day',
                  desc: 'Open DayFlow and focus on the day ahead.',
                  icon: <Calendar className="w-5 h-5" />
                },
                {
                  step: '02',
                  title: 'Add Your Tasks',
                  desc: 'Write down your priorities and organize the things you need to accomplish.',
                  icon: <CheckSquare className="w-5 h-5" />
                },
                {
                  step: '03',
                  title: 'Record Your Moments',
                  desc: 'At the end of the day, capture your experiences and thoughts in your diary.',
                  icon: <BookOpen className="w-5 h-5" />
                },
                {
                  step: '04',
                  title: 'Look Back at Your Journey',
                  desc: 'Revisit your recorded days and see how your activities become your personal journey.',
                  icon: <TrendingUp className="w-5 h-5" />
                }
              ].map((item, i) => (
                <FadeIn key={i} delay={i * 200}>
                  <div className="relative flex flex-col md:items-center md:text-center group">
                    {/* Mobile connecting line */}
                    {i !== 3 && <div className="md:hidden absolute top-16 left-6 w-0.5 h-full bg-stone-200 dark:bg-stone-800 -z-10"></div>}
                    
                    <div className="flex items-center gap-6 md:gap-0 md:flex-col w-full relative z-10">
                      <div className="relative z-10 w-12 h-12 rounded-full bg-[#FAFAFA] dark:bg-stone-950 border-2 border-stone-900 dark:border-stone-100 flex items-center justify-center text-stone-900 dark:text-stone-100 font-bold mb-0 md:mb-6 shrink-0 group-hover:scale-110 group-hover:bg-stone-900 group-hover:text-white dark:group-hover:bg-stone-100 dark:group-hover:text-stone-900 transition-all duration-300">
                        {item.step}
                      </div>
                      <div className="space-y-3 flex-1 flex flex-col items-center text-center">
                        <div className="flex flex-col items-center justify-center gap-2 text-stone-900 dark:text-stone-100 font-serif-heading font-semibold text-xl">
                          <span className="text-stone-400 dark:text-stone-500 shrink-0">{item.icon}</span>
                          <span>{item.title}</span>
                        </div>
                        <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed max-w-[220px]">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4 - CONTACT */}
      <section id="contact" className="py-24 px-6 bg-white dark:bg-stone-900/40 border-t border-stone-200/50 dark:border-stone-800/50">
        <div className="max-w-3xl mx-auto text-center space-y-8">
          <FadeIn>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 dark:text-stone-100 font-serif-heading">
              Let's Connect.
            </h2>
            <p className="mt-4 text-lg text-stone-600 dark:text-stone-400">
              Have a question, an idea, or feedback about DayFlow? I'd love to hear from you.
            </p>
          </FadeIn>

          <FadeIn delay={200}>
            <div className="mt-10 bg-[#FAFAFA] dark:bg-stone-900 border border-stone-200/60 dark:border-stone-800 rounded-3xl p-8 md:p-12 shadow-sm max-w-xl mx-auto flex flex-col items-center gap-6">
              <div className="w-16 h-16 bg-stone-100 dark:bg-stone-800 rounded-2xl flex items-center justify-center text-stone-800 dark:text-stone-200">
                <Mail className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <p className="text-sm text-stone-500 font-medium uppercase tracking-wider">Reach out via Email</p>
                <a 
                  href="https://mail.google.com/mail/?view=cm&fs=1&to=manstermain.18@gmail.com&su=DayFlow%20-%20Inquiry" 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xl md:text-2xl font-bold text-stone-900 dark:text-stone-100 hover:text-amber-600 dark:hover:text-amber-500 transition-colors"
                >
                  manstermain.18@gmail.com
                </a>
              </div>
              <a 
                href="https://mail.google.com/mail/?view=cm&fs=1&to=manstermain.18@gmail.com&su=DayFlow%20-%20Inquiry"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 px-8 py-3 text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Email Me
              </a>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-stone-200/60 dark:border-stone-800 bg-[#FAFAFA] dark:bg-stone-950 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-stone-800 to-stone-900 dark:from-stone-700 dark:to-stone-800 flex items-center justify-center text-white font-serif font-bold text-sm shadow-sm">
              D
            </div>
            <div>
              <span className="font-bold text-stone-900 dark:text-stone-100 font-serif">DayFlow</span>
              <p className="text-xs text-stone-500 mt-0.5">Make every day meaningful.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-stone-500 dark:text-stone-400">
            <button onClick={() => scrollToSection('home')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">Home</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">About</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">How It Works</button>
            <button onClick={() => scrollToSection('contact')} className="hover:text-stone-900 dark:hover:text-stone-100 transition-colors">Contact</button>
          </div>
          
          <div className="text-xs text-stone-400">
            &copy; {new Date().getFullYear()} DayFlow. All rights reserved.
          </div>
        </div>
      </footer>

      {/* AUTHENTICATION MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setIsAuthModalOpen(false)}
          ></div>
          <div className="relative bg-white dark:bg-stone-900 rounded-3xl p-8 max-w-md w-full shadow-2xl border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setIsAuthModalOpen(false)}
              className="absolute top-6 right-6 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold font-serif-heading text-stone-900 dark:text-stone-100">
                {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
              </h3>
              <p className="text-sm text-stone-500 dark:text-stone-400 mt-2">
                {authMode === 'login' 
                  ? 'Enter your credentials to access your DayFlow.' 
                  : 'Start your journey with DayFlow today.'}
              </p>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:text-stone-100 text-sm"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-stone-700 dark:text-stone-300">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full pl-10 pr-4 py-2.5 bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/50 dark:text-stone-100 text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 bg-stone-900 hover:bg-stone-800 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
              >
                {authMode === 'login' ? 'Sign In' : 'Sign Up'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-stone-500">
              {authMode === 'login' ? (
                <p>
                  Don't have an account?{' '}
                  <button onClick={() => setAuthMode('signup')} className="font-semibold text-stone-900 dark:text-stone-200 hover:underline">
                    Sign up
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{' '}
                  <button onClick={() => setAuthMode('login')} className="font-semibold text-stone-900 dark:text-stone-200 hover:underline">
                    Log in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};


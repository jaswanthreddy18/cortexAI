import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import {
  ArrowDown,
  ArrowRight,
  Check,
  ChevronDown,
  Code2,
  Eye,
  FileText,
  Layers3,
  MessageSquare,
  Presentation,
  Search,
  Sparkles,
  Zap,
} from 'lucide-react';
import CortexLogo from '../components/CortexLogo';

const features = [
  {
    icon: MessageSquare,
    title: 'Natural conversations',
    description: 'Ask questions, explore ideas, and keep the conversation moving with context.',
  },
  {
    icon: Code2,
    title: 'A coding partner',
    description: 'Get help writing, understanding, and debugging code across common languages.',
  },
  {
    icon: FileText,
    title: 'PDF assistance',
    description: 'Work with PDF documents and get focused answers about their contents.',
  },
  {
    icon: Presentation,
    title: 'Presentation creation',
    description: 'Turn a topic or outline into a structured presentation to download.',
  },
  {
    icon: Search,
    title: 'Web research',
    description: 'Search for current information and get useful sources with your answer.',
  },
  {
    icon: Eye,
    title: 'Image understanding',
    description: 'Bring an image into the conversation and ask CortexAI what it shows.',
  },
];

const questions = [
  {
    question: 'What can I use CortexAI for?',
    answer: 'Use CortexAI to chat, work on code, read PDFs, create presentations, search the web, and ask questions about images.',
  },
  {
    question: 'How do I sign in?',
    answer: 'Choose Continue with Google and complete the secure Google sign-in flow. Your conversations become available after sign-in.',
  },
  {
    question: 'Can I return to earlier conversations?',
    answer: 'Yes. Your conversation history appears in the sidebar after you sign in.',
  },
  {
    question: 'Do I need to choose an agent?',
    answer: 'No. Auto can choose a suitable agent for your request, or you can select Chat, Coding, PDF, Presentation, Search, or Vision yourself.',
  },
];

const LandingPage = ({ onGoogleLogin, isSigningIn, error }) => {
  const [menuOpen, setMenuOpen] = useState(false);

  const beginSignIn = () => {
    setMenuOpen(false);
    onGoogleLogin();
  };

  return (
    <div className="landing-page min-h-screen overflow-x-hidden text-[#28253c]">
      <header className="sticky top-0 z-40 border-b border-[#e9e6f3]/80 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <a href="#home" className="flex shrink-0 items-center gap-2.5" aria-label="CortexAI home">
            <CortexLogo size={42} />
            <span className="text-lg font-bold tracking-tight text-[#28253c]">CortexAI</span>
          </a>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Main navigation">
            {[
              ['Home', '#home'],
              ['Features', '#features'],
              ['About', '#about'],
              ['Pricing', '#pricing'],
              ['FAQ', '#faq'],
            ].map(([label, href], index) => (
              <a
                key={label}
                href={href}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors hover:bg-[#f1efff] hover:text-[#635be0] ${index === 0 ? 'bg-[#f1efff] text-[#635be0]' : 'text-[#68657a]'}`}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="hidden sm:block">
            <button
              type="button"
              onClick={beginSignIn}
              disabled={isSigningIn}
              className="rounded-xl bg-[#24233e] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_20px_rgba(39,35,80,0.16)] transition hover:bg-[#3a3767] disabled:cursor-wait disabled:opacity-70"
            >
              {isSigningIn ? 'Signing in…' : 'Sign in'}
            </button>
          </div>

          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#e9e6f3] text-[#55516e] sm:hidden"
          >
            {menuOpen ? <ChevronDown size={19} className="rotate-180" /> : <span className="text-xl leading-none">☰</span>}
          </button>
        </div>
        {menuOpen && (
          <div className="border-t border-[#eeeaf7] bg-white px-5 py-3 sm:hidden">
            <nav className="mx-auto flex max-w-7xl flex-col gap-1" aria-label="Mobile navigation">
              {[
                ['Home', '#home'], ['Features', '#features'], ['About', '#about'], ['Pricing', '#pricing'], ['FAQ', '#faq'],
              ].map(([label, href]) => (
                <a key={label} href={href} onClick={() => setMenuOpen(false)} className="rounded-lg px-3 py-2.5 text-sm text-[#55516e] hover:bg-[#f7f5ff]">
                  {label}
                </a>
              ))}
              <button type="button" onClick={beginSignIn} className="mt-2 rounded-xl bg-[#24233e] px-4 py-3 text-sm font-semibold text-white">
                Continue with Google
              </button>
            </nav>
          </div>
        )}
      </header>

      <main>
        <section id="home" className="landing-hero relative scroll-mt-24 px-5 pb-20 pt-20 sm:px-8 sm:pt-28">
          <div className="landing-glow landing-glow-one" aria-hidden="true" />
          <div className="landing-glow landing-glow-two" aria-hidden="true" />
          <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#e6e2f5] bg-white/80 px-4 py-2 text-xs font-semibold tracking-wide text-[#6e68a4] shadow-sm">
              <Sparkles size={14} className="text-[#635be0]" />
              YOUR EVERYDAY AI WORKSPACE
            </div>
            <div className="hero-orb mb-8" aria-hidden="true" />
            <h1 className="max-w-4xl text-4xl font-semibold leading-[1.12] tracking-[-0.045em] text-[#29264b] sm:text-6xl lg:text-7xl">
              Smarter conversations
              <span className="mt-2 block font-serif font-medium italic text-[#665ce0]">every single day.</span>
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-7 text-[#727087] sm:text-lg sm:leading-8">
              Meet CortexAI, your friendly AI workspace for clear answers, creative ideas, and everyday work—all in one place.
            </p>
            {error && <p role="alert" className="mt-4 max-w-xl rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</p>}
            <div className="mt-8 flex w-full flex-col justify-center gap-3 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={beginSignIn}
                disabled={isSigningIn}
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-[#635be0] px-6 py-3 text-sm font-semibold text-white shadow-[0_12px_28px_rgba(99,91,224,0.25)] transition hover:-translate-y-0.5 hover:bg-[#554bd0] disabled:cursor-wait disabled:opacity-70"
              >
                <FcGoogle size={19} />
                {isSigningIn ? 'Signing in…' : 'Continue with Google'}
                <ArrowRight size={16} />
              </button>
              <a href="#features" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-[#dedbed] bg-white/80 px-6 py-3 text-sm font-semibold text-[#4d4969] transition hover:border-[#cac4e8] hover:bg-white">
                Explore CortexAI <ArrowDown size={15} />
              </a>
            </div>
            <p className="mt-4 text-xs text-[#9996a9]">Sign in with your Google account to open your workspace.</p>

            <div className="product-preview mt-16 w-full max-w-5xl overflow-hidden rounded-[26px] border border-white bg-white/90 p-2 shadow-[0_35px_100px_rgba(74,67,147,0.16)] sm:mt-20 sm:p-3">
              <div className="flex h-10 items-center gap-2 border-b border-[#efedf6] px-3 sm:h-12 sm:px-5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#f2a39d]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#f3d482]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#91d7a9]" />
                <div className="ml-4 rounded-lg bg-[#f7f6fb] px-4 py-1.5 text-[10px] text-[#8c899c] sm:ml-8 sm:px-12 sm:text-xs">CortexAI workspace</div>
              </div>
              <div className="grid min-h-[270px] grid-cols-1 bg-[#fcfcff] sm:min-h-[370px] sm:grid-cols-[190px_1fr]">
                <aside className="hidden border-r border-[#efedf6] p-4 text-left sm:block">
                  <div className="flex items-center gap-2 text-sm font-bold text-[#302d53]"><CortexLogo size={27} /> CortexAI</div>
                  <div className="mt-6 rounded-lg border border-[#eeebf6] bg-white px-3 py-2 text-[11px] text-[#a3a0b1]">Search conversations</div>
                  <p className="mb-2 mt-6 px-2 text-[9px] font-semibold uppercase tracking-widest text-[#aaa7b7]">History</p>
                  <div className="space-y-2">
                    <div className="rounded-lg bg-[#f1efff] px-2.5 py-2 text-[10px] text-[#615b9a]">Getting started</div>
                    <div className="px-2.5 py-2 text-[10px] text-[#aaa7b7]">Ideas for this week</div>
                    <div className="px-2.5 py-2 text-[10px] text-[#aaa7b7]">Java code help</div>
                  </div>
                </aside>
                <div className="flex flex-col items-center justify-center px-4 py-8 sm:px-10">
                  <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#f1efff] text-[#635be0]"><Sparkles size={23} /></div>
                  <p className="text-lg font-semibold text-[#302d53] sm:text-2xl">Good morning. What are we working on?</p>
                  <p className="mt-2 text-xs text-[#9793a8] sm:text-sm">Chat, create, research, and get things done with CortexAI.</p>
                  <div className="mt-7 w-full max-w-xl rounded-2xl border border-[#e7e3f4] bg-white p-3 text-left shadow-[0_8px_26px_rgba(92,82,172,0.08)] sm:p-4">
                    <p className="px-2 py-2 text-xs text-[#a09daf] sm:text-sm">Ask CortexAI anything…</p>
                    <div className="mt-2 flex items-center justify-between border-t border-[#f1eff7] pt-3">
                      <div className="flex gap-2"><span className="rounded-lg bg-[#f5f3ff] px-2.5 py-1.5 text-[10px] text-[#716bb0]">Chat</span><span className="rounded-lg bg-[#f5f3ff] px-2.5 py-1.5 text-[10px] text-[#716bb0]">Coding</span><span className="hidden rounded-lg bg-[#f5f3ff] px-2.5 py-1.5 text-[10px] text-[#716bb0] sm:block">Presentation</span></div>
                      <span className="grid h-7 w-7 place-items-center rounded-lg bg-[#635be0] text-white"><ArrowRight size={14} /></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="scroll-mt-[76px] px-5 pb-20 pt-3 sm:px-8 sm:pb-28 sm:pt-5">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7770c3]">Built for your day</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#29264b] sm:text-5xl">Powerful tools. One simple workspace.</h2>
              <p className="mt-5 text-base leading-7 text-[#77748a]">Move from a question to a finished task without changing how you work.</p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {features.map(({ icon: Icon, title, description }, index) => (
                <article key={title} className="feature-card group rounded-3xl border border-white bg-white/80 p-6 shadow-[0_12px_40px_rgba(87,78,150,0.055)] transition hover:-translate-y-1 hover:shadow-[0_20px_48px_rgba(87,78,150,0.11)] sm:p-7">
                  <span className={`grid h-12 w-12 place-items-center rounded-2xl ${index % 2 ? 'bg-[#eef0ff] text-[#665ce0]' : 'bg-[#f1efff] text-[#635be0]'}`}><Icon size={21} strokeWidth={1.8} /></span>
                  <h3 className="mt-6 text-lg font-semibold text-[#302d53]">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-[#77748a]">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="scroll-mt-20 px-5 py-16 sm:px-8 sm:py-24">
          <div className="about-panel mx-auto grid max-w-6xl items-center gap-10 overflow-hidden rounded-[32px] border border-white/80 px-6 py-10 sm:px-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr]">
            <div className="relative flex min-h-[280px] items-center justify-center">
              <div className="about-orb" aria-hidden="true" />
              <div className="relative z-10 w-full max-w-sm space-y-3">
                <div className="ml-auto max-w-[260px] rounded-2xl border border-white bg-white/90 px-4 py-3 text-sm text-[#504c69] shadow-lg">Can you help me make sense of this?</div>
                <div className="max-w-[275px] rounded-2xl border border-white bg-white/90 px-4 py-3 text-sm text-[#504c69] shadow-lg">Absolutely. Let's take it one step at a time.</div>
                <div className="ml-auto max-w-[250px] rounded-2xl border border-white bg-white/90 px-4 py-3 text-sm text-[#504c69] shadow-lg">That makes it much clearer. Thanks!</div>
              </div>
            </div>
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7770c3]">About CortexAI</span>
              <h2 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-[#29264b] sm:text-4xl">A thoughtful assistant for the work and ideas that matter.</h2>
              <p className="mt-5 text-base leading-7 text-[#77748a]">CortexAI brings focused AI agents and your conversation history together in one calm workspace. Start with a question, choose a specialist when you need one, and continue at your own pace.</p>
              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                {['One place for conversations', 'Specialized AI agents', 'History that stays accessible', 'Simple Google sign-in'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm font-medium text-[#55516e]"><span className="grid h-5 w-5 place-items-center rounded-full bg-[#ece9ff] text-[#635be0]"><Check size={12} /></span>{item}</div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="scroll-mt-[76px] px-5 pb-20 pt-3 sm:px-8 sm:pb-28 sm:pt-5">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-2xl text-center">
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7770c3]">Plans</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#29264b] sm:text-5xl">A clear place to start.</h2>
              <p className="mt-5 text-base leading-7 text-[#77748a]">Sign in and explore CortexAI. More plan options can be added as they become available.</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-5xl gap-5 md:grid-cols-3">
              <article className="rounded-3xl border border-[#e9e6f3] bg-white p-7 shadow-[0_12px_40px_rgba(87,78,150,0.06)]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f1efff] text-[#635be0]"><Sparkles size={20} /></span>
                <h3 className="mt-5 text-xl font-semibold text-[#302d53]">Free</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#77748a]">A friendly way to get started with CortexAI.</p>
                <p className="mt-5 text-3xl font-semibold text-[#28253c]">$0 <span className="text-sm font-normal text-[#8b889b]">/ always</span></p>
                <ul className="mt-6 space-y-3 text-sm text-[#5f5b73]">
                  {['Chat and conversation history', 'Access to available agents', 'Google account sign-in'].map((item) => <li key={item} className="flex gap-2"><Check size={16} className="shrink-0 text-[#635be0]" />{item}</li>)}
                </ul>
                <button type="button" onClick={beginSignIn} disabled={isSigningIn} className="mt-8 w-full rounded-xl bg-[#635be0] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#554bd0] disabled:opacity-70">Continue with Google</button>
              </article>
              <article className="relative rounded-3xl border border-[#dcd7f5] bg-gradient-to-b from-[#f6f4ff] to-white p-7 shadow-[0_18px_50px_rgba(99,91,224,0.1)]">
                <span className="absolute right-5 top-5 rounded-full bg-white px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#716bb0]">Coming soon</span>
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-white text-[#635be0] shadow-sm"><Zap size={20} /></span>
                <h3 className="mt-5 text-xl font-semibold text-[#302d53]">Plus</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#77748a]">More room for deeper, everyday work.</p>
                <p className="mt-5 text-3xl font-semibold text-[#28253c]">Soon</p>
                <ul className="mt-6 space-y-3 text-sm text-[#5f5b73]">
                  {['Expanded usage options', 'More workspace controls', 'Priority features as available'].map((item) => <li key={item} className="flex gap-2"><Check size={16} className="shrink-0 text-[#635be0]" />{item}</li>)}
                </ul>
                <button type="button" disabled className="mt-8 w-full cursor-not-allowed rounded-xl border border-[#e4e1ee] bg-white px-4 py-3 text-sm font-semibold text-[#87839a]">Coming soon</button>
              </article>
              <article className="rounded-3xl border border-[#e9e6f3] bg-white p-7 shadow-[0_12px_40px_rgba(87,78,150,0.06)]">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f1efff] text-[#635be0]"><Layers3 size={20} /></span>
                <span className="mt-5 inline-block rounded-full bg-[#f5f3ff] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#716bb0]">Coming soon</span>
                <h3 className="mt-3 text-xl font-semibold text-[#302d53]">Team</h3>
                <p className="mt-2 min-h-12 text-sm leading-6 text-[#77748a]">A shared workspace for teams and collaborators.</p>
                <p className="mt-5 text-3xl font-semibold text-[#28253c]">Soon</p>
                <ul className="mt-6 space-y-3 text-sm text-[#5f5b73]">
                  {['Shared team conversations', 'Workspace administration', 'Plans announced here'].map((item) => <li key={item} className="flex gap-2"><Check size={16} className="shrink-0 text-[#635be0]" />{item}</li>)}
                </ul>
                <button type="button" disabled className="mt-8 w-full cursor-not-allowed rounded-xl border border-[#e4e1ee] bg-white px-4 py-3 text-sm font-semibold text-[#87839a]">Coming soon</button>
              </article>
            </div>
          </div>
        </section>

        <section id="faq" className="scroll-mt-20 px-5 py-20 sm:px-8 sm:py-28">
          <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7770c3]">FAQ</span>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[#29264b] sm:text-5xl">Good to know.</h2>
              <p className="mt-5 max-w-sm text-base leading-7 text-[#77748a]">A few quick answers to help you get started with CortexAI.</p>
            </div>
            <div className="space-y-3">
              {questions.map(({ question, answer }, index) => (
                <details key={question} open={index === 0} className="group rounded-2xl border border-[#e9e6f3] bg-white/90 p-5 shadow-[0_8px_26px_rgba(87,78,150,0.045)]">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-[#302d53] marker:hidden">
                    {question}
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[#eeeaf7] text-[#7770c3] transition group-open:rotate-180"><ChevronDown size={16} /></span>
                  </summary>
                  <p className="mt-4 pr-10 text-sm leading-6 text-[#77748a]">{answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-5 pb-20 pt-8 sm:px-8 sm:pb-28">
          <div className="cta-panel mx-auto flex max-w-6xl flex-col items-center rounded-[32px] px-6 py-12 text-center sm:px-12 sm:py-16">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 text-white"><Sparkles size={22} /></div>
            <h2 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">Make space for better ideas.</h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-white/75 sm:text-base">Sign in to start a conversation and pick up right where you left off.</p>
            <button type="button" onClick={beginSignIn} disabled={isSigningIn} className="mt-7 inline-flex items-center gap-3 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-[#5149bd] shadow-lg transition hover:-translate-y-0.5 hover:bg-[#f6f4ff] disabled:opacity-70"><FcGoogle size={19} />Continue with Google<ArrowRight size={15} /></button>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e9e6f3] bg-white/70 px-5 py-10 sm:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <a href="#home" className="inline-flex items-center gap-2.5"><CortexLogo size={38} /><span className="text-base font-bold text-[#302d53]">CortexAI</span></a>
            <p className="mt-4 text-sm leading-6 text-[#77748a]">A friendly AI workspace for conversations, ideas, and getting things done.</p>
          </div>
          <div className="grid grid-cols-2 gap-x-12 gap-y-7 text-sm sm:grid-cols-3">
            <div><h3 className="font-semibold text-[#302d53]">Explore</h3><div className="mt-3 space-y-2"><a className="block text-[#77748a] hover:text-[#635be0]" href="#features">Features</a><a className="block text-[#77748a] hover:text-[#635be0]" href="#about">About</a></div></div>
            <div><h3 className="font-semibold text-[#302d53]">Help</h3><div className="mt-3 space-y-2"><a className="block text-[#77748a] hover:text-[#635be0]" href="#faq">FAQ</a><button type="button" onClick={beginSignIn} className="block text-left text-[#77748a] hover:text-[#635be0]">Sign in</button></div></div>
            <div><h3 className="font-semibold text-[#302d53]">Plans</h3><div className="mt-3 space-y-2"><a className="block text-[#77748a] hover:text-[#635be0]" href="#pricing">Pricing</a></div></div>
          </div>
        </div>
        <div className="mx-auto mt-9 max-w-7xl border-t border-[#efedf5] pt-5 text-xs text-[#9996a9]">© {new Date().getFullYear()} CortexAI. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default LandingPage;

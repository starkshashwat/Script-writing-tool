"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ThreeOrb = dynamic(() => import("../components/ThreeOrb"), { ssr: false });

function MaterialIcon({ name, fill, className = "" }: { name: string; fill?: boolean; className?: string }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={fill ? { fontVariationSettings: "'FILL' 1" } : {}}
    >
      {name}
    </span>
  );
}

function AccordionItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`glass-panel rounded-xl hover:shadow-lg transition-all duration-300 cursor-pointer group ${isOpen ? "accordion-item active" : "accordion-item"}`}>
      <div className="flex justify-between items-center p-6" onClick={() => setIsOpen(!isOpen)}>
        <h3 className="font-semibold md:text-lg text-[#2b1613] group-hover:text-[#bc0100] transition-colors pr-8">
          {question}
        </h3>
        <MaterialIcon name="keyboard_arrow_down" className="text-[#603e39] accordion-icon" />
      </div>
      <div className="accordion-content px-6 text-[#603e39] text-base border-t border-[#E5E5E5]/50">
        <p>{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const scrollRevealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll(".scroll-reveal");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-[#fff8f6] text-[#2b1613] antialiased overflow-x-hidden selection:bg-[#bc0100] selection:text-white">
      <div className="grid-pattern" />
      <div className="noise-bg" />

      {/* Top Bar */}
      <div className="flex justify-center items-center py-2 px-4 md:px-16 w-full bg-[#fff0ee] relative z-[60]">
        <MaterialIcon name="verified" fill className="mr-2 text-[#aa3000] text-base" />
        <span className="text-xs font-medium uppercase tracking-widest text-[#aa3000]">
          Built for creators, agencies and media brands
        </span>
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 w-full z-50 bg-[#fff8f6]/95 backdrop-blur-md border-b border-[#ebbbb4]/30 shadow-sm flex justify-between items-center px-5 md:px-16 py-4 max-w-[1280px] mx-auto">
        <div className="text-2xl font-bold text-[#bc0100] tracking-tighter font-display">
          TubeBoost
        </div>
        <div className="hidden md:flex gap-6 items-center">
          <a className="text-[#603e39] hover:text-[#bc0100] transition-colors text-sm font-semibold" href="#analyze">Analyze</a>
          <a className="text-[#603e39] hover:text-[#bc0100] transition-colors text-sm font-semibold" href="#strategy">Strategy</a>
          <a className="text-[#603e39] hover:text-[#bc0100] transition-colors text-sm font-semibold" href="#pricing">Pricing</a>
        </div>
        <Link href="/login">
          <button className="bg-gradient-to-r from-[#FF0000] to-[#FF6B00] text-white text-sm px-6 py-2 rounded-lg font-bold border border-white/10 hover:opacity-90 transition-opacity hidden md:block shadow-sm cursor-pointer">
            Start Free Trial
          </button>
        </Link>
      </nav>

      <main>
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden py-12 mt-8 scroll-reveal">
          <ThreeOrb />
          <div className="max-w-4xl mx-auto px-5 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-[#bc0100]/10 px-4 py-1.5 rounded-full mb-8 border border-[#bc0100]/20">
              <span className="w-2 h-2 rounded-full bg-[#bc0100] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#bc0100]">Intelligence Engine v4.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.1] font-display text-[#2b1613]">
              Create Better YouTube <br />
              <span className="text-[#bc0100] italic">Videos, Faster.</span>
            </h1>
            <p className="text-lg md:text-xl text-[#603e39] mb-12 max-w-2xl mx-auto leading-relaxed">
              The world&apos;s first AI-driven video synthesis platform that deconstructs viral logic to architect your next breakout hit.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login?mode=signup">
                <button className="w-full sm:w-auto bg-[#bc0100] text-white px-10 py-4 rounded-full font-extrabold text-lg hover:scale-105 transition-transform shadow-2xl shadow-[#bc0100]/30 cursor-pointer">
                  Get Started Free
                </button>
              </Link>
              <button className="w-full sm:w-auto glass-panel px-10 py-4 rounded-full font-bold text-lg hover:bg-[#ffe9e6] transition-all cursor-pointer">
                View Demo
              </button>
            </div>
          </div>
        </section>

        {/* Viral DNA Engine */}
        <section className="py-32 bg-[#fff0ee]/50 border-y border-[#ebbbb4]/30 scroll-reveal" id="analyze">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 font-display text-[#2b1613]">
                Most AI Generates Content. <br />
                <span className="text-[#bc0100]">We Generate Strategy.</span>
              </h2>
              <p className="text-[#603e39] max-w-2xl mx-auto text-lg">
                Our 5-step Viral DNA Engine reverses the success of your top competitors to build a custom roadmap for your channel.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
              <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#ebbbb4]/30 to-transparent -translate-y-1/2 hidden md:block" />
              {[
                { icon: "search", title: "Ingest", desc: "Paste any competitor URL to begin analysis." },
                { icon: "dna", title: "Deconstruct", desc: "Extract pacing, hooks, and retention loops." },
                { icon: "psychology", title: "Research", desc: "Auto-fetch deep data and stats for authority." },
                { icon: "architecture", title: "Blueprint", desc: "Synthesize into a high-retention structure." },
              ].map((step) => (
                <div key={step.title} className="relative z-10 glass-panel p-6 rounded-2xl text-center group hover:border-[#bc0100]/50 transition-all">
                  <div className="w-12 h-12 bg-[#fff8f6] rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4 border border-[#ebbbb4]/20 group-hover:scale-110 transition-transform">
                    <MaterialIcon name={step.icon} className="text-[#bc0100]" />
                  </div>
                  <h3 className="font-bold mb-2">{step.title}</h3>
                  <p className="text-xs text-[#603e39]">{step.desc}</p>
                </div>
              ))}
              {/* Step 5 highlighted */}
              <div className="relative z-10 bg-[#bc0100] p-6 rounded-2xl text-center shadow-xl shadow-[#bc0100]/20">
                <div className="w-12 h-12 bg-[#fff8f6] rounded-xl shadow-sm flex items-center justify-center mx-auto mb-4">
                  <MaterialIcon name="rocket_launch" fill className="text-[#bc0100]" />
                </div>
                <h3 className="font-bold mb-2 text-white">Execute</h3>
                <p className="text-xs text-white/80">Ready-to-write script with optimal pacing.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Analysis Engine */}
        <section className="py-32 overflow-hidden scroll-reveal">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <span className="text-[#bc0100] font-bold uppercase tracking-[0.2em] text-xs">Analysis Engine</span>
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight font-display text-[#2b1613]">
                  See What Makes A Video <br />
                  <span className="text-[#bc0100]">Impossible To Ignore.</span>
                </h2>
                <p className="text-lg text-[#603e39] leading-relaxed">
                  We don&apos;t just transcribe videos. We analyze the emotional cadence and retention physics that drive the YouTube algorithm.
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border-l-2 border-[#bc0100] bg-[#fff0ee]">
                    <div className="text-2xl font-extrabold">98%</div>
                    <div className="text-xs font-bold uppercase text-[#603e39]">Pacing Accuracy</div>
                  </div>
                  <div className="p-4 border-l-2 border-[#bc0100] bg-[#fff0ee]">
                    <div className="text-2xl font-extrabold">3.2s</div>
                    <div className="text-xs font-bold uppercase text-[#603e39]">Avg. Hook Gap</div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="glass-panel rounded-3xl p-8 shadow-2xl relative z-10 overflow-hidden bg-[#fff8f6]/90">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="font-bold">Emotional Retention Curve</h3>
                    <span className="text-xs font-bold text-[#bc0100] px-2 py-1 bg-[#bc0100]/10 rounded">Live Data</span>
                  </div>
                  <div className="h-64 flex items-end gap-1 relative">
                    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 400 200">
                      <defs>
                        <linearGradient id="gradient-area" x1="0" x2="0" y1="0" y2="1">
                          <stop offset="0%" stopColor="#FF0000" />
                          <stop offset="100%" stopColor="transparent" />
                        </linearGradient>
                      </defs>
                      <path d="M0,180 C50,160 100,50 150,80 C200,110 250,20 300,50 C350,80 400,60 400,100 L400,200 L0,200 Z" fill="url(#gradient-area)" opacity="0.1" />
                      <path d="M0,180 C50,160 100,50 150,80 C200,110 250,20 300,50 C350,80 400,60 400,100" fill="none" stroke="#FF0000" strokeWidth="3" />
                    </svg>
                    <div className="absolute top-[30%] left-[30%] group">
                      <div className="w-3 h-3 bg-[#bc0100] rounded-full pulse-ring absolute -inset-0" />
                    </div>
                  </div>
                  <div className="grid grid-cols-4 mt-6 text-[10px] font-bold text-[#603e39] uppercase tracking-widest text-center">
                    <span>Hook</span><span>The Turn</span><span>Escalation</span><span>Payoff</span>
                  </div>
                </div>
                <div className="absolute -top-10 -right-10 w-64 h-64 bg-[#bc0100]/5 rounded-full blur-3xl -z-10" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#bc0100]/10 rounded-full blur-2xl -z-10" />
              </div>
            </div>
          </div>
        </section>

        {/* Research Intelligence */}
        <section className="py-32 bg-[#fff0ee]/30 relative border-y border-[#ebbbb4]/10 scroll-reveal">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <div className="text-center mb-20">
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 font-display text-[#2b1613]">
                Before Writing, <br />
                <span className="text-[#bc0100]">The AI Becomes An Expert.</span>
              </h2>
              <p className="text-[#603e39] max-w-2xl mx-auto text-lg">
                Stop surface-level research. TubeBoost crawls 100+ sources in seconds to find the &quot;Hidden Nuggets&quot; your viewers haven&apos;t seen before.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Sources */}
              <div className="space-y-4">
                <div className="glass-panel p-6 rounded-2xl floating bg-[#fff8f6]/90">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center">
                      <MaterialIcon name="article" className="text-blue-600 text-sm" />
                    </div>
                    <span className="text-sm font-bold">Academic Journals</span>
                  </div>
                  <div className="h-2 bg-[#2b1613]/5 rounded w-full mb-2" />
                  <div className="h-2 bg-[#2b1613]/5 rounded w-2/3" />
                </div>
                <div className="glass-panel p-6 rounded-2xl floating bg-[#fff8f6]/90" style={{ animationDelay: "1.5s" }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded bg-red-100 flex items-center justify-center">
                      <MaterialIcon name="forum" className="text-red-600 text-sm" />
                    </div>
                    <span className="text-sm font-bold">Community Sentiment</span>
                  </div>
                  <div className="h-2 bg-[#2b1613]/5 rounded w-full mb-2" />
                  <div className="h-2 bg-[#2b1613]/5 rounded w-1/2" />
                </div>
              </div>
              {/* Central Hub */}
              <div className="flex flex-col items-center justify-center relative">
                <div className="w-32 h-32 rounded-full bg-[#bc0100] flex items-center justify-center shadow-2xl shadow-[#bc0100]/40 relative z-10 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/20 to-transparent" />
                  <MaterialIcon name="database" fill className="text-white text-5xl" />
                </div>
                <div className="absolute w-full h-full border border-dashed border-[#ebbbb4]/30 rounded-full animate-[spin_20s_linear_infinite] -z-10" />
              </div>
              {/* Output */}
              <div className="space-y-4">
                <div className="glass-panel p-6 rounded-2xl floating bg-[#fff8f6]/90" style={{ animationDelay: "0.7s" }}>
                  <div className="flex items-center gap-3 mb-4 text-[#bc0100]">
                    <MaterialIcon name="auto_awesome" className="text-sm" />
                    <span className="text-sm font-bold uppercase tracking-widest">Extracted Intelligence</span>
                  </div>
                  <ul className="space-y-3">
                    {["Historical data point #12-B", "Counter-intuitive statistic", "Audience core tension mapped"].map((item) => (
                      <li key={item} className="flex items-center gap-2 text-xs font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#bc0100]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Blueprint Generator */}
        <section className="py-32 max-w-[1280px] mx-auto px-5 md:px-16 scroll-reveal" id="strategy">
          <div className="text-center mb-20">
            <span className="inline-block py-1 px-3 bg-[#ffe9e6] rounded-full text-[#bc0100] font-bold text-[10px] uppercase tracking-widest mb-4 border border-[#bc0100]/20">
              Synthesis Engine
            </span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 font-display text-[#2b1613]">Where Strategy Becomes Structure.</h2>
            <p className="text-[#603e39] max-w-2xl mx-auto text-lg">Automatically architect your script&apos;s ideal progression by fusing structural DNA from viral competitors with deep topic research.</p>
          </div>
          {/* Blueprint Interface */}
          <div className="glass-panel rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden bg-[#fff8f6]/90">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#bc0100] to-transparent" />
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-[#ebbbb4]/30 pb-8">
              <div>
                <h3 className="text-3xl font-extrabold mb-2 font-display">Generated Structure</h3>
                <p className="text-[#603e39] font-medium">Optimized for maximum retention based on competitor analysis.</p>
              </div>
              <button className="flex items-center gap-2 px-6 py-3 bg-[#2b1613] text-[#fff8f6] rounded-xl text-sm font-bold hover:scale-105 transition-transform cursor-pointer">
                <MaterialIcon name="download" className="text-sm" /> Export to Script Editor
              </button>
            </div>
            <div className="space-y-6">
              {/* Hook Block */}
              <div className="bg-[#fff8f6] border border-[#ebbbb4]/40 rounded-2xl p-6 flex gap-6 items-start group hover:border-[#bc0100]/40 transition-all">
                <div className="w-14 h-14 rounded-xl bg-[#ffe9e6] flex items-center justify-center shrink-0 border border-[#ebbbb4]/20">
                  <span className="font-display text-xl font-extrabold text-[#bc0100]">00</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold uppercase tracking-wider text-sm">The Hook</h4>
                    <span className="px-3 py-1 bg-[#bc0100]/5 text-[10px] rounded-full text-[#bc0100] font-extrabold border border-[#bc0100]/10">0:00 - 0:15</span>
                  </div>
                  <p className="text-[#603e39] text-sm leading-relaxed">Establish the counter-narrative immediately. &quot;Everything you know about X is wrong.&quot; Present Statistic #3 to validate the claim and create an immediate curiosity gap.</p>
                </div>
              </div>
              {/* Setup Block */}
              <div className="bg-[#fff8f6] border border-[#ebbbb4]/40 rounded-2xl p-6 flex gap-6 items-start group hover:border-[#bc0100]/20 transition-all">
                <div className="w-14 h-14 rounded-xl bg-[#fff0ee] flex items-center justify-center shrink-0 border border-[#ebbbb4]/10">
                  <span className="font-display text-xl font-extrabold text-[#603e39]">01</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-bold uppercase tracking-wider text-sm">The Setup</h4>
                    <span className="px-3 py-1 bg-[#ffe9e6] text-[10px] rounded-full text-[#603e39] font-extrabold border border-[#ebbbb4]/10">0:15 - 1:30</span>
                  </div>
                  <p className="text-[#603e39] text-sm leading-relaxed">Introduce historical context. Explain how the common misconception started. Open Loop #1: &quot;But there was one crucial detail everyone missed.&quot;</p>
                </div>
              </div>
              {/* Skeleton Loader */}
              <div className="bg-[#fff0ee]/30 border border-[#ebbbb4]/10 rounded-2xl p-6 flex gap-6 items-start animate-pulse opacity-50">
                <div className="w-14 h-14 rounded-xl bg-[#ffe9e6] shrink-0" />
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-[#ffe9e6] rounded w-1/4" />
                  <div className="h-3 bg-[#ffe9e6] rounded w-full" />
                  <div className="h-3 bg-[#ffe9e6] rounded w-2/3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Script Writer Section */}
        <section className="py-32 relative overflow-hidden border-t border-[#ebbbb4]/10 scroll-reveal">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <div className="text-center mb-20">
              <span className="text-[#aa3000] font-bold uppercase tracking-widest text-xs mb-4 block">Script Writer Agent</span>
              <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.1] font-display text-[#2b1613]">
                From Blueprint To <br />
                <span className="text-[#bc0100] italic">Production-Ready Script</span>
              </h2>
              <p className="text-lg md:text-xl text-[#603e39] max-w-3xl mx-auto leading-relaxed">
                Using storytelling DNA, research intelligence, and blueprint structure, the AI generates a complete YouTube script optimized for retention and engagement.
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center">
              {/* Blueprint Checklist */}
              <div className="glass-panel rounded-3xl p-8 shadow-xl border-[#ebbbb4]/20 bg-[#fff8f6]/90">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-sm uppercase tracking-widest">Video Blueprint</h3>
                  <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    <MaterialIcon name="check_circle" className="text-[12px]" /> Complete
                  </span>
                </div>
                <div className="space-y-3">
                  {["00. Hook", "01. Section 1", "02. Section 2", "03. Section 3", "04. Reveal", "05. Conclusion"].map((item) => (
                    <div key={item} className="p-3 bg-[#ffe9e6] rounded-xl border border-[#ebbbb4]/10 flex items-center justify-between">
                      <span className="text-xs font-bold">{item}</span>
                      <MaterialIcon name="check" className="text-[#bc0100] text-sm" />
                    </div>
                  ))}
                </div>
              </div>
              {/* AI Agent */}
              <div className="flex flex-col items-center justify-center relative py-12">
                <div className="w-48 h-48 rounded-full bg-[#bc0100]/5 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-2 border-[#bc0100]/20 animate-[spin_10s_linear_infinite] border-dashed" />
                  <div className="w-32 h-32 rounded-full bg-[#bc0100] flex items-center justify-center shadow-2xl shadow-[#bc0100]/40">
                    <MaterialIcon name="smart_toy" fill className="text-white text-6xl" />
                  </div>
                </div>
                <div className="mt-8 text-center space-y-2">
                  <div className="flex items-center gap-2 justify-center">
                    <span className="w-2 h-2 rounded-full bg-[#bc0100] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#bc0100]">Generating Hook...</span>
                  </div>
                  <p className="text-[10px] text-[#603e39] font-medium">Building Narrative Structure</p>
                </div>
              </div>
              {/* Generated Script */}
              <div className="relative">
                <div className="bg-[#fff8f6] rounded-3xl p-8 shadow-2xl border border-[#ebbbb4]/20 min-h-[400px] relative overflow-hidden">
                  <div className="flex items-center gap-2 mb-6 border-b border-[#ebbbb4]/10 pb-4">
                    <MaterialIcon name="description" className="text-[#bc0100]" />
                    <span className="text-xs font-bold uppercase tracking-widest">Final Script.docx</span>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm font-bold text-[#bc0100]">[SCENE: INT. STUDIO - DAY]</p>
                    <p className="text-sm leading-relaxed text-[#2b1613] italic">Nobody expected this company to dominate the market...</p>
                    <p className="text-sm leading-relaxed text-[#2b1613]">For decades, the industry operated under a single assumption that everyone took for granted. But then, everything changed.</p>
                    <div className="h-2 bg-[#2b1613]/5 rounded w-full" />
                    <div className="h-2 bg-[#2b1613]/5 rounded w-5/6" />
                    <div className="h-2 bg-[#2b1613]/5 rounded w-4/6" />
                  </div>
                  {/* Floating Metrics */}
                  <div className="absolute -right-4 top-1/4 glass-panel p-3 rounded-xl shadow-lg border-[#bc0100]/20 animate-bounce bg-[#fff8f6]/90">
                    <div className="text-xs font-bold text-[#bc0100]">3,642 Words</div>
                  </div>
                  <div className="absolute -left-4 bottom-1/3 glass-panel p-3 rounded-xl shadow-lg border-[#bc0100]/20 bg-[#fff8f6]/90">
                    <div className="text-xs font-bold text-[#bc0100]">72% Retention Target</div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4 justify-center">
                  <span className="px-3 py-1 bg-[#ffe9e6] rounded-full text-[10px] font-bold border border-[#ebbbb4]/20">18 Story Transitions</span>
                  <span className="px-3 py-1 bg-[#bc0100] text-white rounded-full text-[10px] font-bold">Production Ready</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-16 text-center py-12 border-t border-[#ebbbb4]/20 pt-32 scroll-reveal">
          <span className="text-sm text-[#bc0100] tracking-widest uppercase mb-4 block text-xs font-semibold">Why this is different</span>
          <h2 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-8 leading-[1.1] font-display text-[#2b1613] max-w-4xl mx-auto">
            Anyone Can Generate Words. <br />
            <span className="text-[#bc0100] italic">Few Can Replicate Winning Structures.</span>
          </h2>
        </section>

        <section className="max-w-[1280px] mx-auto px-5 md:px-16 pb-12 relative scroll-reveal">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start relative">
            {/* VS Divider */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-[#fff8f6] border border-[#ebbbb4]/30 w-16 h-16 rounded-full items-center justify-center shadow-lg vs-glow">
              <span className="text-2xl font-black text-[#956d67]">VS</span>
            </div>
            {/* Generic AI */}
            <div className="glass-panel rounded-3xl p-8 flex flex-col gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-700 bg-[#fff8f6]/80 border border-[#ebbbb4]/20">
              <div className="flex items-center justify-between border-b border-[#ebbbb4]/20 pb-4">
                <h3 className="text-3xl font-extrabold text-[#603e39] font-display">Generic AI Tools</h3>
                <span className="bg-[#ffe2dd] text-[#603e39] px-3 py-1 rounded-full text-xs font-bold uppercase">Generic Output</span>
              </div>
              <div className="flex flex-col gap-4">
                <span className="text-xs text-[#956d67] uppercase tracking-widest font-bold">Workflow</span>
                <div className="flex flex-wrap items-center gap-2">
                  {["Prompt", "Generate Text", "Hope It Works"].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      {i > 0 && <span className="text-[#ebbbb4]">→</span>}
                      <div className="px-4 py-2 border border-[#ebbbb4]/30 rounded-lg text-[#603e39] text-sm font-semibold bg-[#fff0ee]">{step}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-4">
                <span className="text-xs text-[#956d67] uppercase tracking-widest font-bold">The Blindspots</span>
                <ul className="space-y-4">
                  {["No Viral Analysis", "No Story Blueprint", "No Retention Framework", "No Research Engine", "No Thumbnail Strategy"].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-[#603e39]">
                      <MaterialIcon name="close" className="text-[#ba1a1a]" /> <span className="text-base">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* TubeBoost */}
            <div className="glass-panel rounded-3xl p-8 flex flex-col gap-8 border-[#bc0100]/30 relative overflow-hidden group bg-[#fff8f6]/95 shadow-xl">
              <div className="absolute inset-0 bg-[#bc0100]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
              <div className="flex items-center justify-between border-b border-[#bc0100]/20 pb-4 z-10">
                <h3 className="text-3xl font-extrabold text-[#bc0100] font-display">Viral Video Structure AI</h3>
                <span className="bg-[#bc0100] text-white px-3 py-1 rounded-full text-xs font-bold uppercase animate-pulse">Production Ready</span>
              </div>
              <div className="flex flex-col gap-4 z-10">
                <span className="text-xs text-[#bc0100]/70 uppercase tracking-widest font-bold">Precision Workflow</span>
                <div className="flex flex-wrap items-center gap-y-4 gap-x-2">
                  {["Reference Video", "Viral DNA Analysis", "Research Intelligence", "Blueprint Generation", "Script Creation", "CTR Optimization"].map((step, i) => (
                    <div key={step} className="flex items-center gap-2">
                      {i > 0 && <span className="text-[#bc0100]/40">→</span>}
                      <div className="px-3 py-1.5 bg-[#bc0100]/10 border border-[#bc0100]/20 rounded text-[#bc0100] text-sm font-semibold">{step}</div>
                    </div>
                  ))}
                  <span className="text-[#bc0100]/40">→</span>
                  <div className="px-3 py-1.5 bg-[#bc0100] text-white rounded text-sm font-bold shadow-lg shadow-[#bc0100]/20">Ready To Publish</div>
                </div>
              </div>
              <div className="flex flex-col gap-4 mt-4 z-10">
                <span className="text-xs text-[#bc0100]/70 uppercase tracking-widest font-bold">The Competitive Edge</span>
                <ul className="grid grid-cols-1 gap-4">
                  {[
                    { icon: "dns", label: "Storytelling DNA Extraction" },
                    { icon: "analytics", label: "Retention Pattern Analysis" },
                    { icon: "psychology", label: "Research-Based Writing" },
                    { icon: "architecture", label: "Blueprint-Driven Scripts" },
                    { icon: "ads_click", label: "Title & Thumbnail Intelligence" },
                  ].map((item) => (
                    <li key={item.label} className="flex items-center gap-3 text-[#2b1613]">
                      <MaterialIcon name={item.icon} fill className="text-[#bc0100] bg-[#bc0100]/10 p-1 rounded" />
                      <span className="text-base font-semibold">{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Trust Strip */}
        <section className="max-w-[1280px] mx-auto px-5 md:px-16 py-12 border-t border-[#ebbbb4]/30 scroll-reveal">
          <div className="flex flex-wrap justify-between items-center gap-8 text-[#603e39]/80 text-sm font-bold">
            {["Analyze Any Viral Video", "Extract Storytelling DNA", "Generate Original Scripts", "Maintain Proven Structure"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <MaterialIcon name="check_circle" fill className="text-[#bc0100] scale-75" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Who It's For */}
        <section className="py-12 border-t border-[#ebbbb4]/20 scroll-reveal">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16 text-center mb-12 max-w-3xl">
            <span className="text-xs font-medium uppercase tracking-widest text-[#603e39] mb-4 block">WHO IT&apos;S FOR</span>
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-[#2b1613] mb-6 font-display leading-tight">Built For Teams That Can&apos;t Afford To Guess</h2>
            <p className="text-lg text-[#603e39]">Whether you&apos;re running a faceless channel, a documentary brand, an agency, or a media company, the platform helps you move from idea to publish-ready content faster.</p>
          </div>
          <div className="max-w-[1280px] mx-auto px-5 md:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {[
              { icon: "visibility_off", title: "Faceless YouTube Channels", desc: "Scale content production without spending days researching every video.", outcome: "More uploads. Better scripts. Consistent quality." },
              { icon: "movie", title: "Documentary Creators", desc: "Analyze successful documentaries and replicate their storytelling structure.", outcome: "Stronger retention. Better narratives." },
              { icon: "groups", title: "YouTube Agencies", desc: "Handle more channels without expanding your writing team.", outcome: "More clients. Higher margins." },
              { icon: "domain", title: "Media Companies", desc: "Build repeatable content systems instead of relying on individual writers.", outcome: "Scalable production. Consistent output." },
              { icon: "psychology", title: "YouTube Consultants", desc: "Create better recommendations backed by storytelling and research intelligence.", outcome: "Higher client success." },
              { icon: "bolt", title: "Content Teams", desc: "Reduce research bottlenecks and accelerate script creation across the organization.", outcome: "Faster production cycles." },
            ].map((card) => (
              <div key={card.title} className="glass-panel rounded-xl p-6 hover:shadow-lg hover:scale-[1.01] hover:border-[#D1D1D1] transition-all duration-300 flex flex-col h-full group">
                <div className="mb-4 text-[#bc0100] bg-[#ffe9e6] w-12 h-12 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <MaterialIcon name={card.icon} className="text-[24px]" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-[#2b1613]">{card.title}</h3>
                <p className="text-sm text-[#603e39] mb-4 flex-grow">{card.desc}</p>
                <div className="pt-4 border-t border-[#E5E5E5] mt-auto">
                  <p className="text-xs font-medium text-[#aa3000] uppercase tracking-widest mb-1">Outcome</p>
                  <p className="text-sm font-medium text-[#2b1613]">{card.outcome}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pricing */}
        <section className="py-12 border-t border-[#ebbbb4]/20 scroll-reveal" id="pricing">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16 text-center mb-12">
            <p className="text-xs font-medium uppercase tracking-widest text-[#603e39] mb-4">Pricing</p>
            <h2 className="text-5xl md:text-7xl font-extrabold text-[#2b1613] mb-4 tracking-tighter leading-[1.1] font-display">
              Pay Per Project.<br /><span className="text-[#bc0100]">Not Per Prompt.</span>
            </h2>
            <p className="text-lg text-[#603e39] max-w-2xl mx-auto mt-6">
              Every project includes viral DNA analysis, research intelligence, blueprint generation, script creation, title ideas, and thumbnail concepts.
            </p>
          </div>
          {/* Workflow Pills */}
          <div className="max-w-[1280px] mx-auto px-5 md:px-16 mb-12 overflow-x-auto pb-4">
            <div className="flex items-center justify-start md:justify-center min-w-max gap-2 px-4">
              {[
                { icon: "play_circle", label: "Reference Video Analysis" },
                { icon: "psychology", label: "Research Intelligence" },
                { icon: "architecture", label: "Blueprint Creation" },
                { icon: "description", label: "Script Generation" },
              ].map((pill, i) => (
                <div key={pill.label} className="flex items-center gap-2">
                  {i > 0 && <span className="text-[#ebbbb4]">→</span>}
                  <div className="glass-panel px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2">
                    <MaterialIcon name={pill.icon} className="text-[16px] text-[#bc0100]" /> {pill.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Pricing Cards */}
          <div className="max-w-[1280px] mx-auto px-5 md:px-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
              { name: "FREE", price: "0", desc: "For getting started", features: ["1 Project", "DNA Report & Blueprint", "Limited Script Gen", "Community Support"], cta: "Try Free", highlighted: false },
              { name: "CREATOR", price: "1,999", desc: "For consistent output", features: ["18 Projects", "Full DNA & Intelligence", "Full Script Generation", "20 Titles & 5 Thumbs"], cta: "Start Creating", highlighted: true },
              { name: "PRO", price: "3,999", desc: "For serious volume", features: ["44 Projects", "Everything in Creator", "Priority Processing", "Advanced Exports"], cta: "Go Pro", highlighted: false },
              { name: "AGENCY", price: "9,999", desc: "For scale & teams", features: ["140 Projects", "Team Access & Agency workflows", "Priority Queue", "Future API Access"], cta: "Scale Faster", highlighted: false },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`glass-panel rounded-xl p-8 flex flex-col hover:shadow-lg transition-all duration-300 relative ${
                  plan.highlighted ? "border-[#bc0100] shadow-[0_0_40px_-10px_rgba(255,0,0,0.15)] transform md:-translate-y-2" : ""
                }`}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#ffe9e6] px-3 py-1 rounded-full text-xs text-[#bc0100] flex items-center gap-1 border border-[#bc0100]/20 font-bold">
                    <MaterialIcon name="star" fill className="text-[14px]" /> Most Popular
                  </div>
                )}
                <div className={`mb-8 ${plan.highlighted ? "mt-2" : ""}`}>
                  <h3 className="text-2xl font-bold mb-2 font-display">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-4">
                    <span className="text-sm text-[#603e39]">₹</span>
                    <span className="text-4xl font-bold tracking-tighter">{plan.price}</span>
                    {plan.price !== "0" && <span className="text-sm text-[#603e39]">/mo</span>}
                  </div>
                  <p className="text-xs font-medium uppercase tracking-widest text-[#603e39]">{plan.desc}</p>
                </div>
                <ul className="flex-grow space-y-4 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 border-b border-[#ebbbb4]/20 pb-3">
                      <MaterialIcon name="check_circle" fill className="text-[#bc0100] text-[20px]" />
                      <span className="text-sm text-[#603e39]">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/login?mode=signup">
                  <button className={`w-full py-3 rounded text-sm font-semibold mt-auto cursor-pointer transition-all ${
                    plan.highlighted
                      ? "bg-gradient-to-r from-[#FF0000] to-[#FF6B00] text-white hover:opacity-90"
                      : "bg-white border border-[#E5E5E5] text-[#2b1613] hover:border-[#1A1A1A]"
                  }`}>
                    {plan.cta}
                  </button>
                </Link>
              </div>
            ))}
          </div>
          {/* Add-on Credits */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h4 className="text-xs font-medium uppercase tracking-widest text-[#603e39] mb-6">Need more capacity? Add-on Credits:</h4>
            <div className="flex flex-wrap justify-center gap-4">
              {[{ qty: "5", price: "₹499" }, { qty: "10", price: "₹899" }, { qty: "25", price: "₹1,999" }].map((addon) => (
                <div key={addon.qty} className="px-6 py-3 glass-panel rounded-full text-sm font-semibold text-[#2b1613]">
                  {addon.qty} Projects <span className="text-[#603e39] ml-2 font-normal">— {addon.price}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-12 border-t border-[#ebbbb4]/20 scroll-reveal">
          <div className="text-center mb-24">
            <span className="inline-block px-4 py-1 bg-[#F5F5F5] text-[#2b1613] text-xs font-medium uppercase tracking-widest rounded-full mb-6 border border-[#E5E5E5]">
              FAQ
            </span>
            <h2 className="text-5xl md:text-7xl font-extrabold text-[#2b1613] mb-6 tracking-tighter font-display">
              Everything You Need To Know
            </h2>
            <p className="text-lg text-[#603e39] max-w-2xl mx-auto">
              Built for creators, agencies, and content teams. Here are the answers to the most common questions.
            </p>
          </div>
          <div className="max-w-3xl mx-auto space-y-4 px-5 md:px-0">
            <AccordionItem question="Does the platform copy YouTube videos?" answer="No. The platform analyzes storytelling structure, retention mechanics, pacing, and viewer psychology. It generates original scripts using the same framework, not the same words or content." />
            <AccordionItem question="What exactly is a Viral DNA Report?" answer="The Viral DNA Report breaks down storytelling mechanics including hook strategy, story structure, open loops, retention patterns, emotional curve, CTA placement, and viewer psychology." />
            <AccordionItem question="What research sources can I upload?" answer="PDFs, DOCX files, articles, reports, statistics, notes, and supporting documents." />
            <AccordionItem question="Can I generate scripts for faceless channels?" answer="Yes. The platform is optimized for documentary, business, history, educational, finance, technology, and faceless channels." />
            <AccordionItem question="Which AI models power the platform?" answer="Specialized AI models are used for video analysis, research intelligence, blueprint generation, and script creation." />
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-12 flex flex-col items-center justify-center relative overflow-hidden border-t border-[#ebbbb4]/20 scroll-reveal">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16 w-full flex flex-col items-center text-center z-10 relative">
            <div className="mb-12 space-y-6 w-full max-w-4xl mx-auto">
              <h2 className="text-5xl md:text-7xl font-extrabold text-[#2b1613] leading-[1.1] tracking-tighter font-display">
                Your Next Viral Video Already Exists.
              </h2>
              <h3 className="text-3xl md:text-5xl font-bold text-[#603e39] leading-[1.2]">
                The AI Just Helps You Find It.
              </h3>
              <p className="text-lg text-[#603e39] mt-6 mx-auto max-w-3xl">
                Analyze any viral YouTube video. Extract its storytelling DNA. Build a research-backed blueprint. Generate production-ready scripts. All from a single workflow.
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl mx-auto mb-12">
              {[
                { value: "10M+", label: "Words Analyzed" },
                { value: "100K+", label: "Story Structures Extracted" },
                { value: "50K+", label: "Research Sources Processed" },
              ].map((stat) => (
                <div key={stat.label} className="flex flex-col items-center p-6 bg-white/80 backdrop-blur-md border border-[#ebbbb4]/30 rounded-xl shadow-sm">
                  <span className="text-2xl font-black text-[#bc0100]">{stat.value}</span>
                  <span className="text-xs font-medium text-[#603e39] uppercase tracking-wider">{stat.label}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="w-full max-w-3xl mx-auto flex flex-col items-center space-y-6">
              <h3 className="text-2xl font-bold text-[#2b1613] text-center leading-tight">
                The Future Of YouTube Content Won&apos;t Be Created By Guesswork. <br />
                <span className="text-[#bc0100]">It Will Be Built On Intelligence.</span>
              </h3>
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-center mt-6 w-full">
                <Link href="/login?mode=signup">
                  <button className="bg-gradient-to-r from-[#FF0000] to-[#FF6B00] text-white text-sm px-8 py-4 rounded-full hover:opacity-90 transition-opacity w-full sm:w-auto flex items-center justify-center gap-2 shadow-lg cursor-pointer font-bold">
                    Start Your First Project Free
                    <MaterialIcon name="arrow_forward" className="text-sm" />
                  </button>
                </Link>
                <button className="bg-white border border-[#ebbbb4] text-[#2b1613] text-sm px-8 py-4 rounded-full hover:bg-[#fff0ee] transition-colors w-full sm:w-auto flex items-center justify-center gap-2 cursor-pointer font-bold">
                  <MaterialIcon name="play_circle" className="text-sm" />
                  Watch Product Demo
                </button>
              </div>
              {/* Trust badges */}
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 mt-12 pt-6 border-t border-[#ebbbb4]/30 w-full">
                {["No Credit Card Required", "1 Free Project Included", "Setup In Minutes", "Export Ready Output"].map((badge) => (
                  <div key={badge} className="flex items-center gap-2 text-[#603e39]">
                    <MaterialIcon name="check_circle" className="text-[#bc0100] text-sm" />
                    <span className="text-xs font-medium">{badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Roadmap Section */}
        <section className="py-12 border-t border-[#ebbbb4]/20 scroll-reveal bg-[#fff0ee]/50">
          <div className="max-w-[1280px] mx-auto px-5 md:px-16">
            <div className="max-w-3xl mb-12 text-center mx-auto">
              <h2 className="text-5xl md:text-7xl font-extrabold text-[#2b1613] mb-6 tracking-tighter font-display">Building The Future Of YouTube Intelligence</h2>
              <p className="text-lg text-[#603e39]">We&apos;re starting with Viral DNA Analysis and Script Generation. Here&apos;s what comes next.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#bc0100] shrink-0" />
                  <h3 className="text-xl font-bold text-[#2b1613]">Available Today</h3>
                </div>
                <div className="flex-grow pt-4 border-t border-[#E5E5E5]">
                  <ul className="space-y-4">
                    {["Viral DNA Engine (Analysis)", "Research Intelligence Hub", "Script Writer Agent (v1.0)", "Blueprint Generator", "CTR Optimizer (Beta)"].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <MaterialIcon name="check_circle" fill className="text-[#bc0100] mt-1 text-sm" />
                        <span className="text-sm text-[#2b1613]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full bg-[#d43f00] shrink-0 relative pulse-ring" />
                  <h3 className="text-xl font-bold text-[#2b1613]">Coming Soon</h3>
                </div>
                <div className="flex-grow pt-4 border-t border-[#E5E5E5]">
                  <ul className="space-y-4">
                    {["Multilingual Script Adaptation", "Voiceover Persona Synthesis", "Real-time Competitor Intelligence", "Automated B-Roll Mapping", "Thumbnail A/B Prediction"].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <MaterialIcon name="schedule" className="text-[#603e39] mt-1 text-sm" />
                        <span className="text-sm text-[#2b1613]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="glass-panel rounded-xl p-6 flex flex-col relative overflow-hidden opacity-80 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-3 h-3 rounded-full border-2 border-[#603e39] shrink-0 bg-transparent" />
                  <h3 className="text-xl font-bold text-[#2b1613]">Future Vision</h3>
                </div>
                <div className="flex-grow pt-4 border-t border-[#E5E5E5]">
                  <ul className="space-y-4">
                    {["Generative Video Production", "Audience Psychology Simulation", "Predictive Viral Forecasting", "Autonomous Channel Management", "Creator Economy Intelligence API"].map((item) => (
                      <li key={item} className="flex items-start gap-3">
                        <MaterialIcon name="visibility" className="text-[#956d67] mt-1 text-sm" />
                        <span className="text-sm text-[#603e39]">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#fff8f6] w-full py-12 border-t border-[#ebbbb4]/20">
        <div className="flex flex-col md:flex-row justify-between items-center px-5 md:px-16 py-12 max-w-[1280px] mx-auto">
          <div className="text-2xl font-bold text-[#2b1613] mb-4 md:mb-0 font-display">TubeBoost</div>
          <div className="flex flex-wrap gap-6 justify-center">
            {["Terms", "Privacy", "Contact", "Twitter", "YouTube"].map((link) => (
              <a key={link} className="text-sm text-[#603e39] hover:text-[#bc0100] transition-colors" href="#">{link}</a>
            ))}
          </div>
          <div className="text-sm text-[#bc0100] mt-4 md:mt-0">© {new Date().getFullYear()} TubeBoost. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}

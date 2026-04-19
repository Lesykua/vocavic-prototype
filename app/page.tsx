function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-amber-100 text-amber-700 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-5">
      {children}
    </span>
  );
}

export default function Home() {
  return (
    <div className="w-full min-h-screen bg-white text-[#0F1A2E]">

      {/* ─── NAV ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 w-full bg-white/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">
          <span className="text-[#0F1A2E] text-lg font-bold tracking-tight">
            ShiftVoice
          </span>
          <nav className="hidden md:flex items-center gap-8 text-sm text-stone-500 font-medium">
            <a href="#how-it-works" className="hover:text-[#0F1A2E] transition-colors">How It Works</a>
            <a href="#where-it-shows-up" className="hover:text-[#0F1A2E] transition-colors">Where It Shows Up</a>
            <a href="#pilot" className="hover:text-[#0F1A2E] transition-colors">Pilot</a>
          </nav>
          <a
            href="https://tidycal.com/lesykua/shift-voice-meeting"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-amber-500 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-amber-600 transition-colors shadow-sm"
          >
            Book a Discovery Call
          </a>
        </div>
      </header>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#0B1929] text-white relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        {/* Glow */}
        <div className="absolute top-0 left-1/3 w-[600px] h-[400px] bg-amber-500/10 rounded-full blur-3xl -translate-y-1/2" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 pt-28 pb-24">
          <div className="max-w-3xl">
            <span className="inline-block border border-amber-500/40 text-amber-400 text-xs font-semibold uppercase tracking-widest px-3 py-1 rounded-full mb-8">
              Structured Operational Memory
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight text-white">
              Your plant runs on memory that disappears every 8 hours.
            </h1>
            <p className="mt-7 text-lg md:text-xl text-blue-200/80 leading-relaxed max-w-2xl">
              ShiftVoice gives it structured operational memory — built into the shift, not bolted on after.
            </p>
            <p className="mt-4 text-base text-slate-400 max-w-2xl leading-relaxed">
              What operators notice, try, and know gets captured, structured, and made available at every step — handover, investigation, and review. No forms. No IT project. No rip and replace.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="https://tidycal.com/lesykua/shift-voice-meeting"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-amber-500 text-white font-semibold px-8 py-4 rounded-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 text-sm"
              >
                Book a Discovery Call
              </a>
              <a
                href="#how-it-works"
                className="border border-white/20 text-white font-semibold px-8 py-4 rounded-lg hover:bg-white/10 transition-colors text-sm"
              >
                See How It Works ↓
              </a>
            </div>
          </div>

          {/* Proof strip */}
          <div className="mt-20 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { stat: "73%", label: "reduction in handover time", sub: "15 min → 4 min" },
              { stat: "50%", label: "fewer clarification loops", sub: "Every event has an owner" },
              { stat: "Hours→Min", label: "time-to-first-suspect", sub: "Context already assembled" },
            ].map((s) => (
              <div key={s.stat} className="flex flex-col gap-1">
                <p className="text-3xl font-extrabold text-amber-400">{s.stat}</p>
                <p className="text-sm font-semibold text-white/80">{s.label}</p>
                <p className="text-xs text-slate-500">{s.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── LIVE DEMO ────────────────────────────────────────────────────── */}
      <section className="w-full bg-white py-20 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          {/* Label + copy */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <Badge>Live Demo</Badge>
              <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] leading-tight">
                See what the shift looks like inside ShiftVoice
              </h2>
              <p className="mt-3 text-stone-500 text-base max-w-xl leading-relaxed">
                Real sample data. Click any event card to see the full operator note alongside machine state at the moment of capture.
              </p>
            </div>
            <a
              href="https://tidycal.com/lesykua/shift-voice-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-amber-500 text-white font-semibold px-6 py-3 rounded-lg hover:bg-amber-600 transition-colors text-sm shadow-sm"
            >
              Book a Discovery Call
            </a>
          </div>

          {/* Browser-chrome frame */}
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-2xl shadow-stone-300/40">
            {/* Fake browser chrome bar */}
            <div className="bg-stone-100 border-b border-stone-200 px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-400" />
                <span className="w-3 h-3 rounded-full bg-amber-400" />
                <span className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white border border-stone-200 rounded-md px-3 py-1 text-xs text-stone-400 font-mono">
                shift&#8209;voice.com
              </div>
              <span className="text-xs text-stone-400 font-medium hidden sm:block">Interactive demo — sample data</span>
            </div>

            {/* The dashboard iframe */}
            <iframe
              src="/dashboard.html"
              title="ShiftVoice — live operator notes demo"
              className="w-full border-0"
              style={{ height: "780px" }}
              loading="lazy"
            />
          </div>

          <p className="mt-4 text-xs text-stone-400 text-center">
            Filters, search, and card drill-down are all live. Data shown is representative sample data from a pilot deployment.
          </p>
        </div>
      </section>

      {/* ─── THE GAP ──────────────────────────────────────────────────────── */}
      <section className="w-full bg-stone-50 py-24 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Badge>The Gap</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] mb-4 leading-tight max-w-2xl">
            Every plant has data.<br />Almost none have operational memory.
          </h2>
          <p className="text-stone-500 text-base mb-12 max-w-xl">
            Three columns of information exist in every plant. Only two get captured.
          </p>

          <div className="overflow-x-auto rounded-xl border border-stone-200 bg-white shadow-sm">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-stone-200">
                  {[
                    { label: "Your machines record", color: "text-stone-500" },
                    { label: "Your systems store", color: "text-stone-500" },
                    { label: "Nobody captures", color: "text-amber-600 font-bold" },
                  ].map((h) => (
                    <th key={h.label} className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide ${h.color} bg-stone-50`}>
                      {h.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ["Signals and alarms", "Production orders and reports", "What the operator noticed at 2am"],
                  ["Fault codes", "Maintenance tickets", "What they tried, and why"],
                  ["Cycle times", "Shift schedules", "Whether it happened last Tuesday too"],
                ].map((row, i) => (
                  <tr key={i} className={i < 2 ? "border-b border-stone-100" : ""}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-6 py-4 align-top leading-snug ${
                          j === 2
                            ? "text-[#0F1A2E] font-semibold bg-amber-50"
                            : "text-stone-500"
                        }`}
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-8 text-stone-600 text-base max-w-2xl leading-relaxed border-l-4 border-amber-400 pl-5 italic">
            That missing layer is where investigations stall, handovers fail, and the same problems come back.
          </p>
        </div>
      </section>

      {/* ─── WHERE IT SHOWS UP ────────────────────────────────────────────── */}
      <section id="where-it-shows-up" className="w-full bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Badge>Where Operational Memory Gets Used</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] mb-14 leading-tight">
            The same record. Used at every step.
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Shift Handover",
                body: "The incoming team opens a structured event log, not a whiteboard. They know what happened, who handled it, and what's still open — before the outgoing team says a word.",
                color: "border-t-blue-500",
              },
              {
                num: "02",
                title: "Root Cause Analysis",
                body: "The engineer doesn't start from scratch. They search past events, replay what the operator observed alongside what the machine recorded, and arrive at a hypothesis in minutes — not hours.",
                color: "border-t-amber-500",
              },
              {
                num: "03",
                title: "Tier Meetings & Pulse Reviews",
                body: "The Operations Manager doesn't hear what people remember. They see structured data: recurring issues by frequency, open events by line, pattern trends over weeks. Decisions get made on evidence.",
                color: "border-t-emerald-500",
              },
            ].map((card) => (
              <div
                key={card.num}
                className={`bg-white rounded-xl border border-stone-200 border-t-4 ${card.color} p-8 shadow-sm hover:shadow-md transition-shadow`}
              >
                <span className="text-3xl font-black text-stone-200">{card.num}</span>
                <h3 className="text-[#0F1A2E] text-lg font-bold mt-4 mb-3">{card.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="w-full bg-stone-50 py-24 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Badge>How It Works</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] mb-14 leading-tight">
            Capture once. Available everywhere.
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: "1", label: "Speak", suffix: undefined, body: "Operator records a short voice note at any point during or at end of shift. No forms. No typing." },
              { step: "2", label: "Structure", suffix: undefined, body: "ShiftVoice extracts event type, affected component, root reason, and action taken automatically." },
              { step: "3", label: "Enrich", suffix: " (if available)", body: "For plants with process data systems, surrounding machine signals and alarms are pulled and attached to the event at the moment of capture." },
              { step: "4", label: "Memory", suffix: undefined, body: "The event enters a searchable, replayable record — available for the next shift, the investigating engineer, and the manager's Tier meeting." },
            ].map((s, i) => (
              <div key={s.step} className="relative bg-white rounded-xl border border-stone-200 p-7 shadow-sm">
                <div className="flex items-center gap-3 mb-5">
                  <span className="w-9 h-9 rounded-full bg-[#0F1A2E] text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                    {s.step}
                  </span>
                  {i < 3 && (
                    <div className="hidden lg:block flex-1 h-px bg-stone-200 absolute top-[44px] left-[calc(100%+0px)] w-6" />
                  )}
                </div>
                <h3 className="text-[#0F1A2E] font-bold mb-1">
                  {s.label}
                  {s.suffix && <span className="text-stone-400 font-normal text-sm">{s.suffix}</span>}
                </h3>
                <p className="text-stone-500 text-sm leading-relaxed mt-2">{s.body}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-[#0F1A2E] rounded-xl p-8 text-white">
            <p className="text-base leading-relaxed max-w-2xl">
              <span className="text-amber-400 font-bold">Replay is what makes investigation fast. </span>
              Scrub back through any event and see exactly what was happening — operator observation and machine state, synchronized.{" "}
              <span className="text-slate-500">(placeholder for screenshot or demo clip)</span>
            </p>
          </div>
        </div>
      </section>

      {/* ─── VIDEO ────────────────────────────────────────────────────────── */}
      <section className="w-full bg-white py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <Badge>See It In Action</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] mb-10 leading-tight">
            From voice note to replayable event — in under 60 seconds
          </h2>
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden border border-stone-200 shadow-xl shadow-stone-200">
            <iframe
              src="https://www.youtube.com/embed/JRMZDnN8Zto?rel=0&modestbranding=1"
              title="ShiftVoice — from voice note to replayable event"
              allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          <p className="mt-4 text-sm text-stone-400 text-center">Real capture. Real structure. Real replay.</p>
        </div>
      </section>

      {/* ─── CAPABILITIES ─────────────────────────────────────────────────── */}
      <section className="w-full bg-stone-50 py-24 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Badge>Core Capabilities</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] mb-14 leading-tight">
            Built for operational reality, not ideal conditions
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: "🎙", title: "Voice Capture", body: "Short note, any time during the shift. Structured automatically. No discipline required, no new habit to build." },
              { icon: "🏷", title: "Event Structure", body: "Every note becomes a tagged record: type, component, reason, action, owner." },
              { icon: "⏮", title: "Replay", body: "Any event, scrubbed back in time. Operator observation synchronized with machine state." },
              { icon: "📋", title: "Shift Summary", body: "Auto-generated handover report. Open actions, event log, status roll-up. Incoming shift arrives informed." },
              { icon: "🔍", title: "Search & Pattern Detection", body: "Query past events by component, type, or frequency. Recurring issues surface before they become crises." },
            ].map((cap) => (
              <div key={cap.title} className="bg-white rounded-xl border border-stone-200 p-7 shadow-sm hover:shadow-md transition-shadow">
                <span className="text-2xl mb-4 block">{cap.icon}</span>
                <h3 className="text-[#0F1A2E] font-bold mb-2">{cap.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{cap.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── OUTCOMES ─────────────────────────────────────────────────────── */}
      <section className="w-full bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Badge>Proven Outcomes</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] mb-3 leading-tight">
            What operational memory looks like in practice
          </h2>
          <p className="text-stone-400 text-sm mb-14 max-w-xl">
            Results from a 9-week pilot at a mid-sized manufacturing plant in Sweden. Measured, not projected.
          </p>

          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { stat: "73%", label: "reduction in handover time", sub: "15 min → 4 min", change: "Structured records replace verbal recaps" },
              { stat: "50%", label: "fewer clarification loops", sub: null, change: "Every event has an owner, a log, and evidence" },
              { stat: "Hours →\nMinutes", label: "time-to-first-suspect", sub: null, change: "Investigations start with context already assembled" },
              { stat: "Auto", label: "recurring issues surface", sub: null, change: "Frequency and context replace anecdote" },
            ].map((item) => (
              <div key={item.label} className="bg-white rounded-xl border border-stone-200 p-8 shadow-sm flex gap-6 items-start">
                <div className="flex-shrink-0">
                  <p className="text-4xl font-black text-amber-500 leading-none whitespace-pre-line">{item.stat}</p>
                  {item.sub && <p className="text-xs text-stone-400 mt-1">{item.sub}</p>}
                </div>
                <div className="border-l border-stone-200 pl-6">
                  <p className="text-[#0F1A2E] font-semibold text-sm leading-snug mb-1">{item.label}</p>
                  <p className="text-stone-400 text-sm">{item.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FITS YOUR STACK ──────────────────────────────────────────────── */}
      <section className="w-full bg-[#0F1A2E] py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Badge>Deployment</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-14 leading-tight">
            Works with what you have.<br />Adds what you&apos;re missing.
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/8 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center mb-5 text-lg">⚙️</div>
              <h3 className="text-white font-bold text-lg mb-3">No process data system?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                ShiftVoice works standalone. Voice capture → structured event → searchable memory. Full value, no data infrastructure required.
              </p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-8 hover:bg-white/8 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-slate-700 flex items-center justify-center mb-5 text-lg">🔌</div>
              <h3 className="text-white font-bold text-lg mb-3">Have PI, Ignition, OPC UA, or similar?</h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                ShiftVoice connects and wraps each event with surrounding machine signals at the moment of capture. Enrichment happens automatically.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-10">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-5">Deployment Options</p>
            <div className="flex flex-wrap gap-3 mb-8">
              {["Edge-only (default for regulated environments)", "Hybrid edge + cloud", "On-premises for full data sovereignty"].map((opt) => (
                <span key={opt} className="text-sm text-slate-300 border border-white/10 rounded-lg px-4 py-2 bg-white/5">
                  {opt}
                </span>
              ))}
            </div>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              ShiftVoice does not write to your existing systems. It reads, and it sits alongside.{" "}
              <span className="text-amber-400 font-semibold">Single-station integration: under one week.</span>
            </p>
          </div>
        </div>
      </section>

      {/* ─── WHO IT'S FOR ─────────────────────────────────────────────────── */}
      <section className="w-full bg-stone-50 py-24 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Badge>Who It&apos;s For</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] mb-14 leading-tight max-w-2xl">
            Built for plants where knowledge is concentrated in people, not systems
          </h2>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-6">Qualifying Conditions</p>
              <ul className="space-y-4">
                {[
                  "Handover quality depends on who happens to be working that shift",
                  "Engineers re-investigate issues that were already diagnosed last month",
                  "Managers make decisions in Tier meetings based on what people remember",
                  "Key people leave and take operational knowledge with them",
                  "You have production data — but no record of what humans actually observed",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="mt-1 w-5 h-5 rounded-full bg-amber-100 text-amber-600 text-xs flex items-center justify-center flex-shrink-0 font-bold">✓</span>
                    <span className="text-stone-600 text-sm leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-6">Decision-Makers</p>
              <div className="grid grid-cols-2 gap-3">
                {["Operations Manager", "Maintenance Lead", "Shift Leader", "Digital Transformation Lead"].map((role) => (
                  <div key={role} className="bg-white border border-stone-200 rounded-lg px-5 py-4 shadow-sm">
                    <span className="text-[#0F1A2E] text-sm font-semibold">{role}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── PILOT ────────────────────────────────────────────────────────── */}
      <section id="pilot" className="w-full bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Badge>Pilot Program</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] mb-3 leading-tight">
            One station. One shift team. 9 weeks to proof.
          </h2>
          <p className="text-stone-500 text-base max-w-2xl mb-14 leading-relaxed">
            We don&apos;t ask for a platform decision. We ask for one station and nine weeks to prove that operational memory works — with your vocabulary, your operations, your team.
          </p>

          <div className="grid md:grid-cols-4 gap-4 mb-14">
            {[
              { phase: "Mapping + Baseline", weeks: "Week 1", what: "Document current handover process, capture baseline metrics, identify target events and vocabulary", color: "border-t-blue-400" },
              { phase: "Deploy + Connect", weeks: "Weeks 2–4", what: "Install, connect data systems if applicable, calibrate event taxonomy to your plant", color: "border-t-amber-400" },
              { phase: "Run + Tune + Measure", weeks: "Weeks 5–7", what: "Live capture. Iterate. Track adoption and handover metrics", color: "border-t-emerald-400" },
              { phase: "Proof + Plan", weeks: "Weeks 8–9", what: "Results against agreed criteria. Expansion roadmap with ROI estimate", color: "border-t-purple-400" },
            ].map((row) => (
              <div key={row.phase} className={`bg-white border border-stone-200 border-t-4 ${row.color} rounded-xl p-6 shadow-sm`}>
                <p className="text-xs font-bold text-stone-400 mb-1">{row.weeks}</p>
                <h3 className="text-[#0F1A2E] font-bold text-sm mb-3">{row.phase}</h3>
                <p className="text-stone-500 text-xs leading-relaxed">{row.what}</p>
              </div>
            ))}
          </div>

          <p className="text-xs uppercase tracking-widest text-stone-400 font-semibold mb-5">Success Metrics</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Events captured per shift (adoption)",
              "Handover duration before vs after",
              "Clarification loop frequency (target: 30%+ reduction)",
              "Time-to-first-suspect on 2–3 real cases",
            ].map((metric) => (
              <div key={metric} className="bg-stone-50 border border-stone-200 rounded-lg px-5 py-4">
                <span className="text-stone-600 text-sm leading-snug">{metric}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TRUST ────────────────────────────────────────────────────────── */}
      <section className="w-full bg-stone-50 py-24 border-y border-stone-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Badge>Trust &amp; Governance</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] mb-14 leading-tight">
            Designed for operational learning.<br />Not surveillance.
          </h2>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            <div className="bg-white rounded-xl border border-emerald-200 p-8 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-emerald-600 font-semibold mb-5">
                ✓ What ShiftVoice stores by default
              </p>
              <ul className="space-y-3">
                {["Structured transcript (text only)", "Event tags: type, component, reason, action", "Operator ID and shift assignment"].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="mt-0.5 text-emerald-500 text-sm">✓</span>
                    <span className="text-stone-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white rounded-xl border border-rose-200 p-8 shadow-sm">
              <p className="text-xs uppercase tracking-widest text-rose-500 font-semibold mb-5">
                ✕ What it does not store by default
              </p>
              <ul className="space-y-3">
                {["Raw audio", "Continuous ambient recording", "Performance scoring"].map((item) => (
                  <li key={item} className="flex gap-3 items-start">
                    <span className="mt-0.5 text-rose-400 text-sm">✕</span>
                    <span className="text-stone-600 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <p className="text-stone-500 text-sm max-w-2xl leading-relaxed">
            Role-based permissions ensure operators see their own events. Managers see summary rollups. No individual performance monitoring.
          </p>
        </div>
      </section>

      {/* ─── TEAM ─────────────────────────────────────────────────────────── */}
      <section className="w-full bg-white py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <Badge>Team</Badge>
          <h2 className="text-3xl md:text-4xl font-extrabold text-[#0F1A2E] mb-14 leading-tight">
            Operators. Engineers. Founders.
          </h2>

          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Oleksandr card */}
            <div className="bg-white border border-stone-200 rounded-xl p-8 shadow-sm w-full md:max-w-sm">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#0F1A2E] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">O</span>
                </div>
                <div>
                  <h3 className="text-[#0F1A2E] font-bold text-lg">Oleksandr Khimiak</h3>
                  <p className="text-amber-600 text-sm font-semibold">CEO &amp; Co-Founder</p>
                </div>
              </div>
              <p className="text-stone-500 text-sm leading-relaxed mb-6">
                Manufacturing transformation &amp; commercial strategy, 15+ years. Worked inside plants. Knows what actually happens at shift end.
              </p>
              <div className="flex gap-3">
                <a
                  href="https://www.linkedin.com/in/oleksandr-khimiak/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs font-semibold text-white bg-[#0A66C2] px-4 py-2 rounded-lg hover:bg-[#004182] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="mailto:oleks@theadvisource.com"
                  className="flex items-center gap-2 text-xs font-semibold text-stone-600 border border-stone-200 px-4 py-2 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  Email
                </a>
              </div>
            </div>

            {/* About text */}
            <div className="flex-1 pt-2">
              <p className="text-stone-600 text-base leading-relaxed mb-4">
                ShiftVoice is built by a team with hands-on experience in industrial operations and applied AI. We&apos;ve worked inside plants. We know what actually happens at shift end.
              </p>
              <p className="text-stone-400 text-sm leading-relaxed">
                We started ShiftVoice because we saw the same pattern everywhere: smart operators, experienced engineers, and dedicated managers — all limited by the fact that operational knowledge evaporates every time a shift ends.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="w-full bg-[#0F1A2E] py-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
            Give us one station and one shift team.
          </h2>
          <p className="text-slate-400 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            We&apos;ll prove that structured operational memory works in your plant — your vocabulary, your operations, your historian if you have one.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://tidycal.com/lesykua/shift-voice-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-amber-500 text-white font-semibold px-9 py-4 rounded-lg hover:bg-amber-600 transition-colors shadow-lg shadow-amber-500/20 text-sm"
            >
              Book a Discovery Call
            </a>
            <a
              href="#"
              className="border border-white/20 text-white font-semibold px-9 py-4 rounded-lg hover:bg-white/10 transition-colors text-sm"
            >
              Download the One-Pager
            </a>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#080F1A] py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <span className="text-white font-bold">ShiftVoice</span>
            <a href="#" className="text-slate-600 text-sm hover:text-slate-400 transition-colors">Privacy</a>
            <a href="#" className="text-slate-600 text-sm hover:text-slate-400 transition-colors">Contact</a>
          </div>
          <p className="text-slate-600 text-sm">Structured operational memory for manufacturing.</p>
        </div>
      </footer>

    </div>
  );
}

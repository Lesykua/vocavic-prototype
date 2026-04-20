export default function Home() {
  return (
    <div className="w-full min-h-screen text-[#12232c]">

      {/* ─── NAV ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-[rgba(242,235,224,0.92)] backdrop-blur-md border-b border-[rgba(18,35,44,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[60px] flex items-center justify-between">
          <a href="/" className="flex items-baseline gap-[0.12em]">
            <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800, letterSpacing: '0.22em', fontSize: '1.1rem', color: '#12232c' }}>SHIFT</span>
            <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800, letterSpacing: '0.22em', fontSize: '1.1rem', color: '#687d85' }}>VOICE</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-[#687d85]">
            <a href="#demo" className="hover:text-[#12232c] transition-colors">Live Demo</a>
            <a href="#how-it-works" className="hover:text-[#12232c] transition-colors">How It Works</a>
            <a href="#pilot" className="hover:text-[#12232c] transition-colors">Pilot</a>
          </nav>
          <a
            href="https://tidycal.com/lesykua/shift-voice-meeting"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[#0f5f68] text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-[#127a85] transition-colors shadow-sm"
          >
            Book a Discovery Call
          </a>
        </div>
      </header>

      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section className="w-full pt-20 pb-28 px-6 lg:px-10">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-start">

          {/* Left col */}
          <div>
            <span className="inline-block bg-[rgba(15,95,104,0.1)] text-[#0f5f68] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-7">
              Structured Operational Memory
            </span>
            <h1
              className="font-extrabold leading-[0.94] text-[#12232c]"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(3rem, 4.5vw, 5.2rem)' }}
            >
              Your plant runs on memory that disappears every 8 hours.
            </h1>
            <p className="mt-6 text-[#687d85] text-lg leading-relaxed max-w-lg">
              ShiftVoice gives it structured operational memory — built into the shift, not bolted on after. Voice capture, automatic event structure, and replay for handover, RCA, and Tier meetings.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <a
                href="https://tidycal.com/lesykua/shift-voice-meeting"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#0f5f68] text-white font-semibold px-7 py-3.5 rounded-xl hover:bg-[#127a85] transition-colors text-sm shadow-md"
              >
                Book a Discovery Call →
              </a>
              <a
                href="#demo"
                className="border border-[rgba(18,35,44,0.2)] text-[#12232c] font-semibold px-7 py-3.5 rounded-xl hover:bg-[rgba(18,35,44,0.04)] transition-colors text-sm"
              >
                See Live Demo ↓
              </a>
            </div>

            {/* WPM bar chart */}
            <div className="mt-10 bg-[rgba(255,251,245,0.85)] rounded-2xl border border-[rgba(18,35,44,0.12)] p-6 shadow-sm">
              <p className="text-xs font-semibold text-[#687d85] uppercase tracking-widest mb-5">
                Words captured per minute
              </p>
              {[
                { label: "Speaking", wpm: 150, pct: 100, color: "#0f5f68" },
                { label: "Typing", wpm: 35, pct: 23, color: "#c68a22" },
                { label: "Writing", wpm: 12, pct: 8, color: "#d65848" },
              ].map((row) => (
                <div key={row.label} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-[#687d85]">{row.label}</span>
                    <span className="text-xs font-semibold text-[#12232c]">{row.wpm} wpm</span>
                  </div>
                  <div className="h-2 bg-[rgba(18,35,44,0.08)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${row.pct}%`, backgroundColor: row.color }}
                    />
                  </div>
                </div>
              ))}
              <p className="mt-4 text-xs text-[#687d85]">
                Voice capture delivers 4× more context per minute than typing — no forms, no friction.
              </p>
            </div>
          </div>

          {/* Right col: 4 feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {[
              {
                title: "Voice → Structure",
                body: "Operators speak. ShiftVoice structures. No forms, no typing, no new habit to build.",
                icon: "🎙",
              },
              {
                title: "Every Event Tagged",
                body: "Type · component · reason · action extracted automatically from every note.",
                icon: "🏷",
              },
              {
                title: "Replay-Ready",
                body: "Scrub back to any event. Operator observation synchronized with machine state.",
                icon: "⏮",
              },
              {
                title: "Auto Handover Report",
                body: "Incoming shift arrives with a full structured log. No whiteboard. No verbal recap.",
                icon: "📋",
              },
            ].map((card) => (
              <div
                key={card.title}
                className="bg-[rgba(255,251,245,0.85)] rounded-2xl border border-[rgba(18,35,44,0.12)] p-6 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 cursor-default shadow-sm"
              >
                <span className="text-2xl mb-4 block">{card.icon}</span>
                <h3
                  className="font-bold text-[#12232c] text-base mb-2"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '0.04em' }}
                >
                  {card.title}
                </h3>
                <p className="text-[#687d85] text-sm leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── QUOTES ───────────────────────────────────────────────────────── */}
      <section className="w-full py-20 border-t border-[rgba(18,35,44,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#687d85] mb-10">
            What we hear from operations teams
          </p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                quote: "We're often getting two-line reports from operators. If there's no paperwork, there's no record — and there's rarely paperwork.",
                role: "Plant Operations Manager",
                industry: "Automotive components, Poland",
              },
              {
                quote: "A third of our floor crew are temporary workers and many don't speak the local language well. Asking them to write detailed notes is not realistic.",
                role: "Shift Supervisor",
                industry: "Food & beverage, Netherlands",
              },
              {
                quote: "The information exists in people's heads, not on paper. Every RCA starts with someone calling around trying to piece together what actually happened.",
                role: "Head of Manufacturing Excellence",
                industry: "Specialty chemicals, Sweden",
              },
            ].map((q, i) => (
              <div
                key={i}
                className="bg-[rgba(255,251,245,0.85)] rounded-2xl border border-[rgba(18,35,44,0.12)] p-8 relative shadow-sm"
              >
                <span
                  className="absolute top-3 right-5 leading-none text-[#0f5f68] select-none"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: '6rem', opacity: 0.18 }}
                >
                  &ldquo;
                </span>
                <p className="text-[#12232c] text-sm leading-relaxed italic mb-6 relative z-10">
                  &ldquo;{q.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[rgba(15,95,104,0.15)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[#0f5f68] text-xs font-bold">{q.role[0]}</span>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#12232c]">{q.role}</p>
                    <p className="text-xs text-[#687d85]">{q.industry}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VIDEO ────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 border-t border-[rgba(18,35,44,0.1)]">
        <div className="max-w-5xl mx-auto px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#687d85] mb-3">See It In Action</p>
          <h2
            className="font-extrabold text-[#12232c] leading-none mb-10"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
          >
            From voice note to replayable event — in under 60 seconds
          </h2>
          {/* 16:9 responsive wrapper */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-[rgba(18,35,44,0.12)] shadow-xl" style={{ aspectRatio: '16/9' }}>
            <video
              className="absolute inset-0 w-full h-full object-cover"
              controls
              preload="metadata"
              poster="https://img.youtube.com/vi/X71YMNsw5UM/maxresdefault.jpg"
            >
              <source
                src="https://pub-7093cce43e7a4619997a2d5244f3148e.r2.dev/Shift%20Voice_v2.mp4"
                type="video/mp4"
              />
              Your browser does not support HTML5 video.
            </video>
          </div>
          <p className="mt-4 text-sm text-[#687d85] text-center">Real capture · Real structure · Real replay</p>
        </div>
      </section>

      {/* ─── LIVE DEMO ────────────────────────────────────────────────────── */}
      <section id="demo" className="w-full py-20 border-t border-[rgba(18,35,44,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#687d85] mb-3">Live Demo</p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-4">
            <h2
              className="font-extrabold text-[#12232c] leading-none"
              style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
            >
              See what the shift looks like inside ShiftVoice
            </h2>
            <a
              href="https://tidycal.com/lesykua/shift-voice-meeting"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0 bg-[#0f5f68] text-white text-sm font-semibold px-6 py-3 rounded-xl hover:bg-[#127a85] transition-colors shadow-sm"
            >
              Book a Discovery Call
            </a>
          </div>
          <p className="text-[#687d85] text-base mb-8 max-w-xl leading-relaxed">
            Real sample data. Click any event card to see the full operator note alongside machine state at the moment of capture.
          </p>

          {/* Browser chrome frame */}
          <div className="rounded-2xl overflow-hidden border border-[rgba(18,35,44,0.15)] shadow-2xl">
            <div className="bg-[#ece4d6] border-b border-[rgba(18,35,44,0.1)] px-4 py-3 flex items-center gap-3">
              <div className="flex gap-1.5">
                <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
                <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
                <span className="w-3 h-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="flex-1 bg-[rgba(255,251,245,0.9)] border border-[rgba(18,35,44,0.12)] rounded-md px-3 py-1 text-xs text-[#687d85] font-mono">
                shift&#8209;voice.com/dashboard
              </div>
              <span className="text-xs text-[#687d85] hidden sm:block">Interactive demo · sample data</span>
            </div>
            <iframe
              src="/dashboard.html"
              title="ShiftVoice — live operator notes demo"
              className="w-full border-0"
              style={{ height: "clamp(520px, 60vw, 720px)" }}
              loading="lazy"
            />
          </div>
          <p className="mt-4 text-xs text-[#687d85] text-center">
            Filters, search, and card drill-down are all live. Data shown is representative sample data from a pilot deployment.
          </p>
        </div>
      </section>

      {/* ─── THE GAP ──────────────────────────────────────────────────────── */}
      <section className="w-full py-20 border-t border-[rgba(18,35,44,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <span className="inline-block bg-[rgba(15,95,104,0.1)] text-[#0f5f68] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            The Gap
          </span>
          <h2
            className="font-extrabold text-[#12232c] leading-none mb-4"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
          >
            Every plant has data.<br />Almost none have operational memory.
          </h2>
          <p className="text-[#687d85] text-base mb-12 max-w-xl">
            Three columns of information exist in every plant. Only two get captured.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-[rgba(18,35,44,0.12)] bg-[rgba(255,251,245,0.85)] shadow-sm">
            <table className="w-full text-sm min-w-[520px]">
              <thead>
                <tr className="border-b border-[rgba(18,35,44,0.1)]">
                  {[
                    { label: "Your machines record", accent: false },
                    { label: "Your systems store", accent: false },
                    { label: "Nobody captures", accent: true },
                  ].map((h) => (
                    <th
                      key={h.label}
                      className={`text-left px-6 py-4 text-xs font-semibold uppercase tracking-wide ${
                        h.accent ? "text-[#0f5f68]" : "text-[#687d85]"
                      }`}
                    >
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
                  <tr key={i} className={i < 2 ? "border-b border-[rgba(18,35,44,0.07)]" : ""}>
                    {row.map((cell, j) => (
                      <td
                        key={j}
                        className={`px-6 py-4 align-top leading-snug ${
                          j === 2
                            ? "text-[#12232c] font-semibold bg-[rgba(15,95,104,0.06)]"
                            : "text-[#687d85]"
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
          <p className="mt-8 text-[#12232c] text-base max-w-2xl leading-relaxed border-l-4 border-[#0f5f68] pl-5 italic opacity-80">
            That missing layer is where investigations stall, handovers fail, and the same problems come back.
          </p>
        </div>
      </section>

      {/* ─── WHERE IT SHOWS UP ────────────────────────────────────────────── */}
      <section id="where-it-shows-up" className="w-full py-20 border-t border-[rgba(18,35,44,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <span className="inline-block bg-[rgba(15,95,104,0.1)] text-[#0f5f68] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            Where Operational Memory Gets Used
          </span>
          <h2
            className="font-extrabold text-[#12232c] leading-none mb-14"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
          >
            The same record. Used at every step.
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                num: "01",
                title: "Shift Handover",
                body: "The incoming team opens a structured event log, not a whiteboard. They know what happened, who handled it, and what's still open — before the outgoing team says a word.",
                accent: "#0f5f68",
              },
              {
                num: "02",
                title: "Root Cause Analysis",
                body: "The engineer doesn't start from scratch. They search past events, replay what the operator observed alongside what the machine recorded, and arrive at a hypothesis in minutes — not hours.",
                accent: "#c68a22",
              },
              {
                num: "03",
                title: "Tier Meetings & Pulse Reviews",
                body: "The Operations Manager doesn't hear what people remember. They see structured data: recurring issues by frequency, open events by line, pattern trends over weeks. Decisions get made on evidence.",
                accent: "#2f8f63",
              },
            ].map((card) => (
              <div
                key={card.num}
                className="bg-[rgba(255,251,245,0.85)] rounded-2xl border border-[rgba(18,35,44,0.12)] p-8 hover:-translate-y-1 hover:shadow-lg transition-all duration-200 shadow-sm"
                style={{ borderTop: `3px solid ${card.accent}` }}
              >
                <span
                  className="font-extrabold text-[rgba(18,35,44,0.12)] text-4xl"
                  style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                >
                  {card.num}
                </span>
                <h3
                  className="font-bold text-[#12232c] text-xl mt-4 mb-3"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '0.04em' }}
                >
                  {card.title}
                </h3>
                <p className="text-[#687d85] text-sm leading-relaxed">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="w-full py-20 border-t border-[rgba(18,35,44,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <span className="inline-block bg-[rgba(15,95,104,0.1)] text-[#0f5f68] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            How It Works
          </span>
          <h2
            className="font-extrabold text-[#12232c] leading-none mb-14"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
          >
            Capture once. Available everywhere.
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: "1",
                label: "Speak",
                body: "Operator records a short voice note at any point during or at end of shift. No forms. No typing.",
              },
              {
                step: "2",
                label: "Structure",
                body: "ShiftVoice extracts event type, affected component, root reason, and action taken automatically.",
              },
              {
                step: "3",
                label: "Enrich",
                body: "For plants with process data systems, surrounding machine signals and alarms are pulled and attached to the event at the moment of capture.",
              },
              {
                step: "4",
                label: "Memory",
                body: "The event enters a searchable, replayable record — available for the next shift, the investigating engineer, and the manager's Tier meeting.",
              },
            ].map((s) => (
              <div
                key={s.step}
                className="bg-[rgba(255,251,245,0.85)] rounded-2xl border border-[rgba(18,35,44,0.12)] p-7 shadow-sm"
              >
                <div className="w-9 h-9 rounded-full bg-[#0f5f68] text-white text-sm font-bold flex items-center justify-center mb-5">
                  {s.step}
                </div>
                <h3
                  className="font-bold text-[#12232c] text-xl mb-2"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '0.04em' }}
                >
                  {s.label}
                </h3>
                <p className="text-[#687d85] text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 bg-[#12232c] rounded-2xl p-8 text-white">
            <p className="text-base leading-relaxed max-w-2xl">
              <span className="font-bold" style={{ color: '#7ec8cf' }}>Replay is what makes investigation fast.</span>{" "}
              Scrub back through any event and see exactly what was happening — operator observation and machine state, synchronized.
            </p>
          </div>
        </div>
      </section>

      {/* ─── OUTCOMES ─────────────────────────────────────────────────────── */}
      <section className="w-full py-20 border-t border-[rgba(18,35,44,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <span className="inline-block bg-[rgba(15,95,104,0.1)] text-[#0f5f68] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            Proven Outcomes
          </span>
          <h2
            className="font-extrabold text-[#12232c] leading-none mb-3"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
          >
            What operational memory looks like in practice
          </h2>
          <p className="text-[#687d85] text-sm mb-14 max-w-xl">
            Results from a 9-week pilot at a mid-sized manufacturing plant in Sweden. Measured, not projected.
          </p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { stat: "73%", label: "reduction in handover time", sub: "15 min → 4 min", change: "Structured records replace verbal recaps" },
              { stat: "50%", label: "fewer clarification loops", sub: null, change: "Every event has an owner, a log, and evidence" },
              { stat: "Hours →\nMinutes", label: "time-to-first-suspect", sub: null, change: "Investigations start with context already assembled" },
              { stat: "Auto", label: "recurring issues surface", sub: null, change: "Frequency and context replace anecdote" },
            ].map((item) => (
              <div
                key={item.label}
                className="bg-[rgba(255,251,245,0.85)] rounded-2xl border border-[rgba(18,35,44,0.12)] p-8 flex gap-6 items-start shadow-sm"
              >
                <div className="flex-shrink-0">
                  <p
                    className="font-extrabold text-[#0f5f68] leading-none whitespace-pre-line text-4xl"
                    style={{ fontFamily: 'var(--font-barlow-condensed)' }}
                  >
                    {item.stat}
                  </p>
                  {item.sub && <p className="text-xs text-[#687d85] mt-1">{item.sub}</p>}
                </div>
                <div className="border-l border-[rgba(18,35,44,0.12)] pl-6">
                  <p className="text-[#12232c] font-semibold text-sm leading-snug mb-1">{item.label}</p>
                  <p className="text-[#687d85] text-sm">{item.change}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PILOT ────────────────────────────────────────────────────────── */}
      <section id="pilot" className="w-full py-20 border-t border-[rgba(18,35,44,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <span className="inline-block bg-[rgba(15,95,104,0.1)] text-[#0f5f68] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            Pilot Program
          </span>
          <h2
            className="font-extrabold text-[#12232c] leading-none mb-3"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
          >
            One station. One shift team. 9 weeks to proof.
          </h2>
          <p className="text-[#687d85] text-base max-w-2xl mb-14 leading-relaxed">
            We don&apos;t ask for a platform decision. We ask for one station and nine weeks to prove that operational memory works — with your vocabulary, your operations, your team.
          </p>
          <div className="grid md:grid-cols-4 gap-4 mb-14">
            {[
              { phase: "Mapping + Baseline", weeks: "Week 1", what: "Document current handover process, capture baseline metrics, identify target events and vocabulary", accent: "#0f5f68" },
              { phase: "Deploy + Connect", weeks: "Weeks 2–4", what: "Install, connect data systems if applicable, calibrate event taxonomy to your plant", accent: "#c68a22" },
              { phase: "Run + Tune + Measure", weeks: "Weeks 5–7", what: "Live capture. Iterate. Track adoption and handover metrics", accent: "#2f8f63" },
              { phase: "Proof + Plan", weeks: "Weeks 8–9", what: "Results against agreed criteria. Expansion roadmap with ROI estimate", accent: "#687d85" },
            ].map((row) => (
              <div
                key={row.phase}
                className="bg-[rgba(255,251,245,0.85)] border border-[rgba(18,35,44,0.12)] rounded-2xl p-6 shadow-sm"
                style={{ borderTop: `3px solid ${row.accent}` }}
              >
                <p className="text-xs font-bold text-[#687d85] mb-1">{row.weeks}</p>
                <h3
                  className="font-bold text-[#12232c] text-base mb-3"
                  style={{ fontFamily: 'var(--font-barlow-condensed)', letterSpacing: '0.04em' }}
                >
                  {row.phase}
                </h3>
                <p className="text-[#687d85] text-xs leading-relaxed">{row.what}</p>
              </div>
            ))}
          </div>
          <p className="text-xs uppercase tracking-widest text-[#687d85] font-semibold mb-5">Success Metrics</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              "Events captured per shift (adoption)",
              "Handover duration before vs after",
              "Clarification loop frequency (target: 30%+ reduction)",
              "Time-to-first-suspect on 2–3 real cases",
            ].map((metric) => (
              <div
                key={metric}
                className="bg-[rgba(255,251,245,0.85)] border border-[rgba(18,35,44,0.12)] rounded-xl px-5 py-4 shadow-sm"
              >
                <span className="text-[#687d85] text-sm leading-snug">{metric}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ABOUT (dark) ─────────────────────────────────────────────────── */}
      <section className="w-full py-20 bg-[#12232c]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[rgba(255,251,245,0.35)] mb-6">
                About ShiftVoice
              </p>
              <h2
                className="font-extrabold text-white leading-none mb-8"
                style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
              >
                Built by people who&apos;ve worked inside plants.
              </h2>
              <p className="text-[rgba(255,251,245,0.55)] text-base leading-relaxed mb-5">
                ShiftVoice is built by a team with hands-on experience in industrial operations and applied AI. We&apos;ve worked inside plants. We know what actually happens at shift end.
              </p>
              <p className="text-[rgba(255,251,245,0.35)] text-sm leading-relaxed">
                We started ShiftVoice because we saw the same pattern everywhere: smart operators, experienced engineers, and dedicated managers — all limited by the fact that operational knowledge evaporates every time a shift ends.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  label: "Mission",
                  text: "Give manufacturing plants the operational memory they've been running without.",
                },
                {
                  label: "Approach",
                  text: "Pilot-first. One station, one shift team, 9 weeks to proof.",
                },
                {
                  label: "Stage",
                  text: "Post-pilot. Working with 2 manufacturing facilities. Raising seed round.",
                },
                {
                  label: "Privacy",
                  text: "No audio stored. Structured text only. Role-based access. Your data stays in your plant.",
                },
              ].map((card) => (
                <div key={card.label} className="bg-white/5 border border-white/10 rounded-xl p-5">
                  <p className="text-xs font-semibold uppercase tracking-widest mb-2" style={{ color: '#7ec8cf' }}>
                    {card.label}
                  </p>
                  <p className="text-[rgba(255,251,245,0.55)] text-sm leading-relaxed">{card.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── TEAM ─────────────────────────────────────────────────────────── */}
      <section className="w-full py-20 border-t border-[rgba(18,35,44,0.1)]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <span className="inline-block bg-[rgba(15,95,104,0.1)] text-[#0f5f68] text-xs font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-5">
            Team
          </span>
          <h2
            className="font-extrabold text-[#12232c] leading-none mb-14"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2rem, 3.5vw, 3.5rem)' }}
          >
            Operators. Engineers. Founders.
          </h2>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="bg-[rgba(255,251,245,0.85)] border border-[rgba(18,35,44,0.12)] rounded-2xl p-8 w-full md:max-w-sm shadow-sm">
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-full bg-[#0f5f68] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">O</span>
                </div>
                <div>
                  <h3 className="text-[#12232c] font-bold text-lg">Oleksandr Khimiak</h3>
                  <p className="text-[#0f5f68] text-sm font-semibold">CEO &amp; Co-Founder</p>
                </div>
              </div>
              <p className="text-[#687d85] text-sm leading-relaxed mb-6">
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
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                  LinkedIn
                </a>
                <a
                  href="mailto:oleks@theadvisource.com"
                  className="flex items-center gap-2 text-xs font-semibold text-[#687d85] border border-[rgba(18,35,44,0.15)] px-4 py-2 rounded-lg hover:bg-[rgba(18,35,44,0.04)] transition-colors"
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FINAL CTA ────────────────────────────────────────────────────── */}
      <section className="w-full py-28 bg-[#0f5f68]">
        <div className="max-w-4xl mx-auto px-6 lg:px-10 text-center">
          <h2
            className="font-extrabold text-white leading-none mb-6"
            style={{ fontFamily: 'var(--font-barlow-condensed)', fontSize: 'clamp(2.5rem, 5vw, 5rem)' }}
          >
            Give us one station and one shift team.
          </h2>
          <p className="text-white/65 text-base max-w-xl mx-auto mb-10 leading-relaxed">
            We&apos;ll prove that structured operational memory works in your plant — your vocabulary, your operations, your historian if you have one.
          </p>
          <a
            href="https://tidycal.com/lesykua/shift-voice-meeting"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-[#0f5f68] font-bold px-10 py-4 rounded-xl hover:bg-[#f2ebe0] transition-colors shadow-2xl text-sm"
          >
            Book a Discovery Call →
          </a>
        </div>
      </section>

      {/* ─── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="w-full bg-[#12232c] py-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-baseline gap-[0.12em]">
              <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800, letterSpacing: '0.22em', fontSize: '1.1rem', color: '#ffffff' }}>SHIFT</span>
              <span style={{ fontFamily: 'var(--font-barlow-condensed)', fontWeight: 800, letterSpacing: '0.22em', fontSize: '1.1rem', color: 'rgba(255,251,245,0.35)' }}>VOICE</span>
            </a>
            <a href="#" className="text-[rgba(255,251,245,0.3)] text-sm hover:text-[rgba(255,251,245,0.6)] transition-colors">Privacy</a>
            <a href="mailto:oleks@theadvisource.com" className="text-[rgba(255,251,245,0.3)] text-sm hover:text-[rgba(255,251,245,0.6)] transition-colors">Contact</a>
          </div>
          <p className="text-[rgba(255,251,245,0.25)] text-sm">Structured operational memory for manufacturing.</p>
        </div>
      </footer>

    </div>
  );
}

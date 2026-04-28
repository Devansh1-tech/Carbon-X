import { useState, useEffect, useRef } from 'react'
import './App.css'

/* ── Intersection Observer hook ── */
function useReveal() {
  const ref = useRef(null)
  useEffect(() => {
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible') }),
      { threshold: 0.15 }
    )
    const els = ref.current?.querySelectorAll('.reveal')
    els?.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])
  return ref
}

/* ── Counter animation hook ── */
function useCounter(end, duration = 2000) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !started.current) {
        started.current = true
        const start = performance.now()
        const tick = now => {
          const p = Math.min((now - start) / duration, 1)
          setVal(Math.floor(p * end))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }
    }, { threshold: 0.3 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [end, duration])
  return [val, ref]
}

/* ── Navbar ── */
function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} id="nav">
      <div className="container nav-inner">
        <a href="#" className="nav-logo"><span className="logo-icon">🌿</span>CarbonX</a>
        <ul className={`nav-links${open ? ' open' : ''}`}>
          {['Problem','How It Works','Features','AI','Impact'].map(t => (
            <li key={t}><a href={`#${t.toLowerCase().replace(/\s/g,'-')}`} onClick={() => setOpen(false)}>{t}</a></li>
          ))}
        </ul>
        <a href="#cta" className="nav-cta">Get Started</a>
        <button className="mobile-toggle" onClick={() => setOpen(!open)} aria-label="Toggle menu">{open ? '✕' : '☰'}</button>
      </div>
    </nav>
  )
}

/* ── Hero ── */
function Hero() {
  const [credits] = useCounter(12500)
  const [projects] = useCounter(840)
  const [tonnes] = useCounter(45000)
  return (
    <section className="hero-section" id="hero">
      <div className="hero-bg-orb orb-1" />
      <div className="hero-bg-orb orb-2" />
      <div className="hero-grid" />
      <div className="container hero-inner">
        <div className="hero-content">
          <div className="hero-badge"><span className="badge-dot" />AI-Powered Carbon Marketplace</div>
          <h1 className="hero-title">Turn <span className="text-gradient">Green Efforts</span> Into Real Rewards</h1>
          <p className="hero-subtitle">A transparent platform where farmers, NGOs &amp; individuals earn carbon credits for their sustainability work — and companies buy them to offset emissions.</p>
          <div className="hero-actions">
            <button className="btn-primary" id="hero-start">Start Earning Credits</button>
            <button className="btn-secondary" id="hero-learn">Learn More ↓</button>
          </div>
          <div className="hero-stats">
            <div className="stat-item" ref={el => { if (el && !el._r) { el._r = true } }}><div className="stat-value">{credits.toLocaleString()}+</div><div className="stat-label">Credits Traded</div></div>
            <div className="stat-item"><div className="stat-value">{projects}+</div><div className="stat-label">Green Projects</div></div>
            <div className="stat-item"><div className="stat-value">{tonnes.toLocaleString()}</div><div className="stat-label">Tonnes CO₂ Offset</div></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <div className="hero-image-ring" />
            <img src="/hero-earth.png" alt="Sustainable Earth illustration" />
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Problem ── */
function Problem() {
  const r = useReveal()
  const cards = [
    { icon: '🚫', title: 'No Monetization', text: 'Farmers and NGOs doing environmental work like tree plantation and organic farming get no financial benefit for their green efforts.' },
    { icon: '🏭', title: 'Rising Emissions', text: 'Industries and transportation produce massive carbon emissions. Companies need carbon credits to offset their footprint but lack easy access.' },
    { icon: '🐌', title: 'Broken Systems', text: 'Current carbon credit systems are slow, centralized, inaccessible to small players, and lack transparency in verification.' },
  ]
  return (
    <section className="problem-section section-padding" id="problem" ref={r}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">⚡ The Problem</span>
          <h2>Why We Need a <span className="text-gradient">Better Way</span></h2>
          <p>Climate change is one of the biggest challenges we face. The people fighting it deserve to be rewarded.</p>
        </div>
        <div className="problem-grid">
          {cards.map((c, i) => (
            <div className={`problem-card reveal reveal-delay-${i + 1}`} key={i}>
              <div className="problem-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── How It Works ── */
function HowItWorks() {
  const r = useReveal()
  const steps = [
    { icon: '📋', title: 'Register & Submit', text: 'Sign up as a farmer, NGO or individual. Upload your green project details.' },
    { icon: '🛰️', title: 'AI Verification', text: 'Our AI verifies projects using satellite imagery, soil data and reports.' },
    { icon: '💎', title: 'Earn Credits', text: 'Verified carbon reductions are converted to tradeable carbon credits in your wallet.' },
    { icon: '🤝', title: 'Trade & Earn', text: 'Companies purchase your credits on the marketplace to offset their emissions.' },
  ]
  return (
    <section className="how-section section-padding" id="how-it-works" ref={r}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">🔄 How It Works</span>
          <h2>From Green Action to <span className="text-gradient">Carbon Credits</span></h2>
          <p>A simple 4-step process that connects sustainability efforts to real financial rewards.</p>
        </div>
        <div className="how-steps">
          {steps.map((s, i) => (
            <div className={`step-card reveal reveal-delay-${i + 1}`} key={i}>
              <div className="step-number">{i + 1}</div>
              <div className="step-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Participants ── */
function Participants() {
  const r = useReveal()
  const parts = [
    { emoji: '🌾', title: 'Farmers', text: 'Earn credits through regenerative farming, organic practices and soil carbon sequestration.' },
    { emoji: '🌳', title: 'NGOs', text: 'Generate credits via tree plantation, forest restoration and environmental conservation projects.' },
    { emoji: '🏡', title: 'Individuals', text: 'Participate through urban plantation, community gardens and local green projects.' },
    { emoji: '🏢', title: 'Companies', text: 'Purchase carbon credits to offset emissions and achieve carbon neutrality goals.' },
  ]
  return (
    <section className="participants-section section-padding" id="participants" ref={r}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">👥 Who Can Join</span>
          <h2>Built for <span className="text-gradient">Everyone</span></h2>
          <p>Whether you're growing crops or running a corporation — there's a place for you in the carbon economy.</p>
        </div>
        <div className="participants-grid">
          {parts.map((p, i) => (
            <div className={`participant-card reveal reveal-delay-${i + 1}`} key={i}>
              <div className="participant-avatar">{p.emoji}</div>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Features ── */
function Features() {
  const r = useReveal()
  const feats = [
    { icon: '👤', title: 'Role-Based Registration', text: 'Separate dashboards and workflows for farmers, NGOs, companies and individuals.' },
    { icon: '📤', title: 'Project Submission', text: 'Upload sustainability projects with land area, plantation data and emission reports.' },
    { icon: '✅', title: 'Smart Verification', text: 'Automated verification using satellite images, field reports and uploaded documentation.' },
    { icon: '💰', title: 'Carbon Wallet', text: 'Every user gets a digital wallet to store, track and manage their earned carbon credits.' },
    { icon: '📊', title: 'Carbon Exchange', text: 'A real-time marketplace where credits are bought and sold — like a green stock market.' },
    { icon: '📈', title: 'Analytics Dashboard', text: 'Track emissions data, sustainability progress and trading activity with rich visualizations.' },
  ]
  return (
    <section className="features-section section-padding" id="features" ref={r}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">✨ Platform Features</span>
          <h2>Everything You Need to <span className="text-gradient">Go Green</span></h2>
          <p>A complete ecosystem for carbon credit generation, verification, and trading.</p>
        </div>
        <div className="features-grid">
          {feats.map((f, i) => (
            <div className={`feature-card reveal reveal-delay-${i + 1}`} key={i}>
              <div className="feature-icon-wrap">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── AI Section ── */
function AISection() {
  const r = useReveal()
  const items = [
    { icon: '🛰️', title: 'Satellite Image Analysis', text: 'AI verifies forests and green cover actually exist using real-time satellite data.' },
    { icon: '🌱', title: 'Soil Carbon Prediction', text: 'ML models predict how much carbon is being stored through farming practices.' },
    { icon: '🔍', title: 'Fraud Detection', text: 'Intelligent systems detect fake projects and duplicate claims automatically.' },
    { icon: '💲', title: 'Dynamic Pricing', text: 'AI estimates carbon credit prices based on real-time market supply and demand.' },
    { icon: '💡', title: 'Smart Recommendations', text: 'Personalized suggestions help farmers maximize credit earnings with optimal practices.' },
  ]
  return (
    <section className="ai-section section-padding" id="ai" ref={r}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">🤖 Artificial Intelligence</span>
          <h2>Powered by <span className="text-gradient">AI</span></h2>
          <p>Artificial Intelligence makes our platform smart, transparent, and trustworthy.</p>
        </div>
        <div className="ai-grid">
          <div className="ai-visual reveal">
            <div className="ai-brain">
              <div className="ai-brain-ring" />
              <div className="ai-brain-ring" />
              <div className="ai-brain-ring" />
              <div className="ai-brain-core" />
              <div className="ai-brain-center">🧠</div>
            </div>
          </div>
          <div className="ai-features-list">
            {items.map((it, i) => (
              <div className={`ai-feature-item reveal reveal-delay-${i + 1}`} key={i}>
                <div className="ai-feature-icon">{it.icon}</div>
                <div>
                  <h4>{it.title}</h4>
                  <p>{it.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Tech ── */
function Tech() {
  const r = useReveal()
  const cards = [
    { icon: '🔗', title: 'Blockchain', text: 'Carbon credits stored as tokens on blockchain for complete transparency and immutable trust.' },
    { icon: '📡', title: 'IoT Sensors', text: 'Automated data collection of soil moisture, temperature and organic carbon levels in real-time.' },
    { icon: '🌐', title: 'Satellite Monitoring', text: 'Continuous project verification through regular satellite imagery and remote sensing.' },
  ]
  return (
    <section className="tech-section section-padding" id="tech" ref={r}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">⚙️ Advanced Tech</span>
          <h2>Built on <span className="text-gradient">Cutting-Edge</span> Technology</h2>
          <p>Blockchain, IoT and satellite tech working together to create a trustless, transparent ecosystem.</p>
        </div>
        <div className="tech-cards">
          {cards.map((c, i) => (
            <div className={`tech-card reveal reveal-delay-${i + 1}`} key={i}>
              <div className="tech-icon">{c.icon}</div>
              <h3>{c.title}</h3>
              <p>{c.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── Impact ── */
function Impact() {
  const r = useReveal()
  const items = [
    { icon: '💵', title: 'Extra Income for Farmers', text: 'Beyond crops — earn from sustainable practices.' },
    { icon: '🌍', title: 'Funded NGOs', text: 'Environmental projects get the funding they deserve.' },
    { icon: '🏭', title: 'Carbon Neutral Companies', text: 'Achieve sustainability goals through credit purchases.' },
    { icon: '🌡️', title: 'Reduced Emissions', text: 'Large-scale carbon reduction at a global level.' },
  ]
  return (
    <section className="impact-section section-padding" id="impact" ref={r}>
      <div className="container">
        <div className="section-header reveal">
          <span className="section-label">🎯 Real Impact</span>
          <h2>Making a <span className="text-gradient">Difference</span></h2>
          <p>Connecting sustainability efforts with financial rewards creates a win-win for everyone.</p>
        </div>
        <div className="impact-grid">
          {items.map((it, i) => (
            <div className={`impact-card reveal reveal-delay-${i + 1}`} key={i}>
              <div className="impact-icon">{it.icon}</div>
              <h3>{it.title}</h3>
              <p>{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

/* ── CTA ── */
function CTA() {
  const r = useReveal()
  return (
    <section className="cta-section section-padding" id="cta" ref={r}>
      <div className="container">
        <div className="cta-box reveal">
          <h2>Ready to Join the <span className="text-gradient">Green Revolution</span>?</h2>
          <p>Whether you plant trees, restore forests, or need to offset emissions — start today.</p>
          <div className="cta-actions">
            <button className="btn-primary" id="cta-create">Create Your Project</button>
            <button className="btn-secondary" id="cta-buy">Buy Carbon Credits</button>
          </div>
        </div>
      </div>
    </section>
  )
}

/* ── Footer ── */
function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <a href="#" className="nav-logo"><span className="logo-icon">🌿</span>CarbonX</a>
            <p>An AI-powered platform connecting sustainability efforts with financial rewards. Trade carbon credits transparently and make a real impact on climate change.</p>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#how-it-works">How It Works</a></li>
              <li><a href="#ai">AI Technology</a></li>
              <li><a href="#tech">Tech Stack</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Participants</h4>
            <ul>
              <li><a href="#participants">Farmers</a></li>
              <li><a href="#participants">NGOs</a></li>
              <li><a href="#participants">Individuals</a></li>
              <li><a href="#participants">Companies</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Resources</h4>
            <ul>
              <li><a href="#">Documentation</a></li>
              <li><a href="#">API Reference</a></li>
              <li><a href="#">Carbon Calculator</a></li>
              <li><a href="#">Contact Us</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© 2026 CarbonX. All rights reserved.</span>
          <span>Built with 💚 for the planet</span>
        </div>
      </div>
    </footer>
  )
}

/* ── App ── */
export default function App() {
  return (
    <>
      <Navbar />
      <Hero />
      <Problem />
      <HowItWorks />
      <Participants />
      <Features />
      <AISection />
      <Tech />
      <Impact />
      <CTA />
      <Footer />
    </>
  )
}

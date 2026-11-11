import { Link } from "react-router-dom"
import { ArrowRight, ArrowUpRight, Globe2, Network } from "lucide-react"
import "./FinalProject.css"

function PlateIllustration() {
  return (
    <svg className="flavor-plate" viewBox="0 0 620 620" aria-hidden="true">
      <defs>
        <filter id="plate-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="20" stdDeviation="22" floodColor="#465044" floodOpacity="0.16" />
        </filter>
        <pattern id="plate-dots" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.3" fill="#cfbd9c" opacity="0.45" />
        </pattern>
      </defs>

      <circle cx="310" cy="310" r="286" fill="url(#plate-dots)" />
      <circle cx="310" cy="310" r="245" fill="#fffdf7" filter="url(#plate-shadow)" />
      <circle cx="310" cy="310" r="221" fill="none" stroke="#e7e2d5" strokeWidth="2" />
      <circle cx="310" cy="310" r="202" fill="#faf7ee" stroke="#eee9dd" strokeWidth="2" />

      <path d="M202 280c36-57 87-66 123-24 28 32 56 30 85 0 25-26 58-9 52 30-7 45-54 54-81 32-25-20-47-22-67 11-33 53-109 33-112-18-1-11-1-22 0-31Z" fill="#e8a959" opacity=".78" />
      <path d="M209 286c44-33 72-18 101 16 29 34 61 37 103-2 29-27 45-21 52-9M225 330c40 19 61 8 86-23 30-36 60-28 94 17" fill="none" stroke="#c7783e" strokeWidth="8" strokeLinecap="round" opacity=".7" />

      <g transform="translate(228 222) rotate(-13)">
        <circle r="70" fill="#bd4433" />
        <circle r="60" fill="#ec7558" />
        <circle r="50" fill="#f29a73" stroke="#f9c3a4" strokeWidth="3" />
        <path d="M0-48v96M-46 0h92M-32-32l64 64M32-32l-64 64" stroke="#fbd4ad" strokeWidth="6" strokeLinecap="round" />
        <circle r="14" fill="#d9523c" />
        <g fill="#f8e7bc">
          <ellipse cx="17" cy="-37" rx="3" ry="6" transform="rotate(25 17 -37)" />
          <ellipse cx="39" cy="14" rx="3" ry="6" transform="rotate(110 39 14)" />
          <ellipse cx="-12" cy="38" rx="3" ry="6" transform="rotate(190 -12 38)" />
          <ellipse cx="-37" cy="-12" rx="3" ry="6" transform="rotate(285 -37 -12)" />
        </g>
      </g>

      <g transform="translate(394 380) rotate(29)">
        <path d="M0 74C-50 26-42-39 0-75 43-37 49 28 0 74Z" fill="#4e7756" />
        <path d="M0 72C-10 15-6-35 0-74" fill="none" stroke="#b7d29b" strokeWidth="4" strokeLinecap="round" />
        <path d="M0 8-27-23M0-15 24-37M0 35 26 7" stroke="#9dbb84" strokeWidth="2" fill="none" />
      </g>
      <g transform="translate(295 407) rotate(-45)">
        <path d="M0 49C-33 18-30-23 0-48 31-23 35 18 0 49Z" fill="#779769" />
        <path d="M0 46V-45" stroke="#c8d8a6" strokeWidth="3" />
      </g>
      <g transform="translate(396 205) rotate(26)">
        <path d="M-54 0a54 54 0 0 1 108 0Z" fill="#f0bd68" stroke="#dfa553" strokeWidth="4" />
        <path d="M-43 0a43 43 0 0 1 86 0Z" fill="#fff1b9" />
        <path d="M0-42V0M-30-31 0 0M30-31 0 0" stroke="#e2b65c" strokeWidth="3" />
      </g>

      <circle cx="168" cy="365" r="10" fill="#6f8459" />
      <circle cx="184" cy="381" r="6" fill="#819566" />
      <circle cx="454" cy="307" r="8" fill="#bd4433" />
      <circle cx="469" cy="320" r="5" fill="#d96a4b" />
      <path d="M164 178c-29-22-45-23-65-12M469 440c28 27 51 30 68 18" fill="none" stroke="#a7ad89" strokeWidth="2" strokeDasharray="4 7" strokeLinecap="round" />
      <circle cx="100" cy="166" r="5" fill="#d4543e" />
      <circle cx="538" cy="458" r="5" fill="#6d8b64" />
    </svg>
  )
}

export function FinalProject() {
  return (
    <div className="flavor-page">
      <header className="flavor-header">
        <Link to="/" className="flavor-brand" aria-label="Social Graphs home">
          <span className="flavor-brand-mark"><span /><span /><span /></span>
          <span>Social Graphs<span className="flavor-brand-dot">.</span></span>
        </Link>
        <nav className="flavor-nav" aria-label="Final project navigation">
          <a href="#explore">Explore</a>
          <Link to="/" className="flavor-nav-home">Course home <ArrowUpRight size={15} /></Link>
        </nav>
      </header>

      <main>
        <section className="flavor-hero" aria-labelledby="flavor-title">
          <div className="flavor-hero-copy">
            <div className="flavor-kicker"><span className="flavor-kicker-line" /> Final project &middot; Social Graphs 2026</div>
            <h1 id="flavor-title">A little food<br />for <em>thought.</em></h1>
            <p className="flavor-lead">Explore how ingredients connect and how cuisines put their own spin on them.</p>
            <a href="#explore" className="flavor-primary-link">Choose a view <ArrowRight size={19} /></a>
          </div>
          <div className="flavor-hero-art">
            <div className="flavor-art-ring" />
            <PlateIllustration />
            <div className="flavor-art-label flavor-art-label-top"><span className="flavor-label-symbol">&#10043;</span> a little curiosity</div>
            <div className="flavor-art-label flavor-art-label-bottom">served with a side of graphs <span className="flavor-label-symbol">&#8599;</span></div>
          </div>
        </section>

        <section className="flavor-explore" id="explore" aria-labelledby="explore-title">
          <div className="flavor-section-label"><span>Pick a plate</span><span className="flavor-section-line" /></div>
          <h2 id="explore-title">What&apos;s on the menu?</h2>
          <div className="flavor-view-grid">
            <a className="flavor-view-card flavor-view-network" href="/visualizations/network/index.html">
              <span className="flavor-view-top"><span>01 / Cuisine map network</span><Network size={25} strokeWidth={1.5} /></span>
              <span className="flavor-view-art flavor-view-art-network" aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
              <span className="flavor-view-bottom">
                <span><strong>What goes together?</strong><small>Explore ingredient links on a map, or connect recipes that share ingredients.</small></span>
                <span className="flavor-view-arrow"><ArrowUpRight size={22} /></span>
              </span>
            </a>
            <a className="flavor-view-card flavor-view-cuisines" href="/visualizations/cuisines/index.html">
              <span className="flavor-view-top"><span>02 / Cuisine comparison</span><Globe2 size={25} strokeWidth={1.5} /></span>
              <span className="flavor-view-art flavor-view-art-scatter" aria-hidden="true"><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /></span>
              <span className="flavor-view-bottom">
                <span><strong>How do cuisines differ?</strong><small>Choose two cuisines and see where ingredients appear most often.</small></span>
                <span className="flavor-view-arrow"><ArrowUpRight size={22} /></span>
              </span>
            </a>
          </div>
        </section>
      </main>

      <footer className="flavor-footer">
        <span>Social Graphs &middot; Final Project</span>
        <Link to="/">Back to the course <ArrowRight size={15} /></Link>
      </footer>
    </div>
  )
}

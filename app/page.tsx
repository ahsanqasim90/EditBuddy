import {
  ArrowDown,
  ArrowUpRight,
  Captions,
  Clapperboard,
  Languages,
  ScanText,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { CreatorRigExperience } from "@/components/marketing/car-experience";
import "./marketing.css";

const editorUrl = "/editor/";

const featureCards = [
  {
    icon: ScanText,
    eyebrow: "01 / TRANSCRIBE",
    title: "Timing that lands on the beat.",
    copy: "Scribe v2 turns speech into editable, word-timed captions built for fast-moving cuts.",
  },
  {
    icon: Languages,
    eyebrow: "02 / LOCALISE",
    title: "Roman Urdu, without the detour.",
    copy: "Local transliteration keeps Hindi and Urdu workflows moving without another paid API in the loop.",
  },
  {
    icon: WandSparkles,
    eyebrow: "03 / DESIGN",
    title: "Make every phrase look intentional.",
    copy: "Choose from 10 caption styles, custom fonts and automatic contrast that responds phrase by phrase.",
  },
  {
    icon: Clapperboard,
    eyebrow: "04 / EXPORT",
    title: "From transcript to final cut.",
    copy: "Download SRT or render a captioned MP4 directly in supported browsers when the edit is ready.",
  },
];

const captionLooks = [
  { label: "PUNCH", text: "MAKE THEM STOP", className: "look-punch" },
  { label: "EDITORIAL", text: "every word / earns its frame", className: "look-editorial" },
  { label: "NEON", text: "STAY IN THE MOMENT", className: "look-neon" },
  { label: "URDU", text: "KAHANI KO / AAGE BARHAO", className: "look-urdu" },
];

export default function Home() {
  return (
    <main className="marketing-shell">
      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Xenvora Digital home">
          <span className="brand-mark" aria-hidden="true"><span /><span /></span>
          <span className="brand-copy">Xenvora Digital <small>by Edit Buddy</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#styles">Styles</a>
          <a href="#workflow">Workflow</a>
        </nav>
        <a className="nav-cta" href={editorUrl}>Open studio <ArrowUpRight size={16} /></a>
      </header>

      <section className="car-story" id="top">
        <div className="car-stage" aria-hidden="true">
          <CreatorRigExperience />
          <div className="stage-vignette" />
          <div className="stage-grid" />
        </div>
        <div className="story-panels">
          <section className="story-panel hero-panel">
            <div className="hero-kicker"><span className="pulse-dot" /> The caption studio for motion-first creators</div>
            <h1>Your story.<span>In motion.</span></h1>
            <p className="hero-copy">Transcribe, style and export scroll-stopping captions from one focused studio. Built for the edit—not the admin around it.</p>
            <div className="hero-actions">
              <a className="primary-cta" href={editorUrl}>Start creating <ArrowUpRight size={18} /></a>
              <a className="text-cta" href="#product">See how it moves <ArrowDown size={17} /></a>
            </div>
            <div className="hero-index" aria-hidden="true"><span>EB / 001</span><span>SCROLL TO DIRECT</span></div>
          </section>

          <section className="story-panel focus-panel focus-right">
            <div className="focus-copy">
              <span className="focus-number">01</span>
              <p className="micro-label">WORD-LEVEL CONTROL</p>
              <h2>Move at the speed of the cut.</h2>
              <p>Word timings arrive ready to refine, so captions can hit the moment instead of chasing it.</p>
            </div>
          </section>

          <section className="story-panel focus-panel focus-left">
            <div className="focus-copy">
              <span className="focus-number">02</span>
              <p className="micro-label">DESIGN WITH INTENT</p>
              <h2>Shift the focus. Keep the voice.</h2>
              <p>Shape each phrase with typography, emphasis and contrast that stays readable over every frame.</p>
            </div>
          </section>

          <section className="story-panel focus-panel focus-final">
            <div className="focus-copy final-copy">
              <span className="focus-number">03</span>
              <p className="micro-label">READY TO SHIP</p>
              <h2>Finish in the same flow.</h2>
              <p>SRT when you need flexibility. Captioned MP4 when you need the final file.</p>
              <a className="primary-cta" href={editorUrl}>Launch the studio <ArrowUpRight size={18} /></a>
            </div>
          </section>
        </div>
      </section>

      <section className="product-section" id="product">
        <div className="section-heading">
          <p className="section-index">PRODUCT / 01</p>
          <h2>One studio. <span>Zero broken flow.</span></h2>
          <p>Xenvora Digital keeps transcription, caption design and delivery close enough to feel like one move.</p>
        </div>
        <div className="feature-grid">
          {featureCards.map(({ icon: Icon, eyebrow, title, copy }) => (
            <article className="feature-card" key={eyebrow}>
              <div className="feature-icon"><Icon size={23} strokeWidth={1.7} /></div>
              <p className="card-eyebrow">{eyebrow}</p>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="card-line" />
            </article>
          ))}
        </div>
      </section>

      <section className="style-section" id="styles">
        <div className="section-heading light-heading">
          <p className="section-index">STYLES / 02</p>
          <h2>Caption like you <span>mean it.</span></h2>
          <p>Four directions from a ten-style toolkit. Your voice decides the rest.</p>
        </div>
        <div className="look-reel" aria-label="Caption style examples">
          {captionLooks.map((look, index) => (
            <article className={`look-card ${look.className}`} key={look.label}>
              <div className="look-topline"><span>0{index + 1}</span><span>{look.label}</span></div>
              <div className="look-frame"><span>{look.text}</span></div>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-section" id="workflow">
        <div className="workflow-intro">
          <p className="section-index">WORKFLOW / 03</p>
          <h2>Three moves from raw clip to ready post.</h2>
          <p>Keep the creative decisions. Lose the repetitive handoffs.</p>
        </div>
        <ol className="workflow-list">
          <li><span className="workflow-number">01</span><div><h3>Drop the clip</h3><p>Bring in your footage and let the studio read the voice.</p></div><Captions size={28} strokeWidth={1.4} /></li>
          <li><span className="workflow-number">02</span><div><h3>Direct the words</h3><p>Refine the transcript, phrasing, typography and emphasis in context.</p></div><Sparkles size={28} strokeWidth={1.4} /></li>
          <li><span className="workflow-number">03</span><div><h3>Ship the story</h3><p>Export subtitles or render the captioned video when the cut is locked.</p></div><Clapperboard size={28} strokeWidth={1.4} /></li>
        </ol>
      </section>

      <section className="closing-cta">
        <div className="closing-orbit orbit-one" /><div className="closing-orbit orbit-two" />
        <p className="section-index">THE NEXT FRAME IS YOURS</p>
        <h2>Make every word<span>impossible to miss.</span></h2>
        <a className="primary-cta large-cta" href={editorUrl}>Open Xenvora <ArrowUpRight size={20} /></a>
      </section>

      <footer className="site-footer">
        <a className="brand" href="#top"><span className="brand-mark" aria-hidden="true"><span /><span /></span><span className="brand-copy">Xenvora Digital <small>by Edit Buddy</small></span></a>
        <p>Caption design and multilingual transcription studio.</p>
        <p className="model-credit">3D model: “Microphone” by ChoboiAssets, licensed under <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">CC BY 4.0</a>.</p>
        <span>© 2026 Xenvora Digital</span>
      </footer>
    </main>
  );
}

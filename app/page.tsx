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
import { getChatGPTUser } from "@/app/chatgpt-auth";
import "./marketing.css";

export const dynamic = "force-dynamic";

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

function initials(value: string) {
  return value.split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "XD";
}

export default async function Home() {
  const user = await getChatGPTUser();
  const editorUrl = user ? "/studio" : "/account";
  return (
    <main className="marketing-shell">
      <header className="site-nav">
        <a className="brand" href="#top" aria-label="Xenvora Digital home">
          <span className="brand-mark" aria-hidden="true"><span /><span /></span>
          <span className="brand-copy">Xenvora Digital <small>by Edit Buddy</small></span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#product">Product</a>
          <a href="#campaign">In action</a>
          <a href="#styles">Styles</a>
          <a href="#workflow">Workflow</a>
        </nav>
        <div className="nav-account">
          {user ? (
            <a className="user-pill" href="/account" aria-label="Open your account">
              <span>{initials(user.displayName)}</span><small>{user.displayName}</small>
            </a>
          ) : <a className="nav-login" href="/account">Sign in</a>}
          <a className="nav-cta" href={editorUrl}>{user ? "Open studio" : "Start free"} <ArrowUpRight size={16} /></a>
        </div>
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

      <section className="campaign-section" id="campaign">
        <div className="campaign-heading">
          <div>
            <p className="section-index">IN ACTION / 02</p>
            <h2>Built for the moment<br /><span>before publish.</span></h2>
          </div>
          <p>From the first take to the final timeline, Xenvora keeps every word close to the creative decision that shaped it.</p>
        </div>

        <div className="campaign-grid">
          <figure className="campaign-frame portrait-frame">
            <img src="/brand/creator-portrait.png" alt="Creator recording in a professional studio" loading="lazy" />
            <div className="frame-shade" />
            <figcaption className="frame-meta"><span>01 / CAPTURE</span><span>VOICE IN FOCUS</span></figcaption>
            <div className="live-caption" aria-hidden="true"><span>MAKE</span><strong>EVERY WORD</strong><span>LAND.</span></div>
          </figure>

          <figure className="campaign-frame rig-frame">
            <img src="/brand/creator-rig.png" alt="Professional microphone, camera and editing controls" loading="lazy" />
            <div className="frame-shade" />
            <figcaption className="frame-meta"><span>02 / DIRECT</span><span>DESIGN THE DELIVERY</span></figcaption>
            <div className="caption-chip" aria-hidden="true"><i /> Automatic contrast</div>
          </figure>

          <figure className="campaign-frame suite-frame">
            <img src="/brand/edit-suite.png" alt="Video editor working in a focused post-production suite" loading="lazy" />
            <div className="frame-shade" />
            <figcaption className="frame-meta"><span>03 / FINISH</span><span>ONE FOCUSED WORKFLOW</span></figcaption>
            <div className="timeline-overlay" aria-hidden="true">
              <span className="playhead" />
              <div><i /><i /><i /><i /></div>
              <small>WORDS / TIMING / STYLE</small>
            </div>
          </figure>
        </div>

        <div className="campaign-marquee" aria-hidden="true">
          <div><span>TRANSCRIBE</span><i /> <span>LOCALISE</span><i /> <span>DESIGN</span><i /> <span>EXPORT</span><i /> <span>TRANSCRIBE</span><i /> <span>LOCALISE</span><i /></div>
        </div>
      </section>

      <section className="style-section" id="styles">
        <div className="section-heading light-heading">
          <p className="section-index">STYLES / 03</p>
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
          <p className="section-index">WORKFLOW / 04</p>
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
        <p className="model-credit">Original campaign imagery created for Xenvora Digital.</p>
        <span>© 2026 Xenvora Digital</span>
      </footer>
    </main>
  );
}

import { ArrowLeft, ArrowUpRight, Check, LockKeyhole, LogOut, Sparkles } from "lucide-react";
import { chatGPTSignInPath, chatGPTSignOutPath, getChatGPTUser } from "@/app/chatgpt-auth";
import "./account.css";

export const dynamic = "force-dynamic";

function initials(value: string) {
  return value.split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "XD";
}

export default async function AccountPage() {
  const user = await getChatGPTUser();
  const signIn = chatGPTSignInPath("/studio");

  return (
    <main className="account-shell">
      <a className="account-brand" href="/" aria-label="Back to Xenvora Digital">
        <span className="account-mark"><i /><i /></span>
        <span>Xenvora Digital <small>by Edit Buddy</small></span>
      </a>

      <section className="account-visual">
        <img src="/brand/creator-portrait.png" alt="Creator recording in the Xenvora studio" />
        <div className="visual-wash" />
        <div className="visual-caption"><small>YOUR WORDS / YOUR WORKSPACE</small><strong>MAKE<br /><em>EVERY WORD</em><br />LAND.</strong></div>
        <div className="secure-note"><LockKeyhole size={15} /> Secure account access</div>
      </section>

      <section className="account-content">
        <a className="back-link" href="/"><ArrowLeft size={15} /> Back to home</a>
        {user ? (
          <div className="member-panel">
            <p className="account-kicker"><span /> ACCOUNT READY</p>
            <h1>Welcome back.<br /><em>Your studio is waiting.</em></h1>
            <div className="profile-card">
              <div className="profile-avatar">{initials(user.displayName)}</div>
              <div><small>SIGNED IN AS</small><strong>{user.displayName}</strong><span>{user.email}</span></div>
              <Check className="profile-check" size={19} />
            </div>
            <a className="account-primary" href="/studio">Open creative studio <ArrowUpRight size={18} /></a>
            <a className="account-secondary" href={chatGPTSignOutPath("/")} target="_top"><LogOut size={15} /> Sign out</a>
          </div>
        ) : (
          <div className="guest-panel">
            <p className="account-kicker"><span /> YOUR CREATIVE SPACE</p>
            <h1>Sign in.<br /><em>Stay in flow.</em></h1>
            <p className="account-intro">One secure account keeps the studio personal and your transcription tools protected.</p>
            <div className="auth-options">
              <article>
                <Sparkles size={22} />
                <div><small>ALREADY CREATING?</small><h2>Welcome back.</h2><p>Continue to your caption workspace.</p></div>
                <a href={signIn} target="_top">Sign in with ChatGPT <ArrowUpRight size={16} /></a>
              </article>
              <article className="signup-card">
                <span className="new-badge">NEW</span>
                <LockKeyhole size={22} />
                <div><small>NEW TO XENVORA?</small><h2>Create your account.</h2><p>Start with secure ChatGPT identity—no separate Xenvora password.</p></div>
                <a href={signIn} target="_top">Create free account <ArrowUpRight size={16} /></a>
              </article>
            </div>
            <p className="auth-footnote"><LockKeyhole size={13} /> Authentication is securely handled by ChatGPT. Xenvora never stores your password.</p>
          </div>
        )}
      </section>
    </main>
  );
}

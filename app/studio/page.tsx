import { ArrowLeft, LogOut } from "lucide-react";
import { chatGPTSignOutPath, requireChatGPTUser } from "@/app/chatgpt-auth";
import "./studio.css";

export const dynamic = "force-dynamic";

function initials(value: string) {
  return value.split(/\s|@/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "XD";
}

export default async function StudioPage() {
  const user = await requireChatGPTUser("/studio");
  return (
    <main className="studio-shell">
      <header className="studio-bar">
        <a href="/" className="studio-back"><ArrowLeft size={16} /> Xenvora Digital</a>
        <span className="studio-state"><i /> Secure studio</span>
        <div className="studio-user"><span>{initials(user.displayName)}</span><small>{user.displayName}</small><a href={chatGPTSignOutPath("/")} target="_top" aria-label="Sign out"><LogOut size={15} /></a></div>
      </header>
      <iframe className="studio-frame" src="/editor/?embedded=1" title="Xenvora caption studio" allow="clipboard-write" />
    </main>
  );
}

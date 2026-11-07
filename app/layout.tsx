import type { Metadata } from 'next';
export const metadata: Metadata = { title: 'Edit Buddy Captions', description: 'Caption design and multilingual transcription studio.' };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body style={{margin:0,background:'#F5F3ED'}}>{children}</body></html>; }

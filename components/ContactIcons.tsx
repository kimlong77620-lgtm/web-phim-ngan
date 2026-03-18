'use client';

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: Array<string>;
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export default function ContactIcons() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const installEvent = e as BeforeInstallPromptEvent;
      installEvent.preventDefault();
      setDeferredPrompt(installEvent);
      setShowInstall(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-4 z-9999">
      {/* NÚT CÀI APP - ICON MŨI TÊN + GẠCH NGANG TỐI GIẢN */}
      {showInstall && (
        <button
          onClick={handleInstall}
          className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-all animate-bounce border-2 border-white"
          title="Cài đặt App Zhaodi"
        >
          {/* Icon SVG: Mũi tên và gạch ngang */}
          <svg 
            width="24" 
            height="24" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="black" 
            strokeWidth="2.5" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M12 5v13M5 12l7 7 7-7M5 21h14" />
          </svg>
        </button>
      )}

      {/* NÚT MESSENGER */}
      <a
        href="https://m.me/YOUR_PAGE_ID"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-[#0084FF] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-white"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" className="w-7 h-7" alt="Messenger" />
      </a>

      {/* NÚT ZALO */}
      <a
        href="https://zalo.me/YOUR_PHONE_NUMBER"
        target="_blank"
        rel="noopener noreferrer"
        className="w-12 h-12 bg-[#0068FF] rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all border-2 border-white"
      >
        <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" className="w-7 h-7" alt="Zalo" />
      </a>
    </div>
  );
}
import { useEffect } from 'react';

export function HubSpotChat() {
  useEffect(() => {
    const portalId = import.meta.env.VITE_HUBSPOT_PORTAL_ID as string | undefined;
    if (!portalId) {
      console.warn('HubSpot portal ID missing. Set VITE_HUBSPOT_PORTAL_ID to enable chat.');
      return;
    }

    const script = document.createElement('script');
    script.src = `https://js.hs-scripts.com/${portalId}.js`;
    script.async = true;
    script.defer = true;
    script.id = 'hs-script-loader';

    if (!document.getElementById('hs-script-loader')) {
      document.head.appendChild(script);
    }

    script.onload = () => {
      try {
        const win = window as Window & { HubSpotConversations?: { widget: { load: (opts: { widgetOpen: boolean; enableWelcomeMessage: boolean; initialMessageDelay: number }) => void } } };
        if (win.HubSpotConversations) {
          win.HubSpotConversations.widget.load({
            widgetOpen: false,
            enableWelcomeMessage: true,
            initialMessageDelay: 3000,
          });
        }
      } catch {
        // ignore
      }
    };

    return () => {
      const existingScript = document.getElementById('hs-script-loader');
      if (existingScript) existingScript.remove();
    };
  }, []);

  return null;
}

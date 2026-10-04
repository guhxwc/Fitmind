import { useEffect } from 'react';

interface EbookFontsAndMetaOptions {
  title: string;
  noindex?: boolean;
}

export function useEbookFontsAndMeta({ title, noindex = false }: EbookFontsAndMetaOptions) {
  useEffect(() => {
    // 1. Update Title
    const prevTitle = document.title;
    document.title = title;

    // 2. Google Fonts link injection
    const FONT_LINK_ID = 'fm-ebook-google-fonts';
    let fontLink = document.getElementById(FONT_LINK_ID) as HTMLLinkElement | null;
    let didAddFont = false;

    if (!fontLink) {
      fontLink = document.createElement('link');
      fontLink.id = FONT_LINK_ID;
      fontLink.rel = 'stylesheet';
      fontLink.href = 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Manrope:wght@400;500;600;700&family=Montserrat:wght@500;800&display=swap';
      document.head.appendChild(fontLink);
      didAddFont = true;
    }

    // 3. Robots meta tag
    let robotsMeta: HTMLMetaElement | null = null;
    let prevRobotsContent: string | null = null;
    let didAddRobots = false;

    if (noindex) {
      robotsMeta = document.querySelector('meta[name="robots"]');
      if (robotsMeta) {
        prevRobotsContent = robotsMeta.getAttribute('content');
        robotsMeta.setAttribute('content', 'noindex');
      } else {
        robotsMeta = document.createElement('meta');
        robotsMeta.setAttribute('name', 'robots');
        robotsMeta.setAttribute('content', 'noindex');
        document.head.appendChild(robotsMeta);
        didAddRobots = true;
      }
    }

    return () => {
      document.title = prevTitle;
      if (didAddFont && fontLink && fontLink.parentNode) {
        fontLink.parentNode.removeChild(fontLink);
      }
      if (noindex && robotsMeta) {
        if (didAddRobots && robotsMeta.parentNode) {
          robotsMeta.parentNode.removeChild(robotsMeta);
        } else if (prevRobotsContent !== null) {
          robotsMeta.setAttribute('content', prevRobotsContent);
        }
      }
    };
  }, [title, noindex]);
}

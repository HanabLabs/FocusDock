'use client';

import { useEffect } from 'react';

export function HideDevIndicator() {
  useEffect(() => {
    // Hide Next.js development indicator
    const hideIndicator = () => {
      // Find and hide the indicator element
      const allDivs = document.querySelectorAll('body > div, body > div > div');
      allDivs.forEach((div) => {
        const htmlElement = div as HTMLElement;
        const style = window.getComputedStyle(htmlElement);
        const rect = htmlElement.getBoundingClientRect();
        const html = htmlElement.outerHTML || '';
        
        // Check if it's the Next.js dev indicator
        // Usually: position fixed, bottom 0 or near bottom, left 0 or near left, small size
        const isFixed = style.position === 'fixed';
        const isNearBottom = parseFloat(style.bottom) <= 20 || rect.bottom >= window.innerHeight - 50;
        const isNearLeft = parseFloat(style.left) <= 20 || rect.left <= 50;
        const isSmall = rect.width < 100 && rect.height < 100;
        
        if (
          isFixed && 
          isNearBottom && 
          isNearLeft && 
          (isSmall || html.includes('N') || html.includes('next'))
        ) {
          htmlElement.style.setProperty('display', 'none', 'important');
          htmlElement.style.setProperty('visibility', 'hidden', 'important');
          htmlElement.style.setProperty('opacity', '0', 'important');
          htmlElement.style.setProperty('pointer-events', 'none', 'important');
        }
      });
    };

    // Hide immediately
    if (typeof window !== 'undefined') {
      hideIndicator();

      // Also hide after delays (in case it's added dynamically)
      const timeouts = [50, 100, 200, 500, 1000].map(delay => 
        setTimeout(hideIndicator, delay)
      );

      // Watch for new elements being added
      const observer = new MutationObserver(() => {
        hideIndicator();
      });
      
      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style'],
      });

      return () => {
        timeouts.forEach(clearTimeout);
        observer.disconnect();
      };
    }
  }, []);

  return null;
}


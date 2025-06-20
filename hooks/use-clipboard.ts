import { useState, useEffect } from 'react';

export const useClipboard = () => {
  const [clipboardUrl, setClipboardUrl] = useState<string | null>(null);
  const [showClipboardSuggestion, setShowClipboardSuggestion] = useState(false);

  useEffect(() => {
    const checkClipboard = async () => {
      try {
        // Check if clipboard API is available
        if (navigator.clipboard && navigator.clipboard.readText) {
          const text = await navigator.clipboard.readText();
          
          // Simple URL validation
          const urlPattern = /^https?:\/\/.+/;
          if (urlPattern.test(text.trim())) {
            setClipboardUrl(text.trim());
            setShowClipboardSuggestion(true);
          } else {
            setClipboardUrl(null);
            setShowClipboardSuggestion(false);
          }
        }
      } catch (error) {
        // Clipboard access might be denied or not available
        // Don't log this error as it's expected in many cases
      }
    };

    // Check clipboard when component mounts
    checkClipboard();

    // Set up periodic checking (every 5 seconds instead of 2)
    const interval = setInterval(checkClipboard, 5000);

    // Listen for focus events to check clipboard when user focuses on the page
    const handleFocus = () => {
      // Add a small delay to avoid checking immediately on focus
      setTimeout(checkClipboard, 100);
    };

    // Listen for paste events to check clipboard
    const handlePaste = () => {
      setTimeout(checkClipboard, 100);
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('paste', handlePaste);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('paste', handlePaste);
    };
  }, []);

  const hideSuggestion = () => {
    setShowClipboardSuggestion(false);
  };

  const getClipboardUrl = () => {
    return clipboardUrl;
  };

  return {
    showClipboardSuggestion,
    clipboardUrl,
    hideSuggestion,
    getClipboardUrl
  };
}; 
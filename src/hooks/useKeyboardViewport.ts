import { useState, useEffect, useRef, useCallback } from 'react';

export interface KeyboardViewportState {
  viewportHeight: number;
  isKeyboardOpen: boolean;
  keyboardHeight: number;
  dismissKeyboard: () => void;
}

export function useKeyboardViewport(): KeyboardViewportState {
  const [viewportHeight, setViewportHeight] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.visualViewport) {
      return window.visualViewport.height;
    }
    return typeof window !== 'undefined' ? window.innerHeight : 800;
  });

  const [isKeyboardOpen, setIsKeyboardOpen] = useState<boolean>(false);
  const [keyboardHeight, setKeyboardHeight] = useState<number>(0);

  const baselineHeightRef = useRef<number>(
    typeof window !== 'undefined'
      ? window.visualViewport
        ? window.visualViewport.height
        : window.innerHeight
      : 800
  );

  const dismissKeyboard = useCallback(() => {
    if (typeof document !== 'undefined' && document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const vv = window.visualViewport;

    const checkViewport = () => {
      const currentHeight = vv ? vv.height : window.innerHeight;
      setViewportHeight(currentHeight);

      // Check if an editable element is currently focused
      const activeEl = document.activeElement;
      const isInputFocused =
        !!activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          activeEl.getAttribute('contenteditable') === 'true' ||
          activeEl.classList.contains('inputarea')); // Monaco editor textarea

      // Only update baseline when no input is focused (e.g. orientation changes)
      if (!isInputFocused && currentHeight > baselineHeightRef.current) {
        baselineHeightRef.current = currentHeight;
      }

      const heightDiff = baselineHeightRef.current - currentHeight;

      // Virtual keyboards typically consume > 120px
      if (heightDiff > 120 && isInputFocused) {
        setIsKeyboardOpen(true);
        setKeyboardHeight(heightDiff);
      } else if (heightDiff <= 80 || !isInputFocused) {
        setIsKeyboardOpen(false);
        setKeyboardHeight(0);
      }
    };

    if (vv) {
      vv.addEventListener('resize', checkViewport);
      vv.addEventListener('scroll', checkViewport);
    } else {
      window.addEventListener('resize', checkViewport);
    }

    const handleFocusIn = () => {
      setTimeout(checkViewport, 100);
      setTimeout(checkViewport, 300);
    };

    const handleFocusOut = () => {
      setTimeout(() => {
        const activeEl = document.activeElement;
        const stillFocused =
          !!activeEl &&
          (activeEl.tagName === 'INPUT' ||
            activeEl.tagName === 'TEXTAREA' ||
            activeEl.classList.contains('inputarea'));
        if (!stillFocused) {
          setIsKeyboardOpen(false);
          setKeyboardHeight(0);
          if (vv) setViewportHeight(vv.height);
        }
      }, 100);
    };

    window.addEventListener('focusin', handleFocusIn);
    window.addEventListener('focusout', handleFocusOut);

    // Initial check
    checkViewport();

    return () => {
      if (vv) {
        vv.removeEventListener('resize', checkViewport);
        vv.removeEventListener('scroll', checkViewport);
      } else {
        window.removeEventListener('resize', checkViewport);
      }
      window.removeEventListener('focusin', handleFocusIn);
      window.removeEventListener('focusout', handleFocusOut);
    };
  }, []);

  return {
    viewportHeight,
    isKeyboardOpen,
    keyboardHeight,
    dismissKeyboard,
  };
}

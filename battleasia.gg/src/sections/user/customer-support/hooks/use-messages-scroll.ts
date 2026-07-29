import { useRef, useEffect, useCallback } from 'react';

// ----------------------------------------------------------------------

type ScrollMessage = {
  id: string;
};

export type UseMessagesScrollReturn = {
  messagesEndRef: React.RefObject<HTMLDivElement>;
};

export function useMessagesScroll(messages: ScrollMessage[]): UseMessagesScrollReturn {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    if (!messages || !messagesEndRef.current) {
      return;
    }

    // Find the scrollable parent (SimpleBar's content-wrapper)
    let element: HTMLElement | null = messagesEndRef.current;
    
    // Traverse up to find the simplebar-content-wrapper
    while (element && element.parentElement) {
      element = element.parentElement;
      if (element.classList.contains('simplebar-content-wrapper')) {
        element.scrollTop = element.scrollHeight;
        return;
      }
    }

    // Fallback: try to find any scrollable parent
    element = messagesEndRef.current.parentElement;
    while (element) {
      const overflowY = window.getComputedStyle(element).overflowY;
      if (overflowY === 'auto' || overflowY === 'scroll') {
        element.scrollTop = element.scrollHeight;
        return;
      }
      element = element.parentElement;
    }
  }, [messages]);

  useEffect(
    () => {
      // Use setTimeout to ensure DOM is updated
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);

      return () => clearTimeout(timer);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [messages]
  );

  return { messagesEndRef };
}


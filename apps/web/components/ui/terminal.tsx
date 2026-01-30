'use client';

import type { ReactElement, ReactNode } from 'react';
import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { cn } from '@/lib/utils';

interface TerminalProps {
  children: ReactNode;
  className?: string;
  sequence?: boolean;
  startOnView?: boolean;
  loop?: boolean;
  loopDelay?: number;
}

interface AnimatedSpanProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  startOnView?: boolean;
  onComplete?: () => void;
  shouldStart?: boolean;
}

interface TypingAnimationProps {
  children: string;
  className?: string;
  duration?: number;
  delay?: number;
  as?: React.ElementType;
  startOnView?: boolean;
  onComplete?: () => void;
  shouldStart?: boolean;
}

export function Terminal({
  children,
  className,
  sequence = true,
  startOnView = true,
  loop = false,
  loopDelay = 2000,
}: TerminalProps) {
  const [isInView, setIsInView] = useState(!startOnView);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cycleKey, setCycleKey] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const childArray = Children.toArray(children);
  const totalChildren = childArray.length;

  useEffect(() => {
    if (!startOnView) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [startOnView]);

  const handleComplete = useCallback(() => {
    setCurrentIndex((prev) => {
      const next = prev + 1;
      if (loop && next >= totalChildren) {
        setTimeout(() => {
          setCurrentIndex(0);
          setCycleKey((k) => k + 1);
        }, loopDelay);
      }
      return next;
    });
  }, [loop, totalChildren, loopDelay]);

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-xl border border-border bg-card p-4 font-mono text-sm flex flex-col',
        className
      )}
    >
      <div className="flex items-center gap-2 mb-4 flex-shrink-0">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
      </div>
      <div className="space-y-1.5 flex-1">
        {childArray.map((child, index) => {
          if (!isValidElement(child)) return child;

          const shouldStart = !sequence || (isInView && index <= currentIndex);
          const isCurrentlyAnimating = sequence && index === currentIndex;

          return cloneElement(
            child as ReactElement<AnimatedSpanProps | TypingAnimationProps>,
            {
              key: `${cycleKey}-${index}`,
              shouldStart,
              onComplete: isCurrentlyAnimating ? handleComplete : undefined,
            }
          );
        })}
      </div>
    </div>
  );
}

export function AnimatedSpan({
  children,
  className,
  delay = 0,
  onComplete,
  shouldStart = true,
}: AnimatedSpanProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!shouldStart) {
      setIsVisible(false);
      return;
    }

    const timer = setTimeout(() => {
      setIsVisible(true);
      onComplete?.();
    }, delay + 500);

    return () => clearTimeout(timer);
  }, [shouldStart, delay, onComplete]);

  return (
    <div
      className={cn(
        'transition-opacity duration-300',
        shouldStart && isVisible ? 'opacity-100' : 'opacity-0',
        className
      )}
    >
      {children}
    </div>
  );
}

export function TypingAnimation({
  children,
  className,
  duration = 60,
  delay = 0,
  as: Component = 'span',
  onComplete,
  shouldStart = true,
}: TypingAnimationProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    if (!shouldStart) {
      setDisplayedText('');
      setIsStarted(false);
      return;
    }

    const startTimer = setTimeout(() => {
      setIsStarted(true);
    }, delay);

    return () => clearTimeout(startTimer);
  }, [shouldStart, delay]);

  useEffect(() => {
    if (!isStarted) return;

    let currentIndex = 0;
    const text = children;

    const interval = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayedText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(interval);
        onComplete?.();
      }
    }, duration);

    return () => clearInterval(interval);
  }, [isStarted, children, duration, onComplete]);

  return (
    <Component
      className={cn('inline-block', shouldStart ? 'opacity-100' : 'opacity-0', className)}
    >
      {displayedText}
      {isStarted && displayedText.length < children.length && (
        <span className="animate-pulse">▋</span>
      )}
    </Component>
  );
}

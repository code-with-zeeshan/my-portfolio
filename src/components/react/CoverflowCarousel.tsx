// src/components/react/CoverflowCarousel.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface CoverflowItem {
  id: string;
  title: string;
  description?: string;
  image_url?: string | null;
  tags?: string[];
  year?: string | null;
  outcome?: string | null;
  live_url?: string | null;
  github_url?: string | null;
  featured?: boolean;
  sort_order?: number;
}

interface CoverflowCarouselProps {
  items: CoverflowItem[];
  renderItem?: (item: CoverflowItem, isActive: boolean) => React.ReactNode;
}

export default function CoverflowCarousel({
  items,
  renderItem,
}: CoverflowCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isTouching, setIsTouching] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

  const totalItems = items.length;

  // Auto-advance every 3 seconds - pauses on touch
  useEffect(() => {
    const startAutoPlay = () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % totalItems);
      }, 3000);
    };

    const stopAutoPlay = () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
    };

    if (!isTouching) {
      startAutoPlay();
    } else {
      stopAutoPlay();
    }

    return () => stopAutoPlay();
  }, [isTouching, totalItems]);

  const goToSlide = useCallback((index: number) => {
    if (isAnimating || index === currentIndex) return;
    setIsAnimating(true);
    setCurrentIndex(index);
    setTimeout(() => setIsAnimating(false), 500);
  }, [isAnimating, currentIndex]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTouching(true);
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        goToSlide((currentIndex + 1) % totalItems);
      } else {
        goToSlide((currentIndex - 1 + totalItems) % totalItems);
      }
    }

    touchStartX.current = 0;
    touchEndX.current = 0;
    // Resume auto-play after 2 seconds of no touch
    setTimeout(() => setIsTouching(false), 2000);
  };

  if (totalItems === 0) return null;
  if (totalItems === 1 && renderItem) {
    return (
      <div className="relative w-full max-w-sm mx-auto">
        {renderItem(items[0], true)}
      </div>
    );
  }
  if (totalItems === 1) {
    return null;
  }

  const getVisibleItems = () => {
    const prevIndex = (currentIndex - 1 + totalItems) % totalItems;
    const nextIndex = (currentIndex + 1) % totalItems;
    
    return [
      { index: prevIndex, position: -1 as const },
      { index: currentIndex, position: 0 as const },
      { index: nextIndex, position: 1 as const },
    ];
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full pt-6 md:pt-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D Coverflow Container */}
      <div className="relative flex items-center justify-center h-[460px] md:h-[500px] perspective-1000 overflow-visible">
        {getVisibleItems().map(({ index, position }) => {
          const item = items[index];
          const isActive = position === 0;
          const isPrev = position === -1;
          const isNext = position === 1;

          const transformStyle = isActive 
            ? `translateX(0) scale(1) rotateY(0deg) translateZ(0px)`
            : isPrev 
              ? `translateX(-100px) scale(0.8) rotateY(20deg) translateZ(-50px)`
              : `translateX(100px) scale(0.8) rotateY(-20deg) translateZ(-50px)`;

          return (
            <div
              key={`coverflow-${item.id}`}
              className={`absolute transition-all duration-500 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] h-full ${
                isActive ? "z-30" : "z-10"
              }`}
              style={{
                transform: transformStyle,
                opacity: isActive ? 1 : 0.5,
                filter: isActive ? "blur(0px)" : "blur(2px)",
                width: "280px", // Wider rectangular card
                transformOrigin: isPrev ? "90% center" : isNext ? "10% center" : "center center",
              }}
              onClick={() => {
                if (!isActive) {
                  goToSlide(index);
                }
              }}
            >
              {renderItem ? renderItem(item, isActive) : (
                <div className="text-center text-zinc-500">No render function</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dots Indicator - spacing */}
      <div className="flex items-center justify-center gap-2 mt-15 md:mt-10">
        {items.map((item, i) => (
          <button
            key={`dot-${item.id}`}
            onClick={() => goToSlide(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentIndex ? "w-6 bg-brand-500" : "w-2 bg-zinc-300 dark:bg-zinc-600"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>

      {/* Hint text - spacing */}
      <div className="mt-4 md:mt-3 text-center text-xs text-zinc-400">
        Swipe to browse Feature Projects
      </div>
    </div>
  );
}
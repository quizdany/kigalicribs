"use client";

import Image from 'next/image';
import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PropertyGalleryProps {
  photos: string[];
  altText: string;
}

const variants = {
  enter: (direction: number) => {
    return {
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
  center: {
    zIndex: 1,
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => {
    return {
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
    };
  },
};

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
  return Math.abs(offset) * velocity;
};


export default function PropertyGallery({ photos, altText }: PropertyGalleryProps) {
  const [[page, direction], setPage] = useState([0, 0]);

  const imageIndex = ((page % photos.length) + photos.length) % photos.length;


  const paginate = (newDirection: number) => {
    setPage([page + newDirection, newDirection]);
  };

  if (!photos || photos.length === 0) {
    return (
      <div className="aspect-video bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        No photos available.
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg shadow-xl bg-muted">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={page}
          className="absolute inset-0 w-full h-full"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
        >
        <Image
          src={photos[imageIndex]}
          alt={`${altText} - Photo ${imageIndex + 1}`}
          layout="fill"
          objectFit="cover"
          className="pointer-events-none"
          priority={imageIndex === 0}
          data-ai-hint="property interior"
        />
        </motion.div>
      </AnimatePresence>
      
      {photos.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 rounded-full h-10 w-10"
            onClick={() => paginate(-1)}
            aria-label="Previous image"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-background/50 hover:bg-background/80 rounded-full h-10 w-10"
            onClick={() => paginate(1)}
            aria-label="Next image"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex space-x-2">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setPage([i, i > imageIndex ? 1 : -1])}
                className={cn(
                  "h-2 w-2 rounded-full bg-white/50 transition-all",
                  i === imageIndex ? "w-4 bg-white" : "hover:bg-white/80"
                )}
                aria-label={`Go to image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

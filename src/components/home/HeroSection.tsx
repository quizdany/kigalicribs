
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import TranslatableText from '@/components/shared/TranslatableText';

const HeroSection = () => {
  return (
    <section className="relative py-20 md:py-32 bg-gradient-to-br from-primary/10 via-background to-background">
      <div className="absolute inset-0 opacity-50">
      </div>
      <div className="container relative mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-headline text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl">
            <TranslatableText>Find Your Perfect</TranslatableText> <span className="text-primary"><TranslatableText>Home</TranslatableText></span> <TranslatableText>in Rwanda</TranslatableText>
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
            <TranslatableText>Cribs Ink connects you with the best rental properties across Kigali and beyond. Start your search today for a seamless and trustworthy experience.</TranslatableText>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <div className="relative w-full max-w-md">
            <Input
              type="search"
              placeholder="Search by location, e.g., Kiyovu, Nyarutarama..."
              className="h-12 pl-10 pr-4 text-lg rounded-lg shadow-md"
              aria-label="Search properties"
            />
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </div>
          <Button size="lg" className="h-12 text-lg rounded-lg shadow-md" asChild>
            <Link href="/search">
              <TranslatableText>Search Properties</TranslatableText> <ChevronRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16"
        >
          <Image 
            src="https://www.blackpast.org/wp-content/uploads/2024/08/Kigali_Convention_Centre_December_1_2018_Courtesy_Raddison__CC_BY-SA_40.jpg" 
            alt="Kigali Convention Centre and city skyline at night"
            width={1024}
            height={356}
            className="rounded-xl shadow-2xl mx-auto"
            data-ai-hint="kigali convention night"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;


'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import TranslatableText from '@/components/shared/TranslatableText';

const CallToActionSection = () => {
  return (
    <section className="py-16 md:py-24 bg-primary/10">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            <TranslatableText>Ready to Find Your</TranslatableText> <span className="text-primary"><TranslatableText>Dream Property</TranslatableText></span>?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-xl mx-auto">
            <TranslatableText>Join Kigali Cribs today. Whether you're looking for a new home or listing your property, we're here to help.</TranslatableText>
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="text-lg" asChild>
              <Link href="/search">
                <TranslatableText>Start Searching</TranslatableText> <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg" asChild>
              <Link href="/list-property">
                <TranslatableText>List Your Property</TranslatableText>
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CallToActionSection;

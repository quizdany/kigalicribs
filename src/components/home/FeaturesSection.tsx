'use client';
import { Lightbulb, MapPin, FileText, BadgePercent, UserCheck, Home } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';

const features = [
  {
    icon: <Home className="h-8 w-8 text-primary" />,
    title: 'Extensive Listings',
    description: 'Access a wide variety of properties, from cozy apartments to spacious family homes and commercial spaces.',
  },
  {
    icon: <MapPin className="h-8 w-8 text-primary" />,
    title: 'Smart Search & Map View',
    description: 'Easily find properties with advanced filters and an interactive map view of Kigali.',
  },
  {
    icon: <Lightbulb className="h-8 w-8 text-primary" />,
    title: 'Fair Price Indicator',
    description: 'Make informed decisions with our AI-powered tool that shows market-rate badges on listings.',
  },
  {
    icon: <BadgePercent className="h-8 w-8 text-primary" />,
    title: 'AI Match Score',
    description: 'Discover how well a property fits your needs with a personalized AI-generated match score.',
  },
  {
    icon: <UserCheck className="h-8 w-8 text-primary" />,
    title: 'User-Friendly Profiles',
    description: 'Create your tenant profile quickly to save preferences and get matched with ideal properties.',
  },
  {
    icon: <FileText className="h-8 w-8 text-primary" />,
    title: 'Digital Lease Agreements',
    description: 'Securely sign lease agreements digitally, with multilingual support (English, French, Kinyarwanda).',
  },
];

const FeaturesSection = () => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="font-headline text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose <span className="text-primary">Tura Neza</span>?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            We provide a comprehensive suite of tools to make your property rental journey smooth and secure.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.custom
              key={feature.title}
              custom={index}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
              variants={cardVariants}
              className="h-full"
            >
              <Card className="h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 bg-card">
                <CardHeader className="flex flex-row items-center space-x-4 pb-2">
                  {feature.icon}
                  <CardTitle className="font-headline text-xl text-primary">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.custom>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;

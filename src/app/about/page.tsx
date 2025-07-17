import { Users, Home, Lightbulb, Globe2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AboutPage() {
  return (
    <div className="container mx-auto py-16 px-4 max-w-3xl">
      <Card className="mb-8 shadow-xl">
        <CardHeader>
          <CardTitle className="text-4xl font-headline mb-2">
            <span className="text-foreground font-light">About </span>
            <span className="text-primary font-extrabold">Kigali Cribs</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg mb-4 text-justify">
            <span className="font-bold text-primary">Kigali Cribs</span> is redefining the way Rwandans find and list properties. We bridge the gap between tenants and landlords with a platform built on trust, transparency, and innovation. Our mission is to simplify every step of your housing journey—making it smarter, more secure, and empowering you to make truly informed decisions. Whether you’re searching for your dream home or listing a property, Kigali Cribs is your trusted partner for a seamless experience.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div className="flex items-start gap-4">
              <Home className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg mb-1 text-primary">Our Vision</h3>
                <p className="text-gray-600 text-justify">To empower every Rwandan to find their perfect home or tenant, powered by technology and local expertise.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Lightbulb className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg mb-1 text-primary">Smart Features</h3>
                <p className="text-gray-600 text-justify">AI-powered price indicators, digital lease agreements, and fair match scoring help you make informed decisions.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Globe2 className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg mb-1 text-primary">Local Focus</h3>
                <p className="text-gray-600 text-justify">We blend global best practices with deep knowledge of Rwandan neighborhoods and housing trends.</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <Users className="h-8 w-8 text-primary" />
              <div>
                <h3 className="font-semibold text-lg mb-1 text-primary">Our Team</h3>
                <p className="text-gray-600 text-justify">A passionate group of technologists, real estate experts, and community advocates dedicated to your success.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="text-center text-muted-foreground mt-8">
        <p>Have questions or want to partner with us? <a href="/contact" className="text-primary underline">Contact us</a> anytime!</p>
      </div>
    </div>
  );
} 
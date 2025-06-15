import { Map } from 'lucide-react';
import Image from 'next/image';

const MapViewPlaceholder = () => {
  return (
    <div className="h-[500px] w-full bg-muted rounded-lg shadow-lg flex flex-col items-center justify-center text-muted-foreground p-6 relative overflow-hidden">
       <Image 
            src="https://placehold.co/800x500.png" 
            alt="Kigali map placeholder"
            layout="fill"
            objectFit="cover"
            className="opacity-30"
            data-ai-hint="map kigali"
        />
      <div className="relative z-10 text-center">
        <Map className="h-16 w-16 mb-4 text-primary" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Interactive Map Coming Soon!</h3>
        <p className="text-sm">
          Visualize property locations across Kigali. This feature is currently under development.
        </p>
      </div>
    </div>
  );
};

export default MapViewPlaceholder;

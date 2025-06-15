import Link from 'next/link';
import { Home } from 'lucide-react'; // Or a custom SVG logo

const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeConfig = {
    sm: {
      text: 'text-2xl',
      icon: 'h-6 w-6',
    },
    md: {
      text: 'text-3xl',
      icon: 'h-7 w-7',
    },
    lg: {
      text: 'text-4xl',
      icon: 'h-8 w-8',
    },
  };

  const currentSizeConfig = sizeConfig[size] || sizeConfig.md;

  return (
    <Link href="/" className="flex items-center space-x-2">
      {/* Replace with actual SVG logo if available */}
      <Home className={`text-primary ${currentSizeConfig.icon}`} />
      <span className={`font-headline font-extrabold ${currentSizeConfig.text} text-primary`}>
        Tura Neza
      </span>
    </Link>
  );
};

export default Logo;

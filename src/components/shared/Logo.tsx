import Link from 'next/link';
import { Home } from 'lucide-react'; // Or a custom SVG logo

const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeClasses = {
    sm: 'text-xl',
    md: 'text-2xl',
    lg: 'text-3xl',
  };

  return (
    <Link href="/" className="flex items-center space-x-2">
      {/* Replace with actual SVG logo if available */}
      <Home className={`text-primary ${size === 'lg' ? 'h-8 w-8' : 'h-6 w-6'}`} />
      <span className={`font-bold ${sizeClasses[size]} text-primary`}>
        Tura Neza
      </span>
    </Link>
  );
};

export default Logo;

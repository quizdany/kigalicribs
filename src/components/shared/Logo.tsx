
import Link from 'next/link';
import Image from 'next/image';

const Logo = ({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) => {
  const sizeConfig = {
    sm: {
      icon: 'w-12 h-12', // 48x48
      text: 'text-xl', // larger for more vertical length
      line: 'leading-none', // even tighter
    },
    md: {
      icon: 'w-16 h-16', // 64x64
      text: 'text-2xl',
      line: 'leading-none',
    },
    lg: {
      icon: 'w-20 h-20', // 80x80
      text: 'text-3xl',
      line: 'leading-none',
    },
  };

  const currentSizeConfig = sizeConfig[size] || sizeConfig.md;

  return (
    <Link href="/" className="flex items-center">
      {/* KIGALICRIBS Logo Image */}
      <div className={`relative ${currentSizeConfig.icon} flex-shrink-0 bg-transparent`} style={{marginLeft: 0, marginRight: 0, padding: 0}}>
        <Image
          src="/logo.png"
          alt="KIGALICRIBS Logo"
          fill
          className="object-contain mix-blend-multiply"
          priority
          sizes="80px"
          style={{
            filter: 'contrast(1.2) brightness(1.1)',
          }}
        />
      </div>
      <span className={`font-extrabold ${currentSizeConfig.text} ${currentSizeConfig.line} text-primary tracking-tight`} style={{fontStretch: 'extra-expanded', marginLeft: 0, paddingLeft: 0}}>
        KIGALICRIBS
      </span>
    </Link>
  );
};

export default Logo;

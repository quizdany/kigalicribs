import Link from 'next/link';
import { siteConfig } from '@/config/site';
import Logo from '@/components/shared/Logo';

const Footer = () => {
  return (
    <footer className="bg-secondary/50 text-secondary-foreground">
      <div className="container py-12 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 w-full max-w-4xl mx-auto">
          <div className="min-w-[180px] flex flex-col items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary text-left">Navigation</h3>
            <div className="mt-4 flex flex-col space-y-2 text-left">
              {siteConfig.mainNav.filter(item => item.href !== '/register' && item.href !== '/login').map((item) => (
                <div key={item.title}>
                  <Link href={item.href} className="text-sm text-gray-600 hover:text-primary">
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-[180px] flex flex-col items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary text-left">Legal</h3>
            <div className="mt-4 flex flex-col space-y-2 text-left">
              {siteConfig.footerNav.filter(item => item.title !== 'Privacy Policy').map((item) => (
                <div key={item.title}>
                  <Link href={item.href} className="text-sm text-gray-600 hover:text-primary">
                    {item.title}
                  </Link>
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-[180px] flex flex-col items-start">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary text-left">Connect</h3>
            <div className="mt-4 flex flex-col space-y-2 text-left">
              <a href="https://instagram.com/cribsink" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-primary transition-colors">Instagram</a>
              <a href="https://facebook.com/cribsink" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-primary transition-colors">Facebook</a>
              <a href="https://x.com/kigalicribs" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-primary transition-colors">Twitter (X)</a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 w-full flex justify-center">
          <p className="text-sm text-muted-foreground text-center w-full">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

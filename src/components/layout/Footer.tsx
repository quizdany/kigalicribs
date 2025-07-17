import Link from 'next/link';
import { siteConfig } from '@/config/site';
import Logo from '@/components/shared/Logo';

const Footer = () => {
  return (
    <footer className="bg-secondary/50 text-secondary-foreground">
      <div className="container py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="pl-16">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Navigation</h3>
            <ul role="list" className="mt-4 space-y-2">
              {siteConfig.mainNav.filter(item => item.href !== '/register' && item.href !== '/login').map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className="text-sm text-gray-600 hover:text-primary">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="pl-16">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Legal</h3>
            <ul role="list" className="mt-4 space-y-2">
              {siteConfig.footerNav.filter(item => item.title !== 'Privacy Policy').map((item) => (
                <li key={item.title}>
                  <Link href={item.href} className="text-sm text-gray-600 hover:text-primary">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="pl-16">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">Connect</h3>
            <div className="mt-4 flex flex-col space-y-2">
              <a href="https://instagram.com/cribsink" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-primary transition-colors">Instagram</a>
              <a href="https://facebook.com/cribsink" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-primary transition-colors">Facebook</a>
              <a href="https://x.com/kigalicribs" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-600 hover:text-primary transition-colors">Twitter (X)</a>
            </div>
          </div>
        </div>
        <div className="mt-12 border-t border-border pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

'use client';

import Link from 'next/link';
import { Menu, LogIn, UserPlus, UserCircle, LogOut, Languages } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { siteConfig } from '@/config/site';
import Logo from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu";
import { useLanguage } from '@/contexts/LanguageContext';
import type { Language } from '@/types';

const Header = () => {
  const { data: session, status } = useSession();
  const { selectedLanguage, setSelectedLanguage, supportedLanguages } = useLanguage();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleLanguageChange = (langCode: string) => {
    const language = supportedLanguages.find(l => l.code === langCode);
    if (language) {
      setSelectedLanguage(language);
    }
  };

  const isAuthenticated = status === 'authenticated';

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-0 m-0">
      <div className="flex w-full h-20 items-center justify-between p-0 m-0 relative">
        <div className="pl-0 ml-0 flex items-center">
          <Logo size="lg" />
        </div>
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          {siteConfig.mainNav
            .filter(item => item.href !== '/register' && item.href !== '/login')
            .map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.title}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="focus:outline-none focus:ring-0">
                <Languages className="h-5 w-5 mr-1" />
                {selectedLanguage.code.toUpperCase()}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={selectedLanguage.code} onValueChange={handleLanguageChange}>
                {supportedLanguages.map((lang) => (
                  <DropdownMenuRadioItem key={lang.code} value={lang.code}>
                    {lang.name}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{session?.user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground capitalize">{session?.user?.role}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                {session?.user?.role === 'landlord' && (
                  <DropdownMenuItem asChild>
                    <Link href="/list-property">List Property</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild>
                   <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden md:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" /> Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/register">
                  <UserPlus className="mr-2 h-4 w-4" /> Register
                </Link>
              </Button>
            </div>
          )}

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-4 mt-8">
                  {siteConfig.mainNav.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-lg font-medium transition-colors hover:text-primary"
                    >
                      {item.title}
                    </Link>
                  ))}
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                       <Button variant="outline" className="w-full text-lg py-6 justify-start">
                        <Languages className="mr-2 h-5 w-5" /> {selectedLanguage.name}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[calc(100vw-4rem)] max-w-[250px] sm:max-w-[350px]">
                      <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={selectedLanguage.code} onValueChange={handleLanguageChange}>
                        {supportedLanguages.map((lang: Language) => (
                          <DropdownMenuRadioItem key={lang.code} value={lang.code} className="text-lg py-3">
                            {lang.name}
                          </DropdownMenuRadioItem>
                        ))}
                      </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {!isAuthenticated && (
                    <>
                      <Button variant="outline" asChild className="w-full text-lg py-6">
                        <Link href="/login"><LogIn className="mr-2 h-5 w-5" />Login</Link>
                      </Button>
                       <Button asChild className="w-full text-lg py-6">
                        <Link href="/register"><UserPlus className="mr-2 h-5 w-5" />Register</Link>
                      </Button>
                    </>
                  )}
                  {isAuthenticated && (
                    <>
                      <Button variant="outline" asChild className="w-full text-lg py-6">
                        <Link href="/dashboard">Dashboard</Link>
                      </Button>
                      <Button variant="outline" asChild className="w-full text-lg py-6">
                        <Link href="/profile">My Profile</Link>
                      </Button>
                      {session?.user?.role === 'landlord' && (
                        <Button variant="outline" asChild className="w-full text-lg py-6">
                          <Link href="/list-property">List Property</Link>
                        </Button>
                      )}
                      <Button variant="destructive" onClick={handleLogout} className="w-full text-lg py-6">
                        <LogOut className="mr-2 h-5 w-5" />Logout
                      </Button>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

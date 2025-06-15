
'use client';

import Link from 'next/link';
import { Menu, LogIn, UserPlus, UserCircle, LogOut, Languages } from 'lucide-react';
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
import { useState, useEffect } from 'react';

type Language = {
  code: string;
  name: string;
};

const supportedLanguages: Language[] = [
  { code: 'EN', name: 'English' },
  { code: 'FR', name: 'Français' },
  { code: 'RW', name: 'Kinyarwanda' },
];

const Header = () => {
  // Mock authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(supportedLanguages[0].code);

  // Simulate auth check
  useEffect(() => {
    // In a real app, you'd check auth status here (e.g., from a context or service)
    const loggedIn = Math.random() > 0.5; // Simulate login
    setIsAuthenticated(loggedIn);
    if (loggedIn) {
      setUserName("Demo User");
    }
  }, []);


  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName(null);
    // Add actual logout logic here
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {siteConfig.mainNav
            .filter(item => item.href !== '/register' && item.href !== '/login') // Filter out auth links handled separately
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
                {selectedLanguage}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Select Language</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage}>
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
                    <p className="text-sm font-medium leading-none">{userName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {/* user.email - if available */}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                   <Link href="/my-listings">My Listings</Link>
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

          {/* Mobile Menu */}
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
                        <Languages className="mr-2 h-5 w-5" /> {supportedLanguages.find(l => l.code === selectedLanguage)?.name || selectedLanguage}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[250px] sm:w-[350px]">
                      <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuRadioGroup value={selectedLanguage} onValueChange={setSelectedLanguage}>
                        {supportedLanguages.map((lang) => (
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

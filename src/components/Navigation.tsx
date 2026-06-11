'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navItems = [
  { href: '/', label: 'Home', icon: '🏠' },
  { href: '/study', label: 'Study', icon: '📚' },
  { href: '/cases', label: 'Cases', icon: '🏥' },
  { href: '/exam', label: 'Exam', icon: '📋' },
  { href: '/chat', label: 'Chat', icon: '💬' },
];

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg border-t border-pink-100 safe-area-pb">
      <div className="flex justify-around items-center max-w-lg mx-auto h-16">
        {navItems.map(item => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${
                isActive
                  ? 'text-pink-600 scale-110'
                  : 'text-gray-400 hover:text-pink-400'
              }`}
            >
              <span className="text-xl mb-0.5">{item.icon}</span>
              <span className="text-[10px] font-heading font-semibold">{item.label}</span>
              {isActive && (
                <div className="absolute top-1 w-8 h-1 bg-pink-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

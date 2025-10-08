'use client';

import { cn } from '@/lib/utils';
import Image from 'next/image';

interface UserAvatarsProps {
  className?: string;
}

export default function UserAvatars({ className }: UserAvatarsProps) {
  const avatars = [
    { src: '/images/avatars/female1.webp', alt: 'User 1' },
    { src: '/images/avatars/male1.webp', alt: 'User 2' },
    { src: '/images/avatars/female2.webp', alt: 'User 3' },
    { src: '/images/avatars/male2.webp', alt: 'User 4' },
    { src: '/images/avatars/female3.webp', alt: 'User 5' },
  ];

  return (
    <div
      className={cn(
        'flex flex-col sm:flex-row items-center justify-center gap-4 mt-8',
        className
      )}
    >
      {/* Avatar Images */}
      <div className="flex -space-x-3">
        {avatars.map((avatar, index) => (
          <div
            key={index}
            className="relative h-12 w-12 rounded-full border-2 border-white dark:border-zinc-800 overflow-hidden"
          >
            <Image
              src={avatar.src}
              alt={avatar.alt}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
        ))}
      </div>

      {/* Stars and Text */}
      <div className="flex flex-col items-center sm:items-start gap-1">
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="w-6 h-6 text-yellow-400"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          from 52349+ happy users
        </p>
      </div>
    </div>
  );
}

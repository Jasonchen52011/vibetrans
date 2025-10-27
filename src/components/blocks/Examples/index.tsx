'use client';

import { useState } from 'react';

interface AudioItem {
  src?: string;
  alt: string;
  name?: string;
  audio?: string;
  emotion?: string;
}

interface BeforeAfterSectionProps {
  beforeAfterGallery: {
    title: string;
    description: string;
    images: AudioItem[];
  };
}

export default function BeforeAfterSection({
  beforeAfterGallery,
}: BeforeAfterSectionProps) {
  const [playingIndex, setPlayingIndex] = useState<number | null>(null);

  const getEmotionEmoji = (emotion?: string) => {
    const emotionMap: Record<string, string> = {
      Happy: '😊',
      Excited: '🤩',
      Sad: '😢',
      Angry: '😠',
      Calm: '😌',
      Playful: '😄',
    };
    return emotionMap[emotion || ''] || '😊';
  };

  const handlePlayAudio = (audioSrc: string, index: number) => {
    const audio = new Audio(audioSrc);
    setPlayingIndex(index);
    audio.play();
    audio.onended = () => setPlayingIndex(null);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <section className="py-2 sm:pt-16 sm:pb-8 bg-white">
      <div className="w-full max-w-6xl mx-auto px-2 sm:px-4 lg:px-6">
        <div className="text-center mb-16">
          <h2 className="max-w-5xl mx-auto text-center tracking-tight font-medium text-black dark:text-white text-3xl md:text-5xl md:leading-tight mb-6">
            {beforeAfterGallery.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-5xl mx-auto">
            {beforeAfterGallery.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {beforeAfterGallery.images.map((item, index) => (
            <div
              key={index}
              className="rounded-lg border border-gray-200 bg-white hover:shadow-xl transition-shadow duration-300"
            >
              {item.audio ? (
                <button
                  onClick={() =>
                    item.audio && handlePlayAudio(item.audio, index)
                  }
                  className="w-full p-8 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors rounded-lg"
                >
                  <div className="text-6xl mb-2">
                    {playingIndex === index
                      ? '🔊'
                      : getEmotionEmoji(item.emotion)}
                  </div>
                  {item.name && (
                    <p className="text-lg font-semibold text-gray-800 text-center">
                      {item.name}
                    </p>
                  )}
                </button>
              ) : item.src ? (
                <div onClick={scrollToTop} className="cursor-pointer">
                  <img
                    src={item.src}
                    alt={item.alt}
                    className="w-full h-65 rounded-lg object-cover"
                  />
                  {item.name && (
                    <div className="p-4">
                      <p className="text-lg font-semibold text-gray-800 text-center">
                        {item.name}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div
                  onClick={scrollToTop}
                  className="cursor-pointer p-6 flex flex-col gap-3"
                >
                  {item.name && (
                    <p className="text-lg font-semibold text-gray-800 text-center border-b pb-3">
                      {item.name}
                    </p>
                  )}
                  <div className="text-sm text-gray-600 whitespace-pre-line leading-relaxed text-center">
                    {item.alt}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

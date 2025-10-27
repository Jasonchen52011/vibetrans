import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - WhatBreedIsMyCat',
  description:
    "Learn about the team behind WhatBreedIsMyCat - passionate cat lovers who built an AI-powered tool to help identify your cat's breed.",
  metadataBase: new URL('https://whatbreedismycat.app'),
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'About Us - WhatBreedIsMyCat',
    description:
      "Meet the passionate cat lovers behind WhatBreedIsMyCat - we built an AI-powered tool to help identify your cat's breed with detailed information.",
    url: 'https://whatbreedismycat.app/about',
    type: 'website',
    images: [
      {
        url: '/page/catwaitoutdoor.jpg',
        width: 1200,
        height: 630,
        alt: 'About WhatBreedIsMyCat Team - Cat Breed Identifier',
      },
    ],
    locale: 'en_US',
    siteName: 'WhatBreedIsMyCat',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About Us - WhatBreedIsMyCat',
    description:
      "Meet the passionate cat lovers behind WhatBreedIsMyCat - we built an AI-powered tool to help identify your cat's breed.",
    images: ['/page/catwaitoutdoor.jpg'],
    creator: '@catbreedai',
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    'max-video-preview': -1,
  },
  keywords: [
    'about cat breed identifier',
    'cat breed AI team',
    'whatbreedismycat team',
    'cat identification app creators',
    'AI cat breed tool developers',
  ],
};

export default function AboutUs() {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <header className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">About Us</h1>
            <p className="text-gray-600 text-lg">
              Meet the team behind WhatBreedIsMyCat.app
            </p>
          </header>

          <div className="prose prose-gray max-w-none">
            <div className="mb-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="text-5xl text-sky-300">
                  <i className="fas fa-cat"></i>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    Hi! We're just a small group of cat nerds
                  </h2>
                  <p className="text-gray-600">
                    who couldn't stop asking the same thing:
                  </p>
                </div>
              </div>

              <div className="bg-sky-50 shadow  p-6 rounded-lg  mb-8">
                <p className="text-lg font-medium text-sky-700 italic">
                  "What kind of cat is this little furball on my couch?"
                </p>
              </div>
            </div>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Our Story
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                It started when one of us adopted a kitten from a shelter. She
                had the fluff of a Persian, the face of a Golden Chinchilla, and
                the attitude of a Bengal. We Googled, we joined forums, we even
                tried a few apps — but none of them gave a clear answer. And
                most didn't explain why the result came up.
              </p>
              <p className="text-gray-700 leading-relaxed mb-6">
                So, as cat lovers and tool builders, we said:{' '}
                <strong>"Let's make something better."</strong>
              </p>
              <p className="text-gray-700 leading-relaxed">
                That's how WhatBreedIsMyCat.app was born.
              </p>

              {/* 图片展示区域 */}
              <div className="mt-8 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="relative group">
                    <img
                      src="/page/catwaitoutdoor.jpg"
                      alt="Cat waiting outdoor"
                      className="w-full h-80 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="relative group">
                    <img
                      src="/page/catangry.jpg"
                      alt="Cat with attitude"
                      className="w-full h-80 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="relative group">
                    <img
                      src="/page/catthink.jpg"
                      alt="Cat thinking"
                      className="w-full h-80 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <div className="relative group">
                    <img
                      src="/page/catinthecar.jpg"
                      alt="Cat in the car"
                      className="w-full h-80 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                What Makes Us Different
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  We built an AI-powered tool that doesn't just throw out a
                  breed name — it gives you real insights.
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl text-sky-300">
                      <i className="fas fa-camera"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Photo Analysis
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Advanced AI identifies physical traits and patterns
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl text-pink-300">
                      <i className="fas fa-dna"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Breed Insights
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Detailed explanations of which breeds your cat resembles
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl text-sky-300">
                      <i className="fas fa-heart-pulse"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Health Notes
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Possible health and behavior insights
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="text-2xl text-pink-300">
                      <i className="fas fa-book-open"></i>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        Trusted Sources
                      </h4>
                      <p className="text-gray-600 text-sm">
                        Based on real data from TICA and vet-backed studies
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Our Mission
              </h3>
              <div className="bg-pink-50 shadow p-6 rounded-lg mb-6">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <span className="font-bold text-pink-700">
                    We believe every cat has a story.
                  </span>{' '}
                  Even if they're not purebred, their features and genes hold
                  clues. Our mission is to help you uncover those clues in a way
                  that's simple, fun, and actually useful.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-2 text-sky-300">
                    <i className="fas fa-search"></i>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Simple</h4>
                  <p className="text-gray-600 text-sm">
                    Just upload a photo and get instant results
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2 text-pink-300">
                    <i className="fas fa-star"></i>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Fun</h4>
                  <p className="text-gray-600 text-sm">
                    Discover your cat's unique traits and characteristics
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2 text-sky-300">
                    <i className="fas fa-lightbulb"></i>
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Useful</h4>
                  <p className="text-gray-600 text-sm">
                    Get actionable insights about health and behavior
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Privacy First
              </h3>
              <div className="bg-sky-50 shadow p-6 rounded-lg ">
                <p className="text-gray-700 leading-relaxed mb-4">
                  <span className="font-bold text-sky-700">
                    We care about your privacy
                  </span>{' '}
                  — your photo is deleted right after the results are generated.
                  Nothing is stored. No sign-up needed.
                </p>
                <div className="flex items-center gap-2 font-bold text-sky-700">
                  <i className="fas fa-shield-alt text-sky-300"></i>
                  <span className="font-medium">
                    Zero data storage guarantee
                  </span>
                </div>
              </div>
            </section>

            <section className="mb-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                For Every Cat Parent
              </h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                This is the tool we wish we had years ago. Now, we're sharing it
                with every curious cat parent out there — maybe that's you.
              </p>

              <div className="text-center bg-gray-50 p-8 rounded-lg">
                <div className="text-6xl mb-4 text-pink-300">
                  <i className="fas fa-cat text-3xl"></i>
                  <i className="fas fa-heart ml-2 text-3xl"></i>
                </div>
                <p className="text-gray-700 text-lg font-medium mb-4">
                  Ready to discover your cat's story?
                </p>
                <a
                  href="/"
                  className="inline-flex items-center px-6 py-3 bg-pink-500 text-white font-medium rounded-lg hover:bg-sky-700 transition-colors duration-200"
                >
                  Try Our Cat Breed Identifier
                  <i className="fas fa-arrow-right ml-2"></i>
                </a>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

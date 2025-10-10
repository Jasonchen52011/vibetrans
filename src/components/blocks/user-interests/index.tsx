'use client';

interface UserInterestsSection {
  title: string;
  content: string;
}

interface UserInterestsProps {
  title: string;
  sections: UserInterestsSection[];
}

export default function UserInterestsSection({
  title,
  sections,
}: UserInterestsProps) {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50 dark:from-zinc-900 dark:to-zinc-800">
      <div className="container max-w-6xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
          {title}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {sections.map((section, index) => (
            <div
              key={index}
              className="bg-white dark:bg-zinc-800 rounded-lg p-8 shadow-sm border border-gray-100 dark:border-zinc-700 hover:shadow-md transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {section.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

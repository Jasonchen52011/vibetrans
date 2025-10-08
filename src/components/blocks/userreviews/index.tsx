'use client';

interface Review {
  title: string;
  content?: string;
  review?: string;
  author?: string;
  role?: string;
  rating?: number;
}

interface UserReviewsSectionProps {
  title: string;
  description: string;
  reviews: Review[];
  buttonText: string;
}

export default function UserReviewsSection({
  title,
  description,
  reviews,
  buttonText,
}: UserReviewsSectionProps) {
  return (
    <section className="max-w-6xl mx-auto mt-4 md:mt-8 mb-2">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-extrabold md:text-4xl mb-10 text-gray-800">
          {title}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {reviews.map((review, index) => (
          <div
            key={index}
            className="bg-surface-light rounded-2xl p-4 shadow-sm border border-[#1602FF]/10"
          >
            <div className="flex flex-col gap-2">
              {/* 星星和评分放在最上面 */}
              <div className="flex items-center gap-2 mb-2">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className="w-8 h-8 text-yellow-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
                {review.rating && (
                  <span className="text-base font-semibold text-gray-700 ml-1">
                    {review.rating?.toFixed(1)}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-semibold text-gray-800">
                {review.title}
              </h3>
              <p
                className="text-gray-600 text-base"
                dangerouslySetInnerHTML={{
                  __html: review.content || review.review || '',
                }}
              ></p>
              {review.author && (
                <div className="mt-3 pt-3">
                  <p className="text-sm text-gray-700 font-medium">
                    {review.author}
                  </p>
                  {review.role && (
                    <p className="text-sm text-gray-500">{review.role}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center mt-12">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="bg-[#1602FF] text-white px-8 py-4 rounded-lg font-semibold hover:bg-[#1602FF]/90 transition-colors mx-auto"
        >
          {buttonText}
          <i className="fas fa-paw ms-2"></i>
        </button>
      </div>
    </section>
  );
}

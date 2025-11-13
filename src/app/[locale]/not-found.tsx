export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4">
      <div className="mx-auto max-w-[400px] text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
          404
        </h1>
        <p className="mt-4 text-lg text-gray-600">Page not found</p>
        <div className="mt-8">
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}

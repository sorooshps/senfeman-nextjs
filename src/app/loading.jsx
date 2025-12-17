export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-blue-600 mx-auto"></div>
        <p className="text-gray-600 mt-4 text-sm">در حال بارگذاری...</p>
      </div>
    </div>
  );
}

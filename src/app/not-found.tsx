export default function NotFound() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
      <p className="text-xl text-gray-600 mb-8">ページが見つかりませんでした</p>
      <a
        href="/"
        className="text-indigo-600 hover:text-indigo-500 font-medium"
      >
        トップページに戻る
      </a>
    </div>
  );
}
export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8">
      <div className="relative">
        {/* メインのローディングアニメーション */}
        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin"></div>
        
        {/* テキストメッセージ */}
        <div className="mt-6 text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">
            記事を生成中...
          </p>
          <p className="text-sm text-gray-600">
            お客様の状況に合わせた解決策を提案しています
          </p>
        </div>

        {/* プログレスバー */}
        <div className="mt-8 w-64">
          <div className="h-1 w-full bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-red-600 rounded-full animate-progress"></div>
          </div>
        </div>

        {/* 補足メッセージ */}
        <p className="mt-4 text-xs text-gray-500 text-center">
          ※生成には1-2分程度かかる場合があります
        </p>
      </div>
    </div>
  );
}
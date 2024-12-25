'use client';

export default function EditorInfo() {
  return (
    <div className="relative bg-white rounded-2xl overflow-hidden">
      {/* 背景のアクセント */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-blue-500 to-blue-600"></div>
      
      <div className="p-8">
        {/* プロフィール画像とタイトル */}
        <div className="flex items-center space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full overflow-hidden ring-2 ring-blue-100 ring-offset-2">
              <img
                src="/images/editor.jpg"
                alt="編集長"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          <div>
            <div className="text-sm font-medium text-blue-600 mb-1">編集長</div>
            <h3 className="text-xl font-bold text-gray-900">山下 香織</h3>
            <p className="text-sm text-gray-500 mt-1">退職代行アドバイザー</p>
          </div>
        </div>

        {/* 専門分野 */}
        <div className="mt-6 space-y-4">
          <div className="flex items-start space-x-3">
            <div className="mt-1 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">専門分野</h4>
              <p className="mt-1 text-sm text-gray-600">退職交渉、労働問題解決、メンタルヘルスケア</p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <div className="mt-1 text-blue-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-medium text-gray-900">実績</h4>
              <p className="mt-1 text-sm text-gray-600">退職代行サービスでの豊富な経験を活かし、これまでに1,000件以上の退職交渉を成功に導いてきました。特にパワハラ・メンタルヘルス案件を得意としています。</p>
            </div>
          </div>
        </div>

        {/* メッセージ */}
        <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-white rounded-xl border border-blue-100">
          <p className="text-sm text-gray-600 leading-relaxed">
            退職に関する悩みは早期解決が重要です。一人で抱え込まず、まずはご相談ください。これまでの経験を活かし、あなたの状況に最適な解決策を提案させていただきます。
          </p>
        </div>
      </div>
    </div>
  );
}
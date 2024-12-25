import Image from 'next/image';

export default function AuthorInfo() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        執筆者プロフィール
      </h2>
      <div className="flex items-start space-x-4">
        <div className="relative w-24 h-24 flex-shrink-0">
          <Image
            src="/images/author.jpg"
            alt="退職代行カウンセラー"
            fill
            className="object-cover rounded-lg"
          />
        </div>
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900 mr-3">佐藤 美咲</h3>
            <div className="flex flex-wrap gap-2">
              <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                退職代行カウンセラー
              </span>
              <span className="inline-block bg-red-100 text-red-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                メンタルヘルスケア専門
              </span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              退職代行サービスで5年以上の相談経験を持つカウンセラー。
              年間100件以上の退職相談に対応し、特にメンタルヘルスケアを重視したサポートを得意とする。
            </p>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="font-semibold mb-2">得意分野：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>パワハラ・メンタルヘルス関連の退職相談</li>
                <li>女性特有の職場トラブル解決</li>
                <li>引き止め対策のアドバイス</li>
                <li>退職後のキャリア相談</li>
              </ul>
            </div>
            <div className="flex items-center space-x-8 mt-4">
              <div className="flex items-center">
                <span className="text-red-600 font-bold text-lg">100</span>
                <span className="text-gray-500 text-sm ml-1">件/年</span>
              </div>
              <div className="flex items-center">
                <span className="text-red-600 font-bold text-lg">5</span>
                <span className="text-gray-500 text-sm ml-1">年以上</span>
                <span className="text-gray-500 text-sm ml-1">の経験</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-6 pt-6 border-t border-gray-100">
        <p className="text-sm text-gray-500">
          ※記事の内容は執筆時点での情報に基づいています。より詳しい情報や個別の事案については、無料相談をご利用ください。
        </p>
      </div>
    </div>
  );
}
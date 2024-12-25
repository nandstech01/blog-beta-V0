'use client';

import Link from 'next/link';
import {
  ExclamationTriangleIcon,
  HeartIcon,
  ShieldExclamationIcon,
  ScaleIcon,
  StarIcon,
  BanknotesIcon,
  UserGroupIcon,
  HandRaisedIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

export interface Category {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  isReady: boolean;
}

export const categories: Category[] = [
  {
    id: 'trouble-cases',
    title: '退職トラブル事例',
    description: '実際のトラブル事例と解決方法',
    icon: ExclamationTriangleIcon,
    color: 'text-amber-600',
    isReady: true
  },
  {
    id: 'mental-damage',
    title: 'メンタルケア',
    description: '精神的ダメージからの回復方法',
    icon: HeartIcon,
    color: 'text-rose-600',
    isReady: true
  },
  {
    id: 'harassment',
    title: 'ハラスメント対策',
    description: 'パワハラ・退職妨害への対処法',
    icon: ShieldExclamationIcon,
    color: 'text-red-600',
    isReady: true
  },
  {
    id: 'legal-risks',
    title: '法的リスク',
    description: '違法な引き止めへの対応策',
    icon: ScaleIcon,
    color: 'text-blue-600',
    isReady: true
  },
  {
    id: 'success-cases',
    title: '成功事例',
    description: 'トラブル解決の実績紹介',
    icon: StarIcon,
    color: 'text-yellow-500',
    isReady: true
  },
  {
    id: 'unemployment-benefits',
    title: '失業給付金',
    description: '給付金の取得方法と注意点',
    icon: BanknotesIcon,
    color: 'text-green-600',
    isReady: true
  },
  {
    id: 'workplace-relationships',
    title: '人間関係',
    description: '職場の人間関係トラブル解決',
    icon: UserGroupIcon,
    color: 'text-indigo-600',
    isReady: true
  },
  {
    id: 'hidden-troubles',
    title: '相談できない悩み',
    description: '誰にも言えない職場の問題',
    icon: HandRaisedIcon,
    color: 'text-purple-600',
    isReady: true
  },
  {
    id: 'real-experiences',
    title: '体験談',
    description: '退職代行利用者の声',
    icon: ChatBubbleBottomCenterTextIcon,
    color: 'text-teal-600',
    isReady: true
  }
];

export default function CategoryList() {
  return (
    <div className="grid grid-cols-2 gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        return (
          <div
            key={category.id}
            className={`group block p-3 bg-white rounded-lg shadow-sm transition-all duration-200 ${
              !category.isReady ? 'opacity-75 cursor-default' : 'hover:shadow-md'
            }`}
          >
            {category.isReady ? (
              <Link href={`/category/${category.id}`} className="block">
                <CategoryContent category={category} Icon={Icon} />
              </Link>
            ) : (
              <CategoryContent category={category} Icon={Icon} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function CategoryContent({ category, Icon }: { category: Category; Icon: React.ElementType }) {
  return (
    <div className="flex flex-col items-center space-y-2">
      <div className={`${category.color} ${category.isReady ? 'group-hover:scale-110' : ''} transition-transform duration-200`}>
        <Icon className="h-10 w-10" />
      </div>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          {category.title}
          {!category.isReady && (
            <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
              準備中
            </span>
          )}
        </h3>
        <p className="text-xs text-gray-500 line-clamp-2">{category.description}</p>
      </div>
    </div>
  );
}
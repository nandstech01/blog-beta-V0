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
}

export const categories: Category[] = [
  {
    id: 'trouble-cases',
    title: '退職トラブル事例',
    description: '実際のトラブル事例と解決方法',
    icon: ExclamationTriangleIcon,
    color: 'text-amber-600'
  },
  // ...他のカテゴリー
];

// サーバーサイドで使用するためのシンプルなカテゴリーデータ
export const serverCategories = categories.map(({ id, title, description, color }) => ({
  id,
  title,
  description,
  color
}));

// カテゴリーを検索する関数
export function findCategory(categoryId: string) {
  return serverCategories.find(cat => cat.id === categoryId);
} 
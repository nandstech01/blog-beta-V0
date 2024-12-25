import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '記事検索 | 退職代行比較ナビ',
  description: '退職代行サービスに関する記事を検索',
};

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
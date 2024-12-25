import { categories } from '@/components/CategoryList';

type CategoryId = typeof categories[number]['id'];

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  keywords: string[] | null;
  image: string | null;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  views: string | null;
}
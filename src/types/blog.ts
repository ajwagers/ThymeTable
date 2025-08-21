export interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author: string;
  published_date: string;
  read_time?: string;
  category: string;
  tags: string[];
  image_url?: string;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBlogArticleData {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  author: string;
  published_date: string;
  read_time?: string;
  category: string;
  tags: string[];
  image_url?: string;
  is_published: boolean;
}

export interface UpdateBlogArticleData extends Partial<CreateBlogArticleData> {
  id: string;
}
import { supabase } from '../lib/supabase';
import { BlogArticle, CreateBlogArticleData, UpdateBlogArticleData } from '../types/blog';

export async function getAllPublishedArticles(): Promise<BlogArticle[]> {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('is_published', true)
    .order('published_date', { ascending: false });

  if (error) {
    console.error('Error fetching published articles:', error);
    throw new Error('Failed to fetch articles');
  }

  return data || [];
}

export async function getAllArticles(): Promise<BlogArticle[]> {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching all articles:', error);
    throw new Error('Failed to fetch articles');
  }

  return data || [];
}

export async function getArticleBySlug(slug: string): Promise<BlogArticle | null> {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned
      return null;
    }
    console.error('Error fetching article by slug:', error);
    throw new Error('Failed to fetch article');
  }

  return data;
}

export async function getArticleById(id: string): Promise<BlogArticle | null> {
  const { data, error } = await supabase
    .from('blog_articles')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching article by ID:', error);
    throw new Error('Failed to fetch article');
  }

  return data;
}

export async function createArticle(articleData: CreateBlogArticleData): Promise<BlogArticle> {
  const { data, error } = await supabase
    .from('blog_articles')
    .insert(articleData)
    .select()
    .single();

  if (error) {
    console.error('Error creating article:', error);
    throw new Error('Failed to create article');
  }

  return data;
}

export async function updateArticle(articleData: UpdateBlogArticleData): Promise<BlogArticle> {
  const { id, ...updateData } = articleData;
  
  const { data, error } = await supabase
    .from('blog_articles')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating article:', error);
    throw new Error('Failed to update article');
  }

  return data;
}

export async function deleteArticle(id: string): Promise<void> {
  const { error } = await supabase
    .from('blog_articles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting article:', error);
    throw new Error('Failed to delete article');
  }
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type Article = {
  id: string;
  title: string;
  description: string | null;
  authors: string[];
  publicationDate: string;
  filePath: string | null;
  thumbnailPath: string | null;
};

export type ArticleFormData = {
  title: string;
  description: string;
  authors: string;
  publicationDate: string;
};

type ArticlesContextType = {
  articles: Article[];
  isLoading: boolean;
  createArticle: (data: ArticleFormData, file: File | null, thumbnail: File | null) => Promise<boolean>;
  updateArticle: (id: string, data: ArticleFormData, file: File | null, thumbnail: File | null) => Promise<boolean>;
  deleteArticle: (id: string) => Promise<boolean>;
  refreshArticles: () => Promise<void>;
};

const ArticlesContext = createContext<ArticlesContextType | undefined>(undefined);

export function ArticlesProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/articles');
      if (!res.ok) throw new Error('Failed to fetch articles');
      const data = await res.json();
      setArticles(data);
    } catch (error) {
      toast.error('Error loading articles');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const createArticle = async (data: ArticleFormData, file: File | null, thumbnail: File | null): Promise<boolean> => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      formDataToSend.append('authors', data.authors);
      formDataToSend.append('publicationDate', data.publicationDate);
      if (file) formDataToSend.append('file', file);
      if (thumbnail) formDataToSend.append('thumbnail', thumbnail);

      const res = await fetch('/api/articles', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Failed to create article');

      await fetchArticles();
      toast.success('Article created successfully');
      return true;
    } catch (error) {
      toast.error('Failed to create article');
      console.error(error);
      return false;
    }
  };

  const updateArticle = async (id: string, data: ArticleFormData, file: File | null, thumbnail: File | null): Promise<boolean> => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', id);
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      formDataToSend.append('authors', data.authors);
      formDataToSend.append('publicationDate', data.publicationDate);
      if (file) formDataToSend.append('file', file);
      if (thumbnail) formDataToSend.append('thumbnail', thumbnail);

      const res = await fetch('/api/articles', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Failed to update article');

      await fetchArticles();
      toast.success('Article updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update article');
      console.error(error);
      return false;
    }
  };

  const deleteArticle = async (id: string): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this article?')) {
      return false;
    }

    try {
      const res = await fetch(`/api/articles?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete article');

      await fetchArticles();
      toast.success('Article deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete article');
      console.error(error);
      return false;
    }
  };

  const refreshArticles = async () => {
    await fetchArticles();
  };

  return (
    <ArticlesContext.Provider
      value={{
        articles,
        isLoading,
        createArticle,
        updateArticle,
        deleteArticle,
        refreshArticles,
      }}
    >
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticlesContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticlesProvider');
  }
  return context;
}

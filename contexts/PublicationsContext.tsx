'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type Publication = {
  id: string;
  title: string;
  description: string | null;
  authors: string[];
  publicationDate: string;
  doi: string | null;
  journal: string | null;
  volume: string | null;
  pages: string | null;
  url: string | null;
};

export type PublicationFormData = {
  title: string;
  description: string;
  authors: string;
  publicationDate: string;
  doi: string;
  journal: string;
  volume: string;
  pages: string;
  url: string;
};

type PublicationsContextType = {
  publications: Publication[];
  isLoading: boolean;
  createPublication: (data: PublicationFormData) => Promise<boolean>;
  updatePublication: (id: string, data: PublicationFormData) => Promise<boolean>;
  deletePublication: (id: string) => Promise<boolean>;
  refreshPublications: () => Promise<void>;
};

const PublicationsContext = createContext<PublicationsContextType | undefined>(undefined);

export function PublicationsProvider({ children }: { children: ReactNode }) {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPublications = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/publications');
      if (!res.ok) throw new Error('Failed to fetch publications');
      const data = await res.json();
      setPublications(data);
    } catch (error) {
      toast.error('Error loading publications');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  const createPublication = async (data: PublicationFormData): Promise<boolean> => {
    try {
      const res = await fetch('/api/publications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          authors: data.authors.split(',').map((a) => a.trim()),
        }),
      });

      if (!res.ok) throw new Error('Failed to create publication');

      await fetchPublications();
      toast.success('Publication created successfully');
      return true;
    } catch (error) {
      toast.error('Failed to create publication');
      return false;
    }
  };

  const updatePublication = async (id: string, data: PublicationFormData): Promise<boolean> => {
    try {
      const res = await fetch('/api/publications', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          ...data,
          authors: data.authors.split(',').map((a) => a.trim()),
        }),
      });

      if (!res.ok) throw new Error('Failed to update publication');

      await fetchPublications();
      toast.success('Publication updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update publication');
      return false;
    }
  };

  const deletePublication = async (id: string): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this publication?')) {
      return false;
    }

    try {
      const res = await fetch(`/api/publications?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete publication');

      await fetchPublications();
      toast.success('Publication deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete publication');
      return false;
    }
  };

  const refreshPublications = async () => {
    await fetchPublications();
  };

  return (
    <PublicationsContext.Provider
      value={{
        publications,
        isLoading,
        createPublication,
        updatePublication,
        deletePublication,
        refreshPublications,
      }}
    >
      {children}
    </PublicationsContext.Provider>
  );
}

export function usePublications() {
  const context = useContext(PublicationsContext);
  if (context === undefined) {
    throw new Error('usePublications must be used within a PublicationsProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type Infographic = {
  id: string;
  title: string;
  description: string;
  imagePath: string;
  categories: string[];
  uploadedAt: string;
};

export type InfographicFormData = {
  title: string;
  description: string;
  categories: string[];
  file?: File;
};

type InfographicsContextType = {
  infographics: Infographic[];
  isLoading: boolean;
  createInfographic: (data: InfographicFormData, file: File) => Promise<boolean>;
  updateInfographic: (id: string, data: InfographicFormData, file?: File) => Promise<boolean>;
  deleteInfographic: (id: string) => Promise<boolean>;
  refreshInfographics: () => Promise<void>;
};

const InfographicsContext = createContext<InfographicsContextType | undefined>(undefined);

export function InfographicsProvider({ children }: { children: ReactNode }) {
  const [infographics, setInfographics] = useState<Infographic[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchInfographics = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/infographics');
      if (!res.ok) throw new Error('Failed to fetch infographics');
      const data = await res.json();
      setInfographics(data.data || data);
    } catch {
      toast.error('Error loading infographics');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInfographics();
  }, []);

  const createInfographic = async (data: InfographicFormData, file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('categories', data.categories.join(','));
      formData.append('file', file);

      const res = await fetch('/api/infographics', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to create infographic');
      }

      await fetchInfographics();
      toast.success('Infographic created successfully');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create infographic';
      toast.error(message);
      return false;
    }
  };

  const updateInfographic = async (id: string, data: InfographicFormData, file?: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('id', id);
      if (data.title) formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      if (data.categories && data.categories.length > 0) {
        formData.append('categories', data.categories.join(','));
      }
      if (file) formData.append('file', file);

      const res = await fetch('/api/infographics', {
        method: 'PUT',
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to update infographic');
      }

      await fetchInfographics();
      toast.success('Infographic updated successfully');
      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update infographic';
      toast.error(message);
      return false;
    }
  };

  const deleteInfographic = async (id: string): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this infographic?')) {
      return false;
    }

    try {
      const res = await fetch(`/api/infographics?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete infographic');

      await fetchInfographics();
      toast.success('Infographic deleted successfully');
      return true;
    } catch {
      toast.error('Failed to delete infographic');
      return false;
    }
  };

  return (
    <InfographicsContext.Provider
      value={{
        infographics,
        isLoading,
        createInfographic,
        updateInfographic,
        deleteInfographic,
        refreshInfographics: fetchInfographics,
      }}
    >
      {children}
    </InfographicsContext.Provider>
  );
}

export function useInfographics() {
  const context = useContext(InfographicsContext);
  if (!context) {
    throw new Error('useInfographics must be used within InfographicsProvider');
  }
  return context;
}

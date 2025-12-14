'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type Educational = {
  id: string;
  title: string;
  description: string | null;
  content: string;
  category: string;
  difficulty: string;
  createdAt: string;
};

export type EducationalFormData = {
  title: string;
  description: string;
  content: string;
  category: string;
  difficulty: string;
};

type EducationalContextType = {
  items: Educational[];
  isLoading: boolean;
  createItem: (data: EducationalFormData) => Promise<boolean>;
  updateItem: (id: string, data: EducationalFormData) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  refreshItems: () => Promise<void>;
};

const EducationalContext = createContext<EducationalContextType | undefined>(undefined);

export function EducationalProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Educational[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/educational');
      if (!res.ok) throw new Error('Failed to fetch educational content');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      toast.error('Error loading educational content');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const createItem = async (data: EducationalFormData): Promise<boolean> => {
    try {
      const res = await fetch('/api/educational', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error('Failed to create educational content');

      await fetchItems();
      toast.success('Educational content created successfully');
      return true;
    } catch (error) {
      toast.error('Failed to create educational content');
      return false;
    }
  };

  const updateItem = async (id: string, data: EducationalFormData): Promise<boolean> => {
    try {
      const res = await fetch('/api/educational', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data }),
      });

      if (!res.ok) throw new Error('Failed to update educational content');

      await fetchItems();
      toast.success('Educational content updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update educational content');
      return false;
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this educational content?')) {
      return false;
    }

    try {
      const res = await fetch(`/api/educational?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete educational content');

      await fetchItems();
      toast.success('Educational content deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete educational content');
      return false;
    }
  };

  const refreshItems = async () => {
    await fetchItems();
  };

  return (
    <EducationalContext.Provider
      value={{
        items,
        isLoading,
        createItem,
        updateItem,
        deleteItem,
        refreshItems,
      }}
    >
      {children}
    </EducationalContext.Provider>
  );
}

export function useEducational() {
  const context = useContext(EducationalContext);
  if (context === undefined) {
    throw new Error('useEducational must be used within an EducationalProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type GalleryItem = {
  id: string;
  title: string;
  description: string | null;
  imagePath: string;
  createdAt: string;
};

export type GalleryFormData = {
  title: string;
  description: string;
};

type GalleryContextType = {
  items: GalleryItem[];
  isLoading: boolean;
  createItem: (data: GalleryFormData, image: File) => Promise<boolean>;
  updateItem: (id: string, data: GalleryFormData, image: File | null) => Promise<boolean>;
  deleteItem: (id: string) => Promise<boolean>;
  refreshItems: () => Promise<void>;
};

const GalleryContext = createContext<GalleryContextType | undefined>(undefined);

export function GalleryProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/gallery');
      if (!res.ok) throw new Error('Failed to fetch gallery');
      const data = await res.json();
      setItems(data);
    } catch (error) {
      toast.error('Error loading gallery');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const createItem = async (data: GalleryFormData, image: File): Promise<boolean> => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      formDataToSend.append('image', image);

      const res = await fetch('/api/gallery', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Failed to create gallery item');

      await fetchItems();
      toast.success('Gallery item created successfully');
      return true;
    } catch (error) {
      toast.error('Failed to create gallery item');
      return false;
    }
  };

  const updateItem = async (id: string, data: GalleryFormData, image: File | null): Promise<boolean> => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', id);
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      if (image) formDataToSend.append('image', image);

      const res = await fetch('/api/gallery', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Failed to update gallery item');

      await fetchItems();
      toast.success('Gallery item updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update gallery item');
      return false;
    }
  };

  const deleteItem = async (id: string): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this gallery item?')) {
      return false;
    }

    try {
      const res = await fetch(`/api/gallery?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete gallery item');

      await fetchItems();
      toast.success('Gallery item deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete gallery item');
      return false;
    }
  };

  const refreshItems = async () => {
    await fetchItems();
  };

  return (
    <GalleryContext.Provider
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
    </GalleryContext.Provider>
  );
}

export function useGallery() {
  const context = useContext(GalleryContext);
  if (context === undefined) {
    throw new Error('useGallery must be used within a GalleryProvider');
  }
  return context;
}

'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type Video = {
  id: string;
  title: string;
  description: string | null;
  url: string;
  thumbnailPath: string | null;
  createdAt: string;
};

export type VideoFormData = {
  title: string;
  description: string;
  url: string;
};

type VideosContextType = {
  videos: Video[];
  isLoading: boolean;
  createVideo: (data: VideoFormData, thumbnail: File | null) => Promise<boolean>;
  updateVideo: (id: string, data: VideoFormData, thumbnail: File | null) => Promise<boolean>;
  deleteVideo: (id: string) => Promise<boolean>;
  refreshVideos: () => Promise<void>;
};

const VideosContext = createContext<VideosContextType | undefined>(undefined);

export function VideosProvider({ children }: { children: ReactNode }) {
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVideos = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/videos');
      if (!res.ok) throw new Error('Failed to fetch videos');
      const data = await res.json();
      setVideos(data);
    } catch (error) {
      toast.error('Error loading videos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const createVideo = async (data: VideoFormData, thumbnail: File | null): Promise<boolean> => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      formDataToSend.append('url', data.url);
      if (thumbnail) formDataToSend.append('thumbnail', thumbnail);

      const res = await fetch('/api/videos', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Failed to create video');

      await fetchVideos();
      toast.success('Video created successfully');
      return true;
    } catch (error) {
      toast.error('Failed to create video');
      return false;
    }
  };

  const updateVideo = async (id: string, data: VideoFormData, thumbnail: File | null): Promise<boolean> => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', id);
      formDataToSend.append('title', data.title);
      formDataToSend.append('description', data.description);
      formDataToSend.append('url', data.url);
      if (thumbnail) formDataToSend.append('thumbnail', thumbnail);

      const res = await fetch('/api/videos', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Failed to update video');

      await fetchVideos();
      toast.success('Video updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update video');
      return false;
    }
  };

  const deleteVideo = async (id: string): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this video?')) {
      return false;
    }

    try {
      const res = await fetch(`/api/videos?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete video');

      await fetchVideos();
      toast.success('Video deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete video');
      return false;
    }
  };

  const refreshVideos = async () => {
    await fetchVideos();
  };

  return (
    <VideosContext.Provider
      value={{
        videos,
        isLoading,
        createVideo,
        updateVideo,
        deleteVideo,
        refreshVideos,
      }}
    >
      {children}
    </VideosContext.Provider>
  );
}

export function useVideos() {
  const context = useContext(VideosContext);
  if (context === undefined) {
    throw new Error('useVideos must be used within a VideosProvider');
  }
  return context;
}

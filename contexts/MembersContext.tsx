'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { toast } from 'sonner';

export type Member = {
  id: string;
  fullName: string;
  position: string;
  photo: string | null;
  typeOfMember: string;
};

export type MemberFormData = {
  fullName: string;
  position: string;
  typeOfMember: string;
};

type MembersContextType = {
  members: Member[];
  isLoading: boolean;
  createMember: (data: MemberFormData, photo: File | null) => Promise<boolean>;
  updateMember: (id: string, data: MemberFormData, photo: File | null) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
  refreshMembers: () => Promise<void>;
};

const MembersContext = createContext<MembersContextType | undefined>(undefined);

export function MembersProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/members');
      if (!res.ok) throw new Error('Failed to fetch members');
      const data = await res.json();
      setMembers(data);
    } catch (error) {
      toast.error('Error loading members');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const createMember = async (data: MemberFormData, photo: File | null): Promise<boolean> => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('fullName', data.fullName);
      formDataToSend.append('position', data.position);
      formDataToSend.append('typeOfMember', data.typeOfMember);
      if (photo) formDataToSend.append('photo', photo);

      const res = await fetch('/api/members', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Failed to create member');

      await fetchMembers();
      toast.success('Member created successfully');
      return true;
    } catch (error) {
      toast.error('Failed to create member');
      return false;
    }
  };

  const updateMember = async (id: string, data: MemberFormData, photo: File | null): Promise<boolean> => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('id', id);
      formDataToSend.append('fullName', data.fullName);
      formDataToSend.append('position', data.position);
      formDataToSend.append('typeOfMember', data.typeOfMember);
      if (photo) formDataToSend.append('photo', photo);

      const res = await fetch('/api/members', {
        method: 'PUT',
        body: formDataToSend,
      });

      if (!res.ok) throw new Error('Failed to update member');

      await fetchMembers();
      toast.success('Member updated successfully');
      return true;
    } catch (error) {
      toast.error('Failed to update member');
      return false;
    }
  };

  const deleteMember = async (id: string): Promise<boolean> => {
    if (!confirm('Are you sure you want to delete this member?')) {
      return false;
    }

    try {
      const res = await fetch(`/api/members?id=${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete member');

      await fetchMembers();
      toast.success('Member deleted successfully');
      return true;
    } catch (error) {
      toast.error('Failed to delete member');
      return false;
    }
  };

  const refreshMembers = async () => {
    await fetchMembers();
  };

  return (
    <MembersContext.Provider
      value={{
        members,
        isLoading,
        createMember,
        updateMember,
        deleteMember,
        refreshMembers,
      }}
    >
      {children}
    </MembersContext.Provider>
  );
}

export function useMembers() {
  const context = useContext(MembersContext);
  if (context === undefined) {
    throw new Error('useMembers must be used within a MembersProvider');
  }
  return context;
}

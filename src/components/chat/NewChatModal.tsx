import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Search, Loader2, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function NewChatModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { session } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedUsers([]);
      setGroupName('');
    }
  }, [open]);

  useEffect(() => {
    if (!search.trim()) {
      setUsers([]);
      return;
    }

    const searchUsers = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .ilike('username', `%${search}%`)
          .neq('id', session?.user?.id)
          .limit(10);
          
        if (error) throw error;
        setUsers(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    const debounce = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounce);
  }, [search, session]);

  const toggleUser = (user: any) => {
    const isSelected = selectedUsers.find(u => u.id === user.id);
    if (isSelected) {
      setSelectedUsers(selectedUsers.filter(u => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
 
<truncated 6173 bytes>
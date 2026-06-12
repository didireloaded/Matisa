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
    }
  };

  const handleStartChat = async () => {
    if (selectedUsers.length === 0 || !session?.user) return;
    
    const isGroup = selectedUsers.length > 1;
    if (isGroup && !groupName.trim()) {
      toast.error('Please provide a group name');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Create conversation
      const { data: convData, error: convError } = await supabase
        .from('conversations')
        .insert({
          is_group: isGroup,
          name: isGroup ? groupName.trim() : null
        })
        .select()
        .single();

      if (convError) throw convError;

      // 2. Add participants (Current user + selected users)
      const participants = [session.user.id, ...selectedUsers.map(u => u.id)].map(id => ({
        conversation_id: convData.id,
        user_id: id
      }));

      const { error: partError } = await supabase
        .from('conversation_participants')
        .insert(participants);

      if (partError) throw partError;

      setOpen(false);
      navigate(`/messages/${convData.id}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to start conversation');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-4 border-b border-border">
          <DialogTitle className="text-foreground font-display">New Message</DialogTitle>
        </DialogHeader>

        <div className="p-4 flex flex-col flex-1 overflow-hidden">
          {selectedUsers.length > 1 && (
            <div className="mb-4">
              <input 
                type="text" 
                placeholder="Group Name" 
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                className="w-full bg-background border border-border rounded-full py-2 px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          )}

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search users..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-background border border-border rounded-full py-2 pl-9 pr-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {selectedUsers.length > 0 && (
            <div className="flex overflow-x-auto gap-2 pb-2 mb-2 no-scrollbar">
              {selectedUsers.map(u => (
                <div key={u.id} className="bg-secondary px-3 py-1 rounded-full flex items-center gap-2 text-xs shrink-0 cursor-pointer" onClick={() => toggleUser(u)}>
                  <span>{u.username}</span>
                  <span className="text-muted-foreground hover:text-foreground">×</span>
                </div>
              ))}
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-primary" /></div>
            ) : users.length > 0 ? (
              users.map(user => {
                const isSelected = selectedUsers.some(u => u.id === user.id);
                return (
                  <div 
                    key={user.id} 
                    onClick={() => toggleUser(user)}
                    className="flex items-center justify-between p-3 hover:bg-secondary/50 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-secondary overflow-hidden shrink-0">
                        <img src={user.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`} alt={user.username} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold text-sm">{user.full_name || user.username}</span>
                        <span className="text-xs text-muted-foreground">@{user.username}</span>
                      </div>
                    </div>
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-primary border-primary' : 'border-border'}`}>
                      {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-foreground" />}
                    </div>
                  </div>
                )
              })
            ) : search.trim() ? (
              <p className="text-center text-muted-foreground text-sm p-4">No users found</p>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
                <Users className="w-8 h-8 mb-2 opacity-50" />
                <p className="text-sm">Search for users to start a chat</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <button 
            disabled={selectedUsers.length === 0 || isSubmitting}
            onClick={handleStartChat}
            className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Start Chat
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

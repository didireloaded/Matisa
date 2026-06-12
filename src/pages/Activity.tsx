import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { T, Avatar, EmptyState, Skeleton, timeAgo } from '../components/shared';
import type { Notification } from '../types';

export function Activity() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNotifs() {
      if (!profile) return;
      const { data } = await supabase
        .from('notifications')
        .select('*, profiles:actor_id(*)')
        .eq('recipient_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (data) setNotifications(data as Notification[]);
      setLoading(false);
    }
    loadNotifs();
  }, [profile]);

  return (
    <div className="pb-24">
      <header className="sticky top-0 z-40 px-4 py-4 bg-[#0F0D0B]/90 backdrop-blur-md border-b border-[#2E2822]">
        <h1 className="text-xl font-bold text-[#F5F0EA]">Activity</h1>
      </header>

      <main>
        {loading ? (
          <div className="p-4 space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3 items-center">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2 w-12" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <EmptyState icon={<Bell />} title="No activity yet" subtitle="When someone interacts with your posts, you'll see it here." />
        ) : (
          <div className="divide-y divide-[#2E2822]">
            {notifications.map((notif) => (
              <div key={notif.id} className={`flex items-start gap-3 p-4 ${!notif.is_read ? 'bg-[#1C1814]' : ''}`}>
                <Avatar profile={notif.profiles} size={40} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#F5F0EA]">
                    <span className="font-semibold">{notif.profiles.display_name}</span>{' '}
                    {notif.type === 'like' ? 'liked your post.' :
                     notif.type === 'comment' ? 'commented on your post.' :
                     notif.type === 'follow' ? 'started following you.' :
                     notif.type === 'mention' ? 'mentioned you.' :
                     `interacted with you (${notif.type}).`}
                  </p>
                  <p className="text-xs text-[#8A7F74] mt-1">{timeAgo(notif.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
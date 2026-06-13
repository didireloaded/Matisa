import { supabase } from '../lib/supabase';

export const KaraokeService = {
  /**
   * Subscribes to a karaoke room for presence and reactions
   */
  subscribeToRoom(
    roomId: string,
    userId: string,
    onReaction: (emoji: string) => void,
    onPresenceSync: (count: number) => void
  ) {
    const channel = supabase.channel(`room:${roomId}`, {
      config: {
        broadcast: { ack: false },
        presence: { key: userId || 'anonymous' },
      },
    });

    channel
      .on('broadcast', { event: 'reaction' }, (payload) => {
        onReaction(payload.payload.emoji);
      })
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const count = Object.keys(state).length;
        onPresenceSync(count);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: userId, online_at: new Date().toISOString() });
        }
      });

    return channel;
  },

  /**
   * Broadcasts a reaction to the room
   */
  async broadcastReaction(roomId: string, emoji: string) {
    await supabase.channel(`room:${roomId}`).send({
      type: 'broadcast',
      event: 'reaction',
      payload: { emoji },
    });
  },

  /**
   * Unsubscribes from the room channel
   */
  unsubscribe(channel: ReturnType<typeof supabase.channel>) {
    supabase.removeChannel(channel);
  }
};

'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { TradeChat, TradeMessage } from '@/lib/types/chat';

// ---------------------------------------------------------------------------
// useTradeChat
// Loads chat history + subscribes to new messages, typing, and presence.
// ---------------------------------------------------------------------------

export function useTradeChat(engagementId: string | null) {
  const [chat, setChat] = useState<TradeChat | null>(null);
  const [messages, setMessages] = useState<TradeMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [otherPartyOnline, setOtherPartyOnline] = useState(false);
  const [otherPartyLastSeen, setOtherPartyLastSeen] = useState<Date | null>(
    null
  );
  const [otherPartyTyping, setOtherPartyTyping] = useState(false);

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!engagementId) return;

    let mounted = true;

    const init = async () => {
      setIsLoading(true);

      // 1. Fetch chat room
      const { data: chatData, error: chatError } = await supabase
        .from('trade_chats')
        .select('*')
        .eq('engagement_id', engagementId)
        .single();

      if (chatError || !chatData || !mounted) {
        setIsLoading(false);
        return;
      }

      setChat(chatData as TradeChat);

      // 2. Fetch message history
      const { data: msgData } = await supabase
        .from('trade_messages')
        .select('*')
        .eq('chat_id', chatData.id)
        .order('created_at', { ascending: true });

      if (mounted) {
        setMessages((msgData as TradeMessage[]) ?? []);
        setIsLoading(false);
      }

      // 3. Get current user for presence
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user || !mounted) return;

      // 4. Subscribe: new messages + typing broadcast + presence
      const channel = supabase
        .channel(`trade-chat:${chatData.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'trade_messages',
            filter: `chat_id=eq.${chatData.id}`,
          },
          (payload) => {
            if (mounted) {
              setMessages((prev) => [...prev, payload.new as TradeMessage]);
            }
          }
        )
        .on('broadcast', { event: 'user_typing' }, (payload) => {
          if (!mounted || payload.payload?.userId === user.id) return;
          setOtherPartyTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(
            () => setOtherPartyTyping(false),
            3000
          );
        })
        .on('presence', { event: 'sync' }, () => {
          const state = channel.presenceState<{
            userId: string;
            lastSeen: string;
          }>();
          const others = Object.values(state)
            .flat()
            .filter((p) => p.userId !== user.id);
          setOtherPartyOnline(others.length > 0);
        })
        .on('presence', { event: 'leave' }, (payload) => {
          const left = (
            payload.leftPresences as unknown as Array<{
              userId: string;
              lastSeen: string;
            }>
          ).filter((p) => p.userId !== user.id);
          if (left.length > 0) {
            setOtherPartyLastSeen(new Date());
            setOtherPartyOnline(false);
          }
        })
        .subscribe(async (status) => {
          if (status === 'SUBSCRIBED') {
            await channel.track({
              userId: user.id,
              lastSeen: new Date().toISOString(),
            });
          }
        });

      return () => {
        channel.unsubscribe();
      };
    };

    const cleanup = init();

    return () => {
      mounted = false;
      cleanup.then((fn) => fn?.());
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [engagementId]);

  return {
    chat,
    messages,
    isLoading,
    otherPartyOnline,
    otherPartyLastSeen,
    otherPartyTyping,
  };
}

// ---------------------------------------------------------------------------
// useSendMessage
// ---------------------------------------------------------------------------

export function useSendMessage(chatId: string | null) {
  const [isSending, setIsSending] = useState(false);

  const sendText = useCallback(
    async (content: string) => {
      if (!chatId || !content.trim()) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setIsSending(true);
      try {
        await supabase.from('trade_messages').insert({
          chat_id: chatId,
          sender_id: user.id,
          content: content.trim(),
          message_type: 'text',
        });
      } finally {
        setIsSending(false);
      }
    },
    [chatId]
  );

  const sendAttachment = useCallback(
    async (file: File) => {
      if (!chatId) return;

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      setIsSending(true);
      try {
        const ext = file.name.split('.').pop();
        const path = `${chatId}/${Date.now()}_${crypto.randomUUID()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('chat-attachments')
          .upload(path, file);

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('chat-attachments')
          .getPublicUrl(path);

        const messageType = file.type.startsWith('image/') ? 'image' : 'file';

        await supabase.from('trade_messages').insert({
          chat_id: chatId,
          sender_id: user.id,
          content: file.name,
          message_type: messageType,
          attachment_url: urlData.publicUrl,
        });
      } finally {
        setIsSending(false);
      }
    },
    [chatId]
  );

  return { sendText, sendAttachment, isSending };
}

// ---------------------------------------------------------------------------
// useTypingIndicator
// Broadcasts ephemeral typing events to the channel (no DB write).
// ---------------------------------------------------------------------------

export function useTypingIndicator(chatId: string | null) {
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!chatId) return;
    channelRef.current = supabase.channel(`trade-chat:${chatId}`);
    return () => {
      channelRef.current?.unsubscribe();
    };
  }, [chatId]);

  const setTyping = useCallback(
    async (isTyping: boolean) => {
      if (!chatId || !isTyping) return;
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      await channelRef.current?.send({
        type: 'broadcast',
        event: 'user_typing',
        payload: { userId: user.id },
      });
    },
    [chatId]
  );

  return { setTyping };
}

// ---------------------------------------------------------------------------
// useMarkAsRead
// Marks all unread messages in a chat as read for the current user.
// ---------------------------------------------------------------------------

export function useMarkAsRead(chatId: string | null) {
  const markRead = useCallback(async () => {
    if (!chatId) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase
      .from('trade_messages')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('chat_id', chatId)
      .eq('is_read', false)
      .neq('sender_id', user.id);
  }, [chatId]);

  return { markRead };
}

// ---------------------------------------------------------------------------
// useUnreadCount
// Subscribes to unread message counts across all chats for the current user.
// ---------------------------------------------------------------------------

export function useUnreadCount(userId: string | null) {
  const [totalUnread, setTotalUnread] = useState(0);
  const [unreadByChatId, setUnreadByChatId] = useState<Record<string, number>>(
    {}
  );
  const [unreadByEngagementId, setUnreadByEngagementId] = useState<
    Record<string, number>
  >({});

  const refresh = useCallback(async () => {
    if (!userId) return;

    // Get all chats the user belongs to, including engagement_id for mapping
    const { data: chats } = await supabase
      .from('trade_chats')
      .select('id, engagement_id')
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`);

    if (!chats || chats.length === 0) {
      setTotalUnread(0);
      setUnreadByChatId({});
      setUnreadByEngagementId({});
      return;
    }

    const chatIds = chats.map((c) => c.id);
    const engagementById: Record<string, string> = Object.fromEntries(
      chats.map((c) => [c.id, c.engagement_id])
    );

    const { data: unreadMsgs } = await supabase
      .from('trade_messages')
      .select('chat_id')
      .in('chat_id', chatIds)
      .eq('is_read', false)
      .neq('sender_id', userId);

    if (!unreadMsgs) return;

    const countsByChatId: Record<string, number> = {};
    const countsByEngagementId: Record<string, number> = {};

    for (const msg of unreadMsgs) {
      countsByChatId[msg.chat_id] = (countsByChatId[msg.chat_id] ?? 0) + 1;
      const engId = engagementById[msg.chat_id];
      if (engId) {
        countsByEngagementId[engId] = (countsByEngagementId[engId] ?? 0) + 1;
      }
    }

    setUnreadByChatId(countsByChatId);
    setUnreadByEngagementId(countsByEngagementId);
    setTotalUnread(Object.values(countsByChatId).reduce((a, b) => a + b, 0));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    refresh();

    // Re-fetch when any message is inserted or updated (read status change)
    const channel = supabase
      .channel(`unread-count:${userId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trade_messages' },
        refresh
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [userId, refresh]);

  return { totalUnread, unreadByChatId, unreadByEngagementId };
}

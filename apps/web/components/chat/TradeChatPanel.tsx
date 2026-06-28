'use client';

import { ChevronDown } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  useMarkAsRead,
  useSendMessage,
  useTradeChat,
  useTypingIndicator,
} from '@/hooks/use-chat';
import { ChatInput } from './ChatInput';
import { ChatMessage } from './ChatMessage';
import { OnlineStatusDot } from './OnlineStatusDot';
import { TypingIndicator } from './TypingIndicator';

interface TradeChatPanelProps {
  engagementId: string;
  currentUserId: string;
}

export function TradeChatPanel({
  engagementId,
  currentUserId,
}: TradeChatPanelProps) {
  const {
    chat,
    messages,
    isLoading,
    otherPartyOnline,
    otherPartyLastSeen,
    otherPartyTyping,
  } = useTradeChat(engagementId);

  const { sendText, sendAttachment, isSending } = useSendMessage(
    chat?.id ?? null
  );
  const { setTyping } = useTypingIndicator(chat?.id ?? null);
  const { markRead } = useMarkAsRead(chat?.id ?? null);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [showJumpToBottom, setShowJumpToBottom] = useState(false);
  const isAtBottomRef = useRef(true);

  // Mark messages as read when panel is open
  useEffect(() => {
    if (chat?.id) markRead();
  }, [chat?.id, messages.length, markRead]);

  // Auto-scroll to bottom on new messages (only if already at bottom)
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    if (isAtBottomRef.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, otherPartyTyping]);

  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 60;
    isAtBottomRef.current = atBottom;
    setShowJumpToBottom(!atBottom);
  }, []);

  const scrollToBottom = () => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col h-[480px] border border-border/50 rounded-lg overflow-hidden bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30 shrink-0">
        <span className="text-sm font-medium text-foreground">Trade Chat</span>
        <OnlineStatusDot
          online={otherPartyOnline}
          lastSeen={otherPartyLastSeen}
        />
      </div>

      {/* Message list */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 py-3 space-y-1"
      >
        {isLoading && (
          <div className="flex justify-center py-8">
            <span className="text-sm text-muted-foreground">
              Loading messages…
            </span>
          </div>
        )}

        {!isLoading && messages.length === 0 && (
          <div className="flex justify-center py-8">
            <span className="text-sm text-muted-foreground">
              Send a message to start the conversation.
            </span>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            currentUserId={currentUserId}
          />
        ))}

        {otherPartyTyping && <TypingIndicator />}
      </div>

      {/* Jump to bottom button */}
      {showJumpToBottom && (
        <div className="absolute bottom-20 right-6">
          <Button
            size="icon"
            variant="outline"
            className="rounded-full shadow-md"
            onClick={scrollToBottom}
          >
            <ChevronDown className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Input */}
      <ChatInput
        onSendText={sendText}
        onSendAttachment={sendAttachment}
        onTyping={() => setTyping(true)}
        isSending={isSending}
        disabled={!chat}
      />
    </div>
  );
}

'use client';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { TradeMessage } from '@/lib/types/chat';
import { cn } from '@/lib/utils';

interface ChatMessageProps {
  message: TradeMessage;
  currentUserId: string;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ChatMessage({ message, currentUserId }: ChatMessageProps) {
  const isSystem = message.message_type === 'system';
  const isMine = message.sender_id === currentUserId;

  // System message — centered, italic, muted
  if (isSystem) {
    return (
      <div className="flex justify-center my-2">
        <span className="text-xs text-muted-foreground italic px-3 py-1 bg-muted/40 rounded-full">
          {message.content}
        </span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-end gap-2 my-1',
        isMine ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar — only for received messages */}
      {!isMine && (
        <Avatar className="w-7 h-7 shrink-0">
          <AvatarFallback className="text-xs bg-muted">?</AvatarFallback>
        </Avatar>
      )}

      <div
        className={cn(
          'flex flex-col gap-1 max-w-[70%]',
          isMine ? 'items-end' : 'items-start'
        )}
      >
        {/* Bubble */}
        <div
          className={cn(
            'px-3 py-2 rounded-2xl text-sm break-words',
            isMine
              ? 'bg-emerald-600 text-white rounded-br-sm'
              : 'bg-muted text-foreground rounded-bl-sm'
          )}
        >
          {message.message_type === 'image' && message.attachment_url ? (
            <img
              src={message.attachment_url}
              alt="attachment"
              className="max-w-[200px] rounded-lg"
            />
          ) : message.message_type === 'file' && message.attachment_url ? (
            <a
              href={message.attachment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2"
            >
              📎 {message.content}
            </a>
          ) : (
            message.content
          )}
        </div>

        {/* Timestamp + read receipt */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-muted-foreground">
            {formatTime(message.created_at)}
          </span>
          {isMine && (
            <span className="text-[10px] text-muted-foreground">
              {message.is_read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

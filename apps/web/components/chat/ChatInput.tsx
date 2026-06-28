'use client';

import { Paperclip, Send, X } from 'lucide-react';
import {
  type ChangeEvent,
  type KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface ChatInputProps {
  onSendText: (content: string) => Promise<void>;
  onSendAttachment: (file: File) => Promise<void>;
  onTyping?: () => void;
  isSending: boolean;
  disabled?: boolean;
}

const ACCEPTED = 'image/png,image/jpeg,image/webp,application/pdf';

export function ChatInput({
  onSendText,
  onSendAttachment,
  onTyping,
  isSending,
  disabled,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<{ file: File; url: string } | null>(
    null
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = useCallback(async () => {
    if (isSending || disabled) return;

    if (preview) {
      await onSendAttachment(preview.file);
      setPreview(null);
      return;
    }

    if (!text.trim()) return;
    await onSendText(text);
    setText('');

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [isSending, disabled, preview, text, onSendText, onSendAttachment]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    onTyping?.();
    // Auto-resize up to 4 rows
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.min(e.target.scrollHeight, 96)}px`;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = file.type.startsWith('image/') ? URL.createObjectURL(file) : '';
    setPreview({ file, url });
    // Reset input so the same file can be picked again
    e.target.value = '';
  };

  const cancelPreview = () => {
    if (preview?.url) URL.revokeObjectURL(preview.url);
    setPreview(null);
  };

  const isDisabled = isSending || disabled;

  return (
    <div className="flex flex-col gap-2 p-3 border-t border-border/50 bg-background">
      {/* Attachment preview */}
      {preview && (
        <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-sm">
          {preview.url ? (
            <img
              src={preview.url}
              alt="preview"
              className="h-12 w-12 object-cover rounded"
            />
          ) : (
            <span className="text-muted-foreground">
              📎 {preview.file.name}
            </span>
          )}
          <button
            type="button"
            onClick={cancelPreview}
            className="ml-auto text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2">
        {/* Attachment button */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="shrink-0 text-muted-foreground hover:text-emerald-600"
          disabled={isDisabled}
          onClick={() => fileRef.current?.click()}
        >
          <Paperclip className="w-4 h-4" />
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text input */}
        <Textarea
          ref={textareaRef}
          value={text}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          placeholder="Type a message… (Enter to send)"
          rows={1}
          disabled={isDisabled || !!preview}
          className="resize-none min-h-[40px] max-h-24 flex-1 text-sm"
        />

        {/* Send button */}
        <Button
          type="button"
          size="icon"
          className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
          disabled={isDisabled || (!text.trim() && !preview)}
          onClick={handleSend}
        >
          {isSending ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

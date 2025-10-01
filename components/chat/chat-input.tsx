import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Paperclip, Send, Smile } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

interface ChatInputProps {
  message: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onFileUpload: () => void;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  uploadedFilesCount: number;
  isSending?: boolean; // 전송 중 상태 추가
}

export const ChatInput: React.FC<ChatInputProps> = ({
  message,
  onMessageChange,
  onSendMessage,
  onFileUpload,
  fileInputRef,
  onFileChange,
  isUploading,
  uploadProgress,
  uploadedFilesCount,
  isSending = false // 기본값 false
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = useState(false); // IME 입력 중 상태

  useEffect(() => {
    if (!showEmojiPicker) return;
    
    function handleClickOutside(event: MouseEvent) {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // 전송 중이거나 업로드 중이면 키보드 이벤트 무시
    if (isSending || isUploading) {
      return;
    }
    
    // IME 입력 중이면 Enter 키 무시
    if (isComposing) {
      return;
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };

  const handleCompositionEnd = () => {
    setIsComposing(false);
  };

  const isSendDisabled = isSending || isUploading || (uploadedFilesCount > 0 && Object.values(uploadProgress).some(v => v < 100));

  return (
    <div className="p-3 border-t">
      <div className="flex items-end gap-2">
        <div className="flex gap-2 relative">
          <Button variant="ghost" size="icon" onClick={onFileUpload}>
            <Paperclip className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowEmojiPicker(v => !v)}
          >
            <Smile className="h-5 w-5" />
          </Button>
          
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              style={{ 
                position: 'absolute', 
                right: 0, 
                bottom: 48, 
                zIndex: 100, 
                boxShadow: '0 4px 16px rgba(0,0,0,0.15)', 
                borderRadius: 12, 
                overflow: 'hidden' 
              }}
            >
              <Picker
                data={data}
                onEmojiSelect={(emoji: any) => onMessageChange(message + emoji.native)}
                theme="light"
                previewPosition="none"
                perLine={8}
                maxFrequentRows={1}
              />
            </div>
          )}
        </div>
        
        <Textarea
          placeholder="메시지를 입력하세요..."
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          className="flex-1 min-h-[40px] resize-none"
          onKeyDown={handleKeyDown}
          onCompositionStart={handleCompositionStart}
          onCompositionEnd={handleCompositionEnd}
        />
        
        <Button 
          size="icon" 
          onClick={onSendMessage} 
          disabled={isSendDisabled}
        >
          <Send className="h-5 w-5" />
        </Button>
      </div>
      
      {/* 숨겨진 파일 입력 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        multiple
        accept="*/*"
      />
    </div>
  );
}; 
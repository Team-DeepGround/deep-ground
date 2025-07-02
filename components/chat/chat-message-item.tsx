import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatMessage, MemberInfo, MediaInfo } from '@/types/chat';
import { formatMessageTime, isImageFile, calculateUnreadCount } from '@/lib/chat-utils';

interface ChatMessageItemProps {
  message: ChatMessage;
  memberInfos: MemberInfo[];
  currentMemberId: number | null;
  isMe: boolean;
  senderName: string;
  showDateSeparator: boolean;
  dateSeparatorText: string;
  mediaInfos: Record<string, string>;
  onImageLoad?: () => void;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  memberInfos,
  currentMemberId,
  isMe,
  senderName,
  showDateSeparator,
  dateSeparatorText,
  mediaInfos,
  onImageLoad
}) => {
  // 읽지 않은 메시지 수 계산
  const unreadCount = calculateUnreadCount(message, memberInfos, message.senderId);
  const showUnreadCount = unreadCount > 0;

  return (
    <React.Fragment>
      {showDateSeparator && (
        <div className="flex items-center justify-center my-4">
          <div className="bg-muted-foreground/10 text-muted-foreground px-3 py-1 rounded-lg text-sm">
            {dateSeparatorText}
          </div>
        </div>
      )}
      <div className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
        {!isMe && (
          <Avatar className="h-8 w-8 mr-2">
            <AvatarImage src="/placeholder.svg" alt={senderName} />
            <AvatarFallback>{senderName[0]}</AvatarFallback>
          </Avatar>
        )}

        {/* 내가 보낸 메시지의 읽지 않은 수 (말풍선 왼쪽) */}
        {isMe && showUnreadCount && (
          <span className="text-xs text-muted-foreground mr-1.5 self-end">
            {unreadCount}
          </span>
        )}

        <div
          className={`max-w-[70%] px-4 py-2 rounded-lg ${
            isMe ? "bg-primary text-primary-foreground" : "bg-muted"
          } flex flex-col`}
        >
          {!isMe && (
            <p className="text-xs font-medium mb-1">{senderName}</p>
          )}
          <p>{message.message}</p>

          {/* 미디어 렌더링 */}
          {message.mediaIds && message.media && Array.isArray(message.media) && 
           message.mediaIds.length === message.media.length && (
            <div className="mt-2 space-y-2">
              {message.mediaIds.map((id, idx) => {
                const mediaUrl = mediaInfos[id];
                const mediaArray = message.media as MediaInfo[];
                const info = mediaArray[idx];
                
                if (!info || !mediaUrl) return <div key={id}>로딩중...</div>;
                
                if (isImageFile(info.extension)) {
                  return (
                    <div key={id} className="mt-2">
                      <img
                        src={mediaUrl}
                        alt={info.fileName}
                        className="max-w-full rounded-md cursor-pointer hover:opacity-90"
                        onLoad={onImageLoad}
                      />
                      <div className="text-xs mt-1 flex justify-between">
                        <span>{info.fileName}</span>
                        <span>{(info.fileSize / 1024).toFixed(1)}KB</span>
                      </div>
                    </div>
                  );
                }
                
                // 파일 다운로드 시 확장자 중복 방지
                let downloadName = info.fileName;
                if (info.extension && !info.fileName.toLowerCase().endsWith('.' + info.extension.toLowerCase())) {
                  downloadName += '.' + info.extension;
                }
                
                return (
                  <a
                    key={id}
                    href={mediaUrl}
                    download={downloadName}
                    className="flex items-center gap-2 p-2 rounded-md bg-accent text-black border border-gray-300"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="text-sm">{info.fileName}</span>
                    <span className="text-xs">{(info.fileSize / 1024).toFixed(1)}KB</span>
                  </a>
                );
              })}
            </div>
          )}

          <div
            className={`text-xs mt-1 flex justify-end items-center gap-1 ${
              isMe ? "text-primary-foreground/70" : "text-muted-foreground"
            }`}
          >
            {formatMessageTime(message.createdAt)}
          </div>
        </div>

        {/* 상대방이 보낸 메시지의 읽지 않은 수 (말풍선 오른쪽) */}
        {!isMe && showUnreadCount && (
          <span className="text-xs text-muted-foreground ml-1.5 self-end">
            {unreadCount}
          </span>
        )}
      </div>
    </React.Fragment>
  );
}; 
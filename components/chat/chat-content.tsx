import React from 'react';
import { ChatHeader } from './chat-header';
import { ChatMessages } from './chat-messages';
import { ChatFileUpload } from './chat-file-upload';
import { ChatInput } from './chat-input';
import { FriendChatRoom, StudyGroupChatRoom, MemberInfo, ChatMessage, UploadingFile } from '@/types/chat';

interface ChatContentProps {
  selectedChatRoom: FriendChatRoom | StudyGroupChatRoom | null;
  displayMessages: ChatMessage[];
  displayMemberInfos: MemberInfo[];
  currentChatHasNext: boolean;
  currentChatIsLoading: boolean;
  isChatContentVisible: boolean;
  showNewMessageToast: boolean;
  mediaInfos: Record<string, { url: string; contentType: string; fileName: string; fileSize: number; }>;
  scrollableDivRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  uploadedFiles: UploadingFile[];
  message: string;
  isUploading: boolean;
  uploadProgress: Record<string, number>;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onLoadMoreMessages: () => void;
  onNewMessageClick: () => void;
  onRemoveFile: (index: number) => void;
  onFileUpload: () => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onImageLoad?: () => void;
}

export const ChatContent: React.FC<ChatContentProps> = ({
  selectedChatRoom,
  displayMessages,
  displayMemberInfos,
  currentChatHasNext,
  currentChatIsLoading,
  isChatContentVisible,
  showNewMessageToast,
  mediaInfos,
  scrollableDivRef,
  messagesEndRef,
  uploadedFiles,
  message,
  isUploading,
  uploadProgress,
  fileInputRef,
  onLoadMoreMessages,
  onNewMessageClick,
  onRemoveFile,
  onFileUpload,
  onFileChange,
  onMessageChange,
  onSendMessage,
  onImageLoad
}) => {
  return (
    <div className="flex-1 flex flex-col relative">
      {selectedChatRoom && (
        <>
          <ChatHeader
            selectedChatRoom={selectedChatRoom}
            displayMemberInfos={displayMemberInfos}
          />
          
          <ChatMessages
            selectedChatRoom={selectedChatRoom}
            displayMessages={displayMessages}
            displayMemberInfos={displayMemberInfos}
            currentChatHasNext={currentChatHasNext}
            currentChatIsLoading={currentChatIsLoading}
            isChatContentVisible={isChatContentVisible}
            showNewMessageToast={showNewMessageToast}
            mediaInfos={mediaInfos}
            scrollableDivRef={scrollableDivRef}
            messagesEndRef={messagesEndRef}
            onLoadMoreMessages={onLoadMoreMessages}
            onNewMessageClick={onNewMessageClick}
            onImageLoad={onImageLoad}
          />
          
          <ChatFileUpload
            uploadedFiles={uploadedFiles}
            onRemoveFile={onRemoveFile}
          />
          
          <ChatInput
            message={message}
            onMessageChange={onMessageChange}
            onSendMessage={onSendMessage}
            onFileUpload={onFileUpload}
            fileInputRef={fileInputRef}
            onFileChange={onFileChange}
            isUploading={isUploading}
            uploadProgress={uploadProgress}
            uploadedFilesCount={uploadedFiles.length}
          />
        </>
      )}
      
      {!selectedChatRoom && (
        <ChatMessages
          selectedChatRoom={null}
          displayMessages={[]}
          displayMemberInfos={[]}
          currentChatHasNext={false}
          currentChatIsLoading={false}
          isChatContentVisible={true}
          showNewMessageToast={false}
          mediaInfos={{}}
          scrollableDivRef={scrollableDivRef}
          messagesEndRef={messagesEndRef}
          onLoadMoreMessages={() => {}}
          onNewMessageClick={() => {}}
        />
      )}
    </div>
  );
}; 
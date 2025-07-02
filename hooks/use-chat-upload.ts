import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { uploadFiles } from '@/lib/api/chat';
import { UploadingFile } from '@/types/chat';

export const useChatUpload = (selectedChatRoom: any) => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<UploadingFile[]>([]);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [isUploading, setIsUploading] = useState(false);

  // selectedChatRoom 변경 시 업로드 상태 초기화
  useEffect(() => {
    setUploadedFiles([]);
    setUploadProgress({});
  }, [selectedChatRoom]);

  // 파일 업로드 클릭 핸들러
  const handleFileUpload = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 파일 변경 핸들러
  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files);
      for (const file of newFiles) {
        const uploadingFile: UploadingFile = { file, progress: 0, status: 'uploading' };
        setUploadedFiles(prev => [...prev, uploadingFile]);
        
        try {
          console.log(`[UPLOAD] ${file.name} 업로드 시작`);
          const formData = new FormData();
          formData.append('files', file);
          
          const mediaIds = await uploadFiles(
            selectedChatRoom?.chatRoomId,
            [file],
            (progress) => {
              setUploadedFiles(prev => prev.map(f =>
                (f.file.name === file.name && f.file.size === file.size) 
                  ? { ...f, progress: progress[`${file.name}-0`] || 0 } 
                  : f
              ));
              console.log(`[UPLOAD] ${file.name} 진행률: ${progress[`${file.name}-0`] || 0}%`);
            }
          );
          
          const mediaId = mediaIds[0];
          setUploadedFiles(prev => prev.map(f =>
            (f.file.name === file.name && f.file.size === file.size) 
              ? { ...f, progress: 100, status: 'done', mediaId } 
              : f
          ));
          console.log(`[UPLOAD] ${file.name} 업로드 완료, mediaId: ${mediaId}`);
        } catch (error) {
          setUploadedFiles(prev => prev.map(f =>
            (f.file.name === file.name && f.file.size === file.size) 
              ? { ...f, status: 'error' } 
              : f
          ));
          console.log(`[UPLOAD] ${file.name} 업로드 실패`, error);
          toast({
            title: '파일 업로드 실패',
            description: `${file.name} 업로드에 실패했습니다.`,
            variant: 'destructive',
          });
        }
      }
    }
    if (e.target) {
      e.target.value = "";
    }
  }, [selectedChatRoom, toast]);

  // 파일 제거 핸들러
  const removeFile = useCallback((index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  }, []);

  // 메시지 전송용 파일 업로드
  const uploadFilesForMessage = useCallback(async (files: File[]): Promise<string[]> => {
    if (!selectedChatRoom?.chatRoomId) {
      throw new Error('채팅방이 선택되지 않았습니다.');
    }
    
    setIsUploading(true);
    try {
      const mediaIds = await uploadFiles(
        selectedChatRoom.chatRoomId,
        files,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      return mediaIds;
    } finally {
      setIsUploading(false);
    }
  }, [selectedChatRoom]);

  // 업로드된 파일 초기화
  const clearUploadedFiles = useCallback(() => {
    setUploadedFiles([]);
    setUploadProgress({});
  }, []);

  return {
    // refs
    fileInputRef,
    
    // 상태
    uploadedFiles,
    uploadProgress,
    isUploading,
    
    // 액션
    handleFileUpload,
    handleFileChange,
    removeFile,
    uploadFilesForMessage,
    clearUploadedFiles,
  };
}; 
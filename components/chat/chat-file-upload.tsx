import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Paperclip, X } from 'lucide-react';
import { UploadingFile } from '@/types/chat';

interface ChatFileUploadProps {
  uploadedFiles: UploadingFile[];
  onRemoveFile: (index: number) => void;
}

export const ChatFileUpload: React.FC<ChatFileUploadProps> = ({
  uploadedFiles,
  onRemoveFile
}) => {
  if (uploadedFiles.length === 0) return null;

  return (
    <div className="p-3 border-t border-b max-h-[150px] overflow-y-auto">
      <div className="text-sm font-medium mb-2">업로드할 파일 ({uploadedFiles.length})</div>
      <div className="space-y-2">
        {uploadedFiles.map((f, index) => (
          <div key={index} className="flex items-center justify-between bg-accent/50 p-2 rounded-md">
            <div className="flex items-center gap-2 overflow-hidden min-w-0">
              <Paperclip className="h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate max-w-[160px] block">{f.file.name}</span>
              <span className="text-xs text-muted-foreground">
                {typeof f.file.size === 'number' ? (f.file.size / 1024).toFixed(1) : ''}KB
              </span>
            </div>
            <div className="flex items-center gap-2">
              {f.status === 'uploading' ? (
                <Progress value={f.progress} className="w-20 h-2" />
              ) : f.status === 'done' ? (
                <Button variant="ghost" size="icon" onClick={() => onRemoveFile(index)}>
                  <X className="h-4 w-4" />
                </Button>
              ) : (
                <span className="text-xs text-red-500">실패</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}; 
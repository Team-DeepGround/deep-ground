import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import FileUpload from "@/components/file-upload";
import { MarkdownRenderer } from "@/components/ui/markdown-renderer";
import { MarkdownToolbar } from "@/components/ui/markdown-toolbar";
import { X } from "lucide-react";
import { useState, useRef } from "react";

interface AnswerFormProps {
  answerContent: string;
  setAnswerContent: (content: string) => void;
  uploadedImages: File[];
  handleImageUpload: (files: File[]) => void;
  removeImage: (index: number) => void;
  handleSubmitAnswer: () => void;
  loading: boolean;
}

export default function AnswerForm({ 
  answerContent, 
  setAnswerContent, 
  uploadedImages, 
  handleImageUpload, 
  removeImage, 
  handleSubmitAnswer, 
  loading 
}: AnswerFormProps) {
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = "", placeholder: string = "텍스트") => {
    try {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const selectedText = answerContent.substring(start, end);
      const text = selectedText || placeholder;
      
      const newText = answerContent.substring(0, start) + before + text + after + answerContent.substring(end);
      setAnswerContent(newText);
      
      // 커서 위치 조정
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newCursorPos = start + before.length + text.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    } catch (error) {
      console.error('마크다운 삽입 중 오류:', error);
      // 에러 발생 시에도 계속 진행할 수 있도록 함
    }
  };
  return (
    <Card>
      <CardHeader>
        <div className="font-bold text-lg">답변 작성하기</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2 mb-2">
          <Button
            type="button"
            variant={!showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(false)}
          >
            작성
          </Button>
          <Button
            type="button"
            variant={showPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setShowPreview(true)}
          >
            미리보기
          </Button>
        </div>
        
        {showPreview ? (
          <div className="min-h-[150px] border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
            {answerContent ? (
              <MarkdownRenderer content={answerContent} />
            ) : (
              <div className="text-muted-foreground italic">
                미리보기할 내용이 없습니다.
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            <MarkdownToolbar onInsert={insertMarkdown} />
            <Textarea
              ref={textareaRef}
              placeholder="답변을 마크다운 형식으로 작성해주세요... (위의 버튼들을 사용하면 쉽게 마크다운을 작성할 수 있습니다!)"
              value={answerContent}
              onChange={(e) => setAnswerContent(e.target.value)}
              rows={6}
              className="font-mono text-sm"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="answer-images">이미지 첨부</Label>
          <FileUpload
            onFilesSelect={handleImageUpload}
            accept="image/*"
            maxSize={5}
            multiple={true}
            buttonText="이미지 선택"
          />
          {uploadedImages.length > 0 && (
            <div className="mt-4 space-y-2">
              <Label htmlFor="uploaded-image-list">첨부된 이미지 ({uploadedImages.length})</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {uploadedImages.map((image: File, index: number) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Uploaded ${index + 1}`}
                      className="h-24 w-full object-cover rounded-md"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeImage(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                    <p className="text-xs truncate mt-1">{image.name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-end">
        <Button onClick={handleSubmitAnswer} disabled={loading}>답변 등록하기</Button>
      </CardFooter>
    </Card>
  );
} 
"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownRenderer } from "./markdown-renderer";
import { MarkdownToolbar } from "./markdown-toolbar";
import { Eye, Edit3 } from "lucide-react";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "마크다운으로 작성하세요...",
  rows = 10,
  className = ""
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertMarkdown = (before: string, after: string = "", placeholder: string = "텍스트") => {
    try {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const selectedText = value.substring(start, end);
      const text = selectedText || placeholder;
      
      const newText = value.substring(0, start) + before + text + after + value.substring(end);
      onChange(newText);
      
      // 커서 위치 조정
      setTimeout(() => {
        if (textarea) {
          textarea.focus();
          const newCursorPos = start + before.length + text.length;
          textarea.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    } catch (error) {
      // 에러 발생 시에도 계속 진행할 수 있도록 함
    }
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex items-center justify-between mb-2">
          <TabsList className="grid w-[200px] grid-cols-2">
            <TabsTrigger value="write" className="flex items-center gap-2">
              <Edit3 className="h-4 w-4" />
              작성
            </TabsTrigger>
            <TabsTrigger value="preview" className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              미리보기
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="write" className="space-y-3">
          <MarkdownToolbar onInsert={insertMarkdown} />
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className="min-h-[200px] font-mono text-sm"
          />
        </TabsContent>

        <TabsContent value="preview" className="space-y-2">
          <div className="min-h-[200px] border rounded-md">
            {value ? (
              <MarkdownRenderer content={value} />
            ) : (
              <div className="text-muted-foreground italic p-4">
                미리보기할 내용이 없습니다. 작성 탭에서 내용을 입력해주세요.
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

"use client";

import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Code, 
  Type, 
  List, 
  Link, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Minus,
  CheckSquare,
  Table,
  Image,
  HelpCircle
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MarkdownToolbarProps {
  onInsert: (before: string, after?: string, placeholder?: string) => void;
  className?: string;
}

export function MarkdownToolbar({ onInsert, className = "" }: MarkdownToolbarProps) {
  const toolbarItems = [
    {
      icon: Bold,
      label: "굵게",
      shortcut: "Ctrl+B",
      action: () => onInsert("**", "**", "굵은 텍스트"),
      group: "text"
    },
    {
      icon: Italic,
      label: "기울임",
      shortcut: "Ctrl+I", 
      action: () => onInsert("*", "*", "기울임 텍스트"),
      group: "text"
    },
    {
      icon: Code,
      label: "인라인 코드",
      shortcut: "Ctrl+`",
      action: () => onInsert("`", "`", "코드"),
      group: "code"
    },
    {
      icon: Type,
      label: "코드 블록",
      shortcut: "Ctrl+Shift+`",
      action: () => onInsert("```\n", "\n```", "코드 블록"),
      group: "code"
    },
    {
      icon: Heading1,
      label: "제목 1",
      shortcut: "Ctrl+1",
      action: () => onInsert("# ", "", "제목"),
      group: "heading"
    },
    {
      icon: Heading2,
      label: "제목 2", 
      shortcut: "Ctrl+2",
      action: () => onInsert("## ", "", "제목"),
      group: "heading"
    },
    {
      icon: Heading3,
      label: "제목 3",
      shortcut: "Ctrl+3", 
      action: () => onInsert("### ", "", "제목"),
      group: "heading"
    },
    {
      icon: List,
      label: "순서없는 목록",
      shortcut: "Ctrl+Shift+8",
      action: () => onInsert("- ", "", "목록 항목"),
      group: "list"
    },
    {
      icon: Heading1, // 숫자 목록 아이콘으로 재사용
      label: "순서있는 목록",
      shortcut: "Ctrl+Shift+7",
      action: () => onInsert("1. ", "", "목록 항목"),
      group: "list"
    },
    {
      icon: CheckSquare,
      label: "체크박스",
      shortcut: "Ctrl+Shift+9",
      action: () => onInsert("- [ ] ", "", "체크박스 항목"),
      group: "list"
    },
    {
      icon: Link,
      label: "링크",
      shortcut: "Ctrl+K",
      action: () => onInsert("[", "](URL)", "링크 텍스트"),
      group: "media"
    },
    {
      icon: Image,
      label: "이미지",
      shortcut: "Ctrl+Shift+I",
      action: () => onInsert("![", "](이미지URL)", "이미지 설명"),
      group: "media"
    },
    {
      icon: Quote,
      label: "인용구",
      shortcut: "Ctrl+Shift+>",
      action: () => onInsert("> ", "", "인용문"),
      group: "text"
    },
    {
      icon: Minus,
      label: "구분선",
      shortcut: "Ctrl+Shift+-",
      action: () => onInsert("\n---\n", "", ""),
      group: "text"
    },
    {
      icon: Table,
      label: "테이블",
      shortcut: "Ctrl+Shift+T",
      action: () => onInsert("\n| 헤더 1 | 헤더 2 |\n|--------|--------|\n| 셀 1   | 셀 2   |\n", "", ""),
      group: "table"
    }
  ];

  const groupedItems = toolbarItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {} as Record<string, typeof toolbarItems>);

  const groupLabels = {
    text: "텍스트",
    code: "코드", 
    heading: "제목",
    list: "목록",
    media: "미디어",
    table: "표"
  };

  return (
    <TooltipProvider>
      <div className={`border rounded-md p-2 bg-gray-50 dark:bg-gray-800 ${className}`}>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <HelpCircle className="h-3 w-3" />
            <span>마크다운 툴바</span>
          </div>
          <div className="text-xs text-muted-foreground">
            💡 버튼 클릭으로 쉽게 작성
          </div>
        </div>
        
        <div className="flex flex-wrap gap-1">
          {toolbarItems.map((item, index) => (
            <Tooltip key={index}>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={item.action}
                  className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <item.icon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <div className="text-center">
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground">{item.shortcut}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    </TooltipProvider>
  );
}

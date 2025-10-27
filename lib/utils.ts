import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

/**
 * 날짜를 읽기 쉬운 형태로 포맷팅하는 함수
 * @param dateString - ISO 날짜 문자열 또는 Date 객체
 * @returns 포맷팅된 날짜 문자열
 */
export function formatReadableDate(dateString: string | Date): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  // 오늘 작성된 경우
  if (diffDays === 1) {
    return '오늘';
  }
  
  // 어제 작성된 경우
  if (diffDays === 2) {
    return '어제';
  }
  
  // 7일 이내
  if (diffDays <= 7) {
    return `${diffDays - 1}일 전`;
  }
  
  // 7일 이상 - 한국어 형식으로 표시
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 올해가 아닌 경우 연도 표시
  if (year !== now.getFullYear()) {
    return `${year}년 ${month}월 ${day}일`;
  }
  return `${month}월 ${day}일`;
}

/**
 * 날짜와 시간을 함께 표시하는 함수
 * @param dateString - ISO 날짜 문자열 또는 Date 객체
 * @returns 날짜와 시간이 포함된 문자열
 */
export function formatDateTime(dateString: string | Date): string {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  
  // 오늘 작성된 경우
  if (diffDays === 1) {
    return `오늘 ${hours}:${minutes}`;
  }
  
  // 어제 작성된 경우
  if (diffDays === 2) {
    return `어제 ${hours}:${minutes}`;
  }
  
  // 7일 이내
  if (diffDays <= 7) {
    return `${diffDays - 1}일 전 ${hours}:${minutes}`;
  }
  
  // 7일 이상
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // 올해가 아닌 경우 연도 표시
  if (year !== now.getFullYear()) {
    return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
  }
  return `${month}월 ${day}일 ${hours}:${minutes}`;
}

/**
 * 내용이 마크다운 형식인지 확인하는 함수
 * @param content - 확인할 내용
 * @returns 마크다운이 포함되어 있으면 true
 */
export function isMarkdownContent(content: string): boolean {
  if (!content) return false;
  
  // 마크다운 문법 패턴들
  const markdownPatterns = [
    /^#{1,6}\s/m,              // 헤딩 (#, ##, ###)
    /\*\*.*?\*\*/,             // 볼드 (**text**)
    /\*.*?\*/,                 // 기울임 (*text*)
    /`.*?`/,                   // 인라인 코드 (`code`)
    /```[\s\S]*?```/m,         // 코드 블록 (```code```)
    /\[.*?\]\(.*?\)/,         // 링크 ([text](url))
    /!\[.*?\]\(.*?\)/,        // 이미지 (![alt](url))
    /^- /m,                    // 리스트 (- item)
    /^\d+\. /m,                // 순서 리스트 (1. item)
    /> /,                      // 인용 (> text)
    /---/,                     // 수평선 (---)
    /^\|.*\|$/m,               // 테이블 (| col | col |)
  ];
  
  return markdownPatterns.some(pattern => pattern.test(content));
}

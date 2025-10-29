import { formatInTimeZone } from 'date-fns-tz';
import { ko } from 'date-fns/locale';
import { isToday, isYesterday } from 'date-fns';

// 날짜 비교 헬퍼 함수
export const isSameDay = (d1: Date, d2: Date): boolean => {
  // 이 함수는 이제 타임존 변환 후의 Date 객체를 비교하는 데 사용될 수 있습니다.
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

// 날짜 포맷 헬퍼 함수
export const formatDateForSeparator = (dateString: string): string => {
  // 서버에서 받은 UTC 문자열을 기준으로 Date 객체 생성
  const utcDate = new Date(dateString);

  // isToday, isYesterday는 시스템 로컬 시간을 기준으로 하므로,
  // 타임존 변환된 날짜와 비교하기 전에 먼저 KST 기준으로 날짜를 확인해야 합니다.
  // 하지만 date-fns-tz로 포맷팅하면 더 간단하고 정확합니다.
  const timeZone = 'Asia/Seoul';
  const kstDate = new Date(formatInTimeZone(utcDate, timeZone, "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"));

  if (isToday(kstDate)) {
    return "오늘";
  } else if (isYesterday(kstDate)) {
    return "어제";
  } else {
    return formatInTimeZone(utcDate, timeZone, 'yyyy년 M월 d일', { locale: ko });
  }
};

// 메시지 시간 포맷팅
export const formatMessageTime = (dateString: string): string => {
  const date = new Date(dateString);
  const timeZone = 'Asia/Seoul';
  // 'p'는 '오후 3:04'와 같은 로케일 기반 시간 형식을 제공합니다.
  // 'ko' 로케일을 전달하여 한국어(오전/오후)로 표시되도록 합니다.
  return formatInTimeZone(date, timeZone, 'p', { locale: ko });
};

// 파일 크기 포맷팅
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

// 이미지 파일 확장자 확인
export const isImageFile = (extension: string): boolean => {
  return /^jpg|jpeg|png|gif|bmp|webp|svg$/i.test(extension);
};

// 읽지 않은 메시지 수 계산
export const calculateUnreadCount = (
  message: any,
  memberInfos: any[],
  senderId: number
): number => {
  if (!memberInfos || !message) return 0;

  // 현재 메시지를 보낸 사람을 제외한 모든 멤버를 대상으로 읽음 여부를 확인
  const membersToCheckReadStatus = memberInfos.filter(m => m.memberId !== senderId);

  // 읽지 않은 멤버의 수를 계산
  const count = membersToCheckReadStatus.filter(m =>
    new Date(m.lastReadMessageTime).getTime() < new Date(message.createdAt).getTime()
  ).length;

  return count;
};

// 스크롤이 맨 아래에 있는지 확인
export const isScrolledToBottom = (element: HTMLElement, threshold: number = 10): boolean => {
  const { scrollTop, scrollHeight, clientHeight } = element;
  const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
  return distanceFromBottom <= threshold;
};

// 스크롤을 맨 아래로 이동
export const scrollToBottom = (element: HTMLElement, smooth: boolean = true): void => {
  if (smooth) {
    element.scrollTo({ top: element.scrollHeight, behavior: "smooth" });
  } else {
    element.scrollTop = element.scrollHeight;
  }
}; 
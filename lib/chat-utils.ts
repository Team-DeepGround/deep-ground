import { formatInTimeZone, toDate } from 'date-fns-tz';
import { ko } from 'date-fns/locale';

// 날짜 비교 헬퍼 함수
export const isSameDay = (d1: Date, d2: Date): boolean => {
  const timeZone = 'Asia/Seoul';
  // 각 날짜를 KST 기준으로 'yyyy-MM-dd' 문자열로 변환하여 비교
  const d1KST = formatInTimeZone(d1, timeZone, 'yyyy-MM-dd');
  const d2KST = formatInTimeZone(d2, timeZone, 'yyyy-MM-dd');
  return d1KST === d2KST;
};

// 날짜 포맷 헬퍼 함수
export const formatDateForSeparator = (dateString: string): string => {
  const timeZone = 'Asia/Seoul';
  const messageDate = toDate(dateString, { timeZone });
  const nowInKST = toDate(new Date(), { timeZone });

  const yesterdayInKST = new Date(nowInKST);
  yesterdayInKST.setDate(nowInKST.getDate() - 1);

  if (isSameDay(messageDate, nowInKST)) {
    return "오늘";
  } else if (isSameDay(messageDate, yesterdayInKST)) {
    return "어제";
  } else {
    return formatInTimeZone(messageDate, timeZone, 'yyyy년 M월 d일', { locale: ko });
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
// 날짜 비교 헬퍼 함수
export const isSameDay = (d1: Date, d2: Date): boolean => {
  return d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();
};

// 날짜 포맷 헬퍼 함수
export const formatDateForSeparator = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (isSameDay(date, today)) {
    return "오늘";
  } else if (isSameDay(date, yesterday)) {
    return "어제";
  } else {
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
};

// 메시지 시간 포맷팅
export const formatMessageTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
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
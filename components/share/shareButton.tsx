// components/HybridShareButton.tsx

'use client';

import { useState } from 'react';
import { toast } from 'sonner'; // alert 대신 toast를 사용하면 더 좋습니다.
import KakaoShareButton from './kakaoShareButton';
import { LinkIcon, Share2, Linkedin } from 'lucide-react';

// 1. 컴포넌트가 받을 props 타입을 먼저 정의합니다.
interface HybridShareButtonProps {
  shareUrl: string;
  shareTitle: string;
  shareText: string;
  shareImageUrl?: string; // 이미지는 필수가 아님 (선택적)
}

// 2. props를 받는 단일 컴포넌트로 정리합니다.
export default function HybridShareButton({
  shareUrl,
  shareTitle,
  shareText,
  shareImageUrl,
}: HybridShareButtonProps) {
  const [showDesktopIcons, setShowDesktopIcons] = useState(false);

  // 3. 내부에서 URL을 정하던 state와 useEffect는 제거합니다.
  //    모든 데이터는 props를 통해 외부에서 전달받습니다.

  const handleShare = async () => {
    // Web Share API가 지원되면 props로 받은 데이터를 사용해 공유합니다.
    if (navigator.share) {
      try {
        await navigator.share({
          url: shareUrl,
          title: shareTitle,
          text: shareText,
        });
      } catch (error) {
        console.log('사용자가 공유를 취소했습니다.');
      }
    } else {
      // 지원되지 않으면 데스크톱용 아이콘 목록을 보여줍니다. (토글 방식)
      setShowDesktopIcons(prev => !prev);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('링크가 클립보드에 복사되었습니다!');
    } catch (err) {
      toast.error('링크 복사에 실패했습니다.');
    }
  };

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
  // 게시물에 이미지가 없을 경우를 대비한 기본 로고 이미지
  const defaultImageUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/studen-logo.png`;

  return (
    // relative 클래스를 추가하여 아이콘 목록의 위치 기준으로 사용
    <div className="relative">
      <button
        onClick={handleShare}
        aria-label="공유하기"
        title="공유하기"
        className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-accent/50 transition-colors"
      >
        <Share2 className="h-4 w-4" />
      </button>

      {/* 데스크톱 공유 아이콘 목록 (팝업처럼 보이도록 스타일 수정) */}
      {showDesktopIcons && (
        <div className="absolute top-full mt-2 right-0 z-10 w-max bg-background border rounded-lg shadow-lg p-2 flex items-center gap-2">
          
          <KakaoShareButton
            shareUrl={shareUrl}
            title={shareTitle}
            description={shareText}
            // 전달받은 이미지가 있으면 사용, 없으면 기본 로고 이미지를 사용
            imageUrl={shareImageUrl || defaultImageUrl}
          />

          <a href={linkedInUrl} target="_blank" rel="noopener noreferrer" title="링크드인에 공유">
              <Linkedin className="h-8 w-8 p-1.5 rounded-full hover:bg-accent/50 cursor-pointer"/>
          </a>

          <button onClick={handleCopyLink} title="링크 복사">
              <LinkIcon className="h-8 w-8 p-1.5 rounded-full hover:bg-accent/50"/>
          </button>
        </div>
      )}
    </div>
  );
};
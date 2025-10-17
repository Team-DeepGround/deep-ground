'use client';

import { useEffect } from 'react';

// window 객체에 Kakao 타입을 선언해줍니다.
declare global {
  interface Window {
    Kakao: any;
  }
}

// 공유할 콘텐츠 데이터를 props로 받아 동적으로 사용할 수 있습니다.
interface KakaoShareButtonProps {
  shareUrl: string;
  title: string;
  description: string;
  imageUrl: string;
}

export default function KakaoShareButton({
  shareUrl,
  title,
  description,
  imageUrl,
}: KakaoShareButtonProps) {
  useEffect(() => {
    // useEffect 내에서 window.Kakao 객체에 접근합니다.
    if (window.Kakao) {
      const kakao = window.Kakao;

      // SDK가 초기화되지 않았다면, 발급받은 JavaScript 키로 초기화합니다.
      if (!kakao.isInitialized()) {
        // .env 파일에 키를 보관하고 사용하는 것이 안전합니다.
        kakao.init(process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY);
      }

      // 공유하기 버튼을 생성합니다.
      kakao.Share.createDefaultButton({
        container: '#kakaotalk-sharing-btn', // 버튼이 들어갈 DOM의 id
        objectType: 'feed',
        content: {
          title: title,
          description: description,
          imageUrl: imageUrl,
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '웹으로 보러가기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      });
    }
  }, [shareUrl, title, description, imageUrl]); // props가 바뀔 때마다 버튼을 다시 생성

  return (
    // 카카오 SDK가 이 id를 기준으로 버튼을 생성합니다.
    <button
      id="kakaotalk-sharing-btn"
      style={{ border: 'none', background: 'none', cursor: 'pointer' }}
    >
      <img
        src="https://developers.kakao.com/assets/img/about/logos/kakaotalksharing/kakaotalk_sharing_btn_medium.png"
        alt="카카오톡 공유 보내기 버튼"
      />
    </button>
  );
}

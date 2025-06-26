const TOKEN_KEY = 'auth_token';
const MEMBER_ID_KEY = 'member_id';

export const auth = {
    // 토큰 저장
    setToken(token: string) {
        localStorage.setItem(TOKEN_KEY, token);
    },

    // 토큰 가져오기
    async getToken(): Promise<string | null> {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem(TOKEN_KEY);
    },

    // 토큰 삭제
    removeToken() {
        localStorage.removeItem(TOKEN_KEY);
    },

    // 토큰 존재 여부 확인
    async hasToken(): Promise<boolean> {
        const token = await this.getToken();
        return !!token;
    },

    // memberId는 ui에 사용하고 서버 요청에 사용 X
    setMemberId(memberId: number) {
        localStorage.setItem(MEMBER_ID_KEY, String(memberId));
    },

    // 멤버 Id 가져오기
    async getMemberId(): Promise<number | null> {
        if (typeof window === 'undefined') return null;

        const stored = localStorage.getItem(MEMBER_ID_KEY);
        return stored !== null ? Number(stored) : null;
    },

    // 멤버 Id 삭제
    removeMemberId() {
        localStorage.removeItem(MEMBER_ID_KEY);
    }
};
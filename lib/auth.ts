const TOKEN_KEY = 'auth_token';
const MEMBER_ID_KEY = 'member_id';
const ROLE_KEY = "auth_role";
const EMAIL_KEY = "auth_email"

export function getTokenExp(token: string): number | null {
    try {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
        return JSON.parse(jsonPayload).exp || null;
    } catch {
        return null;
    }
}

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

     // ✅ Role 저장 및 조회
    setRole(role: string) {
        localStorage.setItem(ROLE_KEY, role)
    },

    async getRole(): Promise<string | null> {
        if (typeof window === "undefined") return null
        return localStorage.getItem(ROLE_KEY)
    },
    removeRole() {
        localStorage.removeItem(ROLE_KEY);
    },

    // ✅ 이메일 저장 및 조회
    setEmail(email: string) {
        localStorage.setItem(EMAIL_KEY, email)
    },

    getEmail(): string | null {
        if (typeof window === "undefined") return null
        return localStorage.getItem(EMAIL_KEY)
    },
    removeEmail() {
        localStorage.removeItem(EMAIL_KEY);
    },

    // ✅ memberId 저장 및 조회 (선택사항)
    setMemberId(id: number) {
        localStorage.setItem(MEMBER_ID_KEY, String(id))
    },

    getMemberId(): number | null {
        const id = localStorage.getItem(MEMBER_ID_KEY)
        return id ? parseInt(id, 10) : null
    },
    removeMemberId() {
        localStorage.removeItem(MEMBER_ID_KEY);
    }
    
};

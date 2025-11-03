export interface LoginResponse {
  status: number;
  message: string;
  result: {
    accessToken: string;
    role: string;
    email: string;
    memberId: number;
    nickname: string;
    publicId: string;
  } | null;
}
// "use client"

// // This is just a re-export of the context from auth-provider
// // The actual implementation is in components/auth-provider.tsx
// export const useAuth = () => {
//   // This is a placeholder hook that will be implemented in the AuthProvider
//   // For now, we'll return a mock implementation
//   return {
//     user: null,
//     loading: false,
//     signIn: async () => {},
//     signUp: async () => {},
//     signOut: async () => {},
//     resetPassword: async () => {},
//   }
// }


// 더미 데이터 제거하고 실제 AuthProvider의 useAuth 사용
"use client"

export { useAuth } from "@/components/auth-provider"

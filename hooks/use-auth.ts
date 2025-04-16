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


// 아래는 더미 데이터입니다. 실제로는 위에 코드를 사용하거나, 위 주석을 참고해주심 감사드리겠습니다.
"use client"

export const useAuth = () => {
  const dummyUser = {
    id: 1,
    email: "dummy@deepground.dev",
    name: "더미유저",
    avatarUrl: "/placeholder.svg?height=32&width=32",
  }

  return {
    user: dummyUser,
    loading: false,
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {
      console.log("로그아웃됨")
    },
    resetPassword: async () => {},
  }
}

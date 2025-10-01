"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface ChatContextType {
    currentChatRoomId: number | null
    setCurrentChatRoomId: (id: number | null) => void
}

const ChatContext = createContext<ChatContextType | undefined>(undefined)

interface ChatProviderProps {
    children: ReactNode
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
    const [currentChatRoomId, setCurrentChatRoomId] = useState<number | null>(null)

    return (
        <ChatContext.Provider value={{ currentChatRoomId, setCurrentChatRoomId }}>
            {children}
        </ChatContext.Provider>
    )
}

export const useCurrentChatRoom = (): ChatContextType => {
    const context = useContext(ChatContext)
    if (context === undefined) {
        throw new Error('useCurrentChatRoom must be used within ChatProvider')
    }
    return context
} 
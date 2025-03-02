import { useEffect, useCallback } from 'react';
import { chatSocket } from '../services/chat.service';
import { useAppSelector } from '../hooks';

export const useChat = (conversationId: string | null) => {
  const { token } = useAppSelector((state) => state.root.auth);

  useEffect(() => {
    // Connect socket when hook is first used
    chatSocket.connect(token || '');

    return () => {
      chatSocket.disconnect();
    };
  }, [token]);

  useEffect(() => {
    if (conversationId) {
      chatSocket.joinRoom(conversationId);
    }

    return () => {
      if (conversationId) {
        chatSocket.leaveCurrentRoom();
      }
    };
  }, [conversationId]);

  const sendMessage = useCallback((text: string) => {
    chatSocket.sendMessage(text);
  }, []);

  const markAsRead = useCallback((messageIds: string[]) => {
    chatSocket.markMessagesAsRead(messageIds);
  }, []);

  return {
    sendMessage,
    markAsRead
  };
};
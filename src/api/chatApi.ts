import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';

interface Message {
  id: string;
}

interface ConversationMessagesResponse {
  data: {
    userOneId: string;
    userTwoId: string;
    messages: Array<Message>;
  };
}

interface ConversationsResponse {
  data: [
    {
      id: string;
    }
  ];
}

interface CreateConversationPayload {
  user_one_id: string;
  user_two_id: string;
}
interface CreateConversationResponse {
  conversationId: string;
  message: string;
}

export const chatApi = createApi({
  reducerPath: 'chatApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_ADDONS_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.root?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['conversations'],
  endpoints: (builder) => ({
    createConversation: builder.mutation<
      CreateConversationResponse,
      CreateConversationPayload
    >({
      query: (data) => ({
        url: 'conversations',
        method: 'POST',
        body: data,
      }),
    }),
    getConversations: builder.query<ConversationsResponse, void>({
      query: () => 'conversations',
      providesTags: ['conversations'],
    }),
    getConversationMessages: builder.query<
      ConversationMessagesResponse,
      string
    >({
      query: (id: string) => `conversations/${id}`,
    }),
    deleteConversation: builder.mutation<CreateConversationResponse, string>({
      query: (id) => ({
        url: `conversations/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['conversations'],
    }),
  }),
});

export const {
  useCreateConversationMutation,
  useGetConversationsQuery,
  useLazyGetConversationMessagesQuery,
  useDeleteConversationMutation
} = chatApi;

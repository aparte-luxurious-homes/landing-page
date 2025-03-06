import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../app/store';

interface Notification {
  id: string;
  user_id: string;
  body: string;
  status: string;
  read_at: string;
  created_at: string;
}

interface GetNotificationResponse {
  message: string;
  data: Array<Notification>;
}

export interface NotificationRequest {
  notification_id: string;
}

export const notificationApi = createApi({
  reducerPath: 'notificationApi',
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState)?.root?.auth?.token;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['notifications'],
  endpoints: (builder) => ({
    getNotifications: builder.query<GetNotificationResponse, void>({
      query: () => 'notifications.',
      providesTags: ['notifications'],
    }),
    readNotification: builder.mutation<
      { message: string },
      NotificationRequest
    >({
      query: ({ notification_id }) => ({
        url: `/notifications/${notification_id}/read`,
        method: 'POST',
      }),
      invalidatesTags: ['notifications'],
    }),
    unreadNotification: builder.mutation<
      { message: string },
      NotificationRequest
    >({
      query: ({ notification_id }) => ({
        url: `/notifications/${notification_id}/unread`,
        method: 'POST',
      }),
      invalidatesTags: ['notifications'],
    }),
    deleteNotification: builder.mutation<
      { message: string },
      NotificationRequest
    >({
      query: ({ notification_id }) => ({
        url: `/notifications/${notification_id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['notifications'],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useReadNotificationMutation,
  useUnreadNotificationMutation,
  useDeleteNotificationMutation,
} = notificationApi;

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { BASE_API_URL } from '../utils/url';

/**
 * Blog: the one call the browser makes. Everything else on the blog is read
 * on the server (src/lib/blog/api.ts) so it is in the HTML.
 *
 * POST /blog/posts/{slug}/view counts a read for "Popular articles". It is
 * sent from the browser, not the server render, so cached pages and crawlers
 * that don't run JavaScript don't count.
 */
export const blogApi = createApi({
  reducerPath: 'blogApi',
  baseQuery: fetchBaseQuery({ baseUrl: BASE_API_URL }),
  endpoints: (builder) => ({
    recordBlogView: builder.mutation<void, string>({
      query: (slug) => ({ url: `blog/posts/${encodeURIComponent(slug)}/view`, method: 'POST' }),
    }),
  }),
});

export const { useRecordBlogViewMutation } = blogApi;

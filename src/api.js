const BASE = '/api';

function authHeader() {
  const token = localStorage.getItem('blog:jwt');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...authHeader(), ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

export const api = {
  posts: {
    list: async ({ all = false } = {}) => {
      const data = await request(all ? '/posts?all=true' : '/posts');
      return data.map((p) => ({
        ...p,
        readTime: p.read_time,
        comments: parseInt(p.comment_count || 0, 10)
      }));
    },
    save: (post) => {
      const payload = { ...post, read_time: post.readTime ?? post.read_time ?? 1 };
      return request('/posts', { method: 'POST', body: payload });
    },
    delete: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
    view: (id) => request(`/posts/${id}/view`, { method: 'POST' }),
  },
  comments: {
    listAll: () => request('/comments'),
    list: (postId) => request(`/comments/${postId}`),
    add: (postId, { author, text }) => request(`/comments/${postId}`, { method: 'POST', body: { author, text } }),
    updateStatus: (id, status) => request(`/comments/${id}`, { method: 'PATCH', body: { status } }),
    delete: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
  },
  og: {
    fetch: (url) => request(`/og?url=${encodeURIComponent(url)}`),
  },
  settings: {
    get: () => request('/settings'),
    save: (data) => request('/settings', { method: 'PUT', body: data }),
  },
  auth: {
    status: () => request('/auth/status'),
    setup: (password) => request('/auth/setup', { method: 'POST', body: { password } }),
    login: (password) => request('/auth/login', { method: 'POST', body: { password } }),
    changePassword: (oldPassword, newPassword) =>
      request('/auth/change-password', { method: 'POST', body: { oldPassword, newPassword } }),
  },
};

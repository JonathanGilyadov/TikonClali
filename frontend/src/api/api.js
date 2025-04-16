// src/api/api.js
const API_BASE = "http://localhost:3001/api";

export const fetchChapters = async () => {
  const res = await fetch(`${API_BASE}/chapters`);
  return res.json();
};

export const fetchRequests = async (searchQuery = "") => {
  const params = new URLSearchParams();
  if (searchQuery) params.append("search", searchQuery);

  const res = await fetch(`http://localhost:3001/api/requests?${params}`);
  return res.json();
};

export const fetchRequestById = async (id) => {
  const res = await fetch(`${API_BASE}/requests/${id}`);
  return res.json();
};

export const createRequest = async (requestData) => {
  const res = await fetch(`${API_BASE}/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestData),
  });
  return res.json();
};

export const updateRequestProgress = async (requestId, chapterId) => {
  const res = await fetch(`${API_BASE}/requests/${requestId}/progress`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chapterId }),
  });
  return res.json();
};

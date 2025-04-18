import { v4 as uuid } from "uuid";
// src/api/api.js
const API_BASE = "/api";

const getAnonId = () => {
  let id = localStorage.getItem("anonUserId");
  if (!id) {
    id = uuid();
    localStorage.setItem("anonUserId", id);
  }
  return id;
};

const headers = () => ({
  "x-anon-id": getAnonId(),
  "Content-Type": "application/json",
});

const handle = async (res) => {
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "שגיאת שרת");
  }
  return res.json();
};

export const fetchChapters = async () => {
  const res = await fetch("/api/chapters", {
    headers: {
      "x-anon-id": getAnonId(),
    },
  });
  return handle(res);
};

export const fetchRequests = async (searchQuery = "") => {
  const params = new URLSearchParams();
  if (searchQuery) params.append("search", searchQuery);

  const res = await fetch(`${API_BASE}/requests?${params}`, {
    headers: headers(),
  });
  return handle(res);
};

export const fetchRequestById = async (id) => {
  const res = await fetch(`${API_BASE}/requests/${id}`, {
    headers: headers(),
  });
  return handle(res);
};

export const createRequest = async (requestData) => {
  const res = await fetch(`${API_BASE}/requests`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(requestData),
  });
  return handle(res);
};

export const updateRequestProgress = async (requestId, chapterId) => {
  const res = await fetch(`${API_BASE}/requests/${requestId}/progress`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify({ chapterId }),
  });
  return handle(res);
};

export async function fetchNextChapter(requestId) {
  const res = await fetch(`${API_BASE}/request/${requestId}/next-chapter`, {
    headers: headers(),
  });
  return handle(res);
}

export async function completeChapter(chapterId) {
  const res = await fetch(`${API_BASE}/chapter/${chapterId}/complete`, {
    method: "POST",
    headers: headers(),
  });
  return handle(res);
}

export async function releaseChapter(chapterId) {
  const res = await fetch(`${API_BASE}/chapter/${chapterId}/release`, {
    method: "POST",
    headers: headers(),
  });
  return handle(res);
}

export const fetchStats = async () => {
  const res = await fetch(`${API_BASE}/stats`, { headers: headers() });
  if (!res.ok) throw new Error("שגיאה בטעינת סטטיסטיקה");
  return res.json();
};

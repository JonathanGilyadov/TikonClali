import crypto from "crypto";

export const getAnonId = () => {
  const key = "anonUserId";
  let id = localStorage.getItem(key);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(key, id);
  }
  return id;
};

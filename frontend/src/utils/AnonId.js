import { v4 as uuid } from "uuid";

export const getAnonId = () => {
  const key = "anonUserId";
  let id = localStorage.getItem(key);
  if (!id) {
    id = uuid();
    localStorage.setItem(key, id);
  }
  return id;
};

import http from "./http";

export const rencentFiles = () =>
  http.get("/files?_sort=createdAt&_order=desc");

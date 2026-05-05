// src/pages/Admin/components/downloadBlob.js
export function downloadBlob(response, filenameFallback = "download.csv") {
  const blob = response.data;
  const url = window.URL.createObjectURL(blob);

  const cd = response.headers?.["content-disposition"] || "";
  const match = cd.match(/filename="([^"]+)"/i);
  const filename = match?.[1] || filenameFallback;

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  window.URL.revokeObjectURL(url);
}

export async function apiFetch(url: string, method?: string, body?: any) {
  return fetch(`/api${url[0] === "/" ? "" : "/"}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

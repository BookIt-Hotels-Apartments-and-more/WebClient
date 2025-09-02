export function getApiErrorMessage(err, fallback = "Something went wrong. Please try again.") {
  const resp = err?.response;
  const data = resp?.data;

  if (typeof data === "string" && data.trim()) return data;

  if (data?.message && typeof data.message === "string") return data.message;

  if (data?.errors && typeof data.errors === "object") {
    const lines = Object.values(data.errors).flat().filter(Boolean).map(String);
    if (lines.length) return lines.join("\n");
    if (data.title) return String(data.title);
  }

  if (data?.detail) return String(data.detail);
  if (data?.error_description) return String(data.error_description);

  if (Array.isArray(data?.errors)) {
    const msgs = data.errors
      .map(e => e?.message || e?.description || (typeof e === "string" ? e : ""))
      .filter(Boolean);
    if (msgs.length) return msgs.join("\n");
  }

  if (resp?.statusText) return resp.statusText;
  if (err?.message) return err.message;

  return fallback;
}

export default getApiErrorMessage;

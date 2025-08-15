export function getApiErrorMessage(err, fallback = "Booking/payment error!") {
  const data = err?.response?.data;

  if (typeof data === "string" && data.trim()) return data;

  if (data?.message && typeof data.message === "string") {
    if (data?.details?.Rule) {
      return `${data.message}`;
    }
    return data.message;
  }

  if (data?.errors && typeof data.errors === "object") {
    const lines = Object.values(data.errors)
      .flat()
      .filter(Boolean)
      .map(String);
    if (lines.length) return lines.join("\n");
  }

  if (data?.title && typeof data.title === "string") {
    return data.detail ? `${data.title}\n${data.detail}` : data.title;
  }

  if (err?.response?.statusText) return err.response.statusText;

  if (err?.message) return err.message;

  return fallback;
}

export default getApiErrorMessage;

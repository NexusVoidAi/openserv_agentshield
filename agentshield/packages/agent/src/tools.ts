import axios from "axios";

export async function httpFetch({ url }: { url: string }) {
  const { data } = await axios.get(url, { timeout: 5000 });
  return { ok: true, data };
}

export async function echo({ text }: { text: string }) {
  return { ok: true, text };
}

export const tools = {
  httpFetch,
  echo
};

export type ToolName = keyof typeof tools;

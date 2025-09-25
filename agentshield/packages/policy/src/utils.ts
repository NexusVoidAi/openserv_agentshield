export function deepFindUrls(obj: any): string[] {
  const out: string[] = [];
  const walk = (v: any) => {
    if (typeof v === "string") {
      const urls = v.match(/https?:\/\/[^\s"'`]+/g) || [];
      out.push(...urls);
    } else if (Array.isArray(v)) v.forEach(walk);
    else if (v && typeof v === "object") Object.values(v).forEach(walk);
  };
  walk(obj);
  return [...new Set(out)];
}

export function approxSizeBytes(v: any): number {
  try { return Buffer.from(JSON.stringify(v)).byteLength; }
  catch { return 0; }
}

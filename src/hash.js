async function hash(text){
  const digest = await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map(v=>v.toString(16).padStart(2,"0"))
    .join("");
}
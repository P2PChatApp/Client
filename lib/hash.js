/**
 * ハッシュ化します
 * @param {String} text ハッシュ化する文字列
 * @returns {String} ハッシュ化された文字列
 */
module.exports = async(text)=>{
  const digest = await crypto.subtle.digest("SHA-256",new TextEncoder().encode(text));
  return Array.from(new Uint8Array(digest))
    .map(v=>v.toString(16).padStart(2,"0"))
    .join("");
}
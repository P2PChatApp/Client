/**
 * JSONへの変換
 * @param {String} data Jsonに変換する文字列 
 * @returns {JSON} 変換されたデータ
 */
module.exports = (data)=>{
  try{
    return JSON.parse(data);
  }catch{
    return null;
  }
}
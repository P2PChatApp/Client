/**
 * データの整合性のチェック
 * @param {Object} data 通信データオブジェクト
 * @returns {Boolean} データが欠損していたらFalse
 */
module.exports = (data)=>{
  if(
    !data.event||
    !data.version||
    !data.status||
    !data.clientId||
    !data.data
  ) return false;

  if(data.group){
    if(
      !data.group.id||
      !data.group.name||
      !data.group.status
    ) return false;
  }

  return true;
}
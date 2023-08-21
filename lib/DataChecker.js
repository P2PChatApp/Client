/**
 * データの整合性のチェック
 * @param {Object} data 通信データオブジェクト
 * @returns {Boolean} データが欠損していたらFalse
 */
module.exports = (data)=>{
  if(
    !data.type||
    !data.status||
    !data.clientId
  ) return false;

  if(Object.keys(data.group).length !== 0){
    if(
      !data.group.id||
      !data.group.name||
      !data.group.status
    ) return false;
  }

  return true;
}
const WSClient = require("./WSClient");
/**
 * システム管理
 */
module.exports = class SystemManager{
  /**
   * WebScoket接続の開始
   */
  constructor(){
    this.clientId = this.createId();
    this.status = "IDLING";

    this.ws = new WSClient();
  }

  /**
   * 9桁の数字のIDを生成します
   * @returns {Number} 生成したID
   */
  createId(){
    let id = "";
    for(let i = 0;i < 10;i++){
      id += (Math.floor(Math.random()*9)+1).toString(); 
    }
    return id;
  }


}
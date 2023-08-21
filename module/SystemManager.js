const WSClient = require("./WSClient");
const WSEventHandler = require("./WSEventHandler");

const DataChecker = require("../lib/DataChecker");
const parse = require("../lib/parse");
/**
 * システム管理
 */
module.exports = class SystemManager{
  /**
   * WebScoket接続の開始
   */
  constructor(){
    this.clientId = this.createId();
    this.group = {};

    this.WSClient = new WSClient();
    this.WSEventHandler = new WSEventHandler(WSClient.ws,this.clientId);

    this.WSClient.ws.addEventListener("message",async(_data)=>{
      const data = parse(_data.toString());
      if(!data) return;
      console.log(`WebSocket Data: ${data}`);
      if(!DataChecker(data)) return;

      await WSEventHandler.handle(data);
    });
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

  /**
   * 
   * @param {String} name グループ名 
   * @param {Boolean} isPublic チャットを公開するかどうか 
   * @returns {Object} グループデータ
   */
  createGroup(name,isPublic){
    this.group = {
      "name": name,
      "id": this.createId(),
      "isPublic": isPublic,
      "status": "WAITING"
    };
    return this.group;
  }

  /**
   * 現在のグループを削除
   */
  deleteGroup(){
    this.group = {};
  }

  startRTC(){

  }
}
const WSClient = require("./WSClient");
const WSEventHandler = require("./WSEventHandler");
const DataManager = require("./DataManager");

const DataChecker = require("../lib/DataChecker");
const parse = require("../lib/parse");
/**
 * システム管理
 */
module.exports = class SystemManager{
  /**
   * WebScoket接続、基本システム構築
   */
  constructor(){
    this.clientId = this.createId();

    this.WSClient = new WSClient();
    this.WSEventHandler = new WSEventHandler(this.WSClient,this.clientId);

    this.WSClient.ws.addEventListener("message",async(_data)=>{
      const data = parse(_data.toString());
      if(!data) return;
      if(!DataChecker(data)) return;

      await this.WSEventHandler.handle(data);
    });

    setInterval(()=>{
      this.WSClient.send({
        "type": "DATA_REQUEST",
        "clientId": this.clientId,
        "status": DataManager.getStatus(),
        "group": DataManager.getGroup()
      });
    },3000)
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
   * データを更新します
   */
  update(){
    this.WSClient.send({
      "type": "DATA_REQUEST",
      "clientId": this.clientId,
      "status": DataManager.getStatus(),
      "group": DataManager.getGroup()
    });
  }

  /**
   * グループ一覧の取得
   * @returns {Array} 存在するグループの配列
   */
  getGroups(){
    return DataManager.getClients()
      .map(client=>client.group)
      .filter(group=>Object.keys(group).length !== 0);
  }

  /**
   * 
   * @param {String} name グループ名 
   * @param {Boolean} isPublic チャットを公開するかどうか 
   * @returns {Object} グループデータ
   */
  createGroup(name,isPublic){
    return DataManager.changeGroup({
      "name": name,
      "id": this.createId(),
      "isPublic": isPublic,
      "status": "WAITING"
    });
  }

  /**
   * 現在のグループを削除
   */
  deleteGroup(){
    DataManager.changeGroup({});
  }
}
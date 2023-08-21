const WSClient = require("./WSClient");
const WSEventManager = require("./WSEventManager");
const DataManager = require("./DataManager");

const DataChecker = require("../lib/DataChecker");
const parse = require("../lib/parse");
/**
 * システム管理
 */
module.exports = class SystemManager{
  /**
   * WebScoket接続、基本システム構築
   * @param {String} name ユーザー名
   */
  constructor(name){
    DataManager.setClient({
      "id": this.createId(),
      "name": name
    });

    this.WSClient = new WSClient();
    this.WSEventManager = new WSEventManager(this.WSClient,DataManager.getClient().id);

    this.WSClient.ws.addEventListener("message",async(_data)=>{
      const data = parse(_data.toString());
      if(!data) return;
      if(!DataChecker(data)) return;

      await this.WSEventManager.handle(data);
    });

    setInterval(()=>{
      this.WSClient.send({
        "type": "DATA_REQUEST",
        "client": DataManager.getClient(),
        "group": DataManager.getGroup()
      });
    },3000);
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
   * @param {String} name 変更先のユーザーID
   * @returns 変更後のクライアントデータ
   */
  changeName(name){
    return DataManager.setClient({
      "name": name
    });
  }

  /**
   * グループ一覧の取得
   * @returns {Array} 存在するグループの配列
   */
  getGroups(){
    return DataManager.getPeers()
      .map(peer=>peer.group)
      .filter(group=>Object.keys(group).length !== 0);
  }

  /**
   * グループの作成
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
const WSClient = require("./WSClient");
const WSEventManager = require("./WSEventManager");
const RTCClient = require("./RTCClient");
const DataManager = require("./DataManager");

const DataChecker = require("../lib/DataChecker");
const Builder = require("../lib/Builder");
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
      "id": this.createId(10),
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
      this.WSClient.send(Builder(
        "DATA_REQUEST"
      ));
    },3000);
  }

  /**
   * 9桁の数字のIDを生成します
   * @param {Number} length 生成する長さ 
   * @returns {String} 生成したID
   */
  createId(length){
    const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for(let i = 0;i < length;i++){
      id += str.charAt(Math.floor(Math.random()*str.length));
    }
    return id;
  }

  /**
   * ユーザー名の変更
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
    DataManager.setClient({"status":"WAITING"});

    return DataManager.setGroup({
      "name": name,
      "id": this.createId(8),
      "isPublic": isPublic,
      "status": "INACTIVE"
    });
  }

  /**
   * 現在のグループを削除
   */
  deleteGroup(){
    DataManager.setClient({"status":"IDLING"});
    DataManager.setGroup({});
  }

  /**
   * グループに参加する
   * @param {Number} id 参加するグループID
   * @returns 成功したら参加したグループデータ
   */
  joinGroup(id){
    const group = this.getGroups().find(group=>group.id === id);
    if(!group) return false;

    return DataManager.setGroup({
      "name": group.name,
      "id": group.id,
      "isPublic": group.isPublic,
      "status": group.status
    });
  }

  /**
   * 設定されているグループに接続
   */
  connect(){
    const peers = DataManager.getPeers().filter(peer=>peer.group?.id === DataManager.getGroup().id);
    peers.forEach(peer=>{
      const connection = DataManager.setConnection(peer.client.id,{
        "client": peer.client,
        "group": peer.group,
        "rtc": new RTCClient()
      });
  
      this.WSClient.send(Builder(
        "OFFER_REQUEST",
        connection.rtc.createOffer(),
        peer.client.id
      ));
    });
  }

  /**
   * グループから切断
   */
  disconnect(){
    DataManager.getConnections()
      .forEach(connection=>{
        connection.rtc.send(connection.channel,Builder(
          "DISCONNECT"
        ));
      });

    DataManager.deleteConnections();
    DataManager.deleteMessages();
    DataManager.setClient({"status":"IDLING"});
  }

  /**
   * 接続中のピアにメッセージを送信します
   * @param {String} content メッセージ内容 
   */
  send(content){
    DataManager.getConnections()
      .forEach(connection=>{
        connection.rtc.send(connection.channel,Builder(
          "SEND_MESSAGE",
          content
        ));
      });
  }
}
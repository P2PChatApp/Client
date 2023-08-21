const WSClient = require("./WSClient");
const WSEventManager = require("./WSEventManager");
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
      this.WSClient.send(Builder(
        "DATA_REQUEST"
      ));
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

  /**
   * グループに参加する
   * @param {Number} id 参加するグループID
   * @returns 
   */
  joinGroup(id){
    const group = this.getGroups().find(group=>group.id === id);
    if(!group) return false;

    return DataManager.changeGroup({
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
    const peer = DataManager.getPeers().find(peer=>peer.group?.id === DataManager.getGroup().id)
    const connection = DataManager.setConnection(peer.client.id,{
      "client": peer.client,
      "group": peer.group,
      "rtc": new RTCClient()
    });

    this.WSClient.send(Builder(
      "OFFER_REQUEST",
      connection.rtc.createOffer()
    ));
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
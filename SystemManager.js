const WSClient = require("./module/WSClient");
const RTCClient = require("./module/RTCClient");
const DataManager = require("./module/DataManager");
const Builder = require("./lib/Builder");
/**
 * システム管理
 */
module.exports = class SystemManager{
  /**
   * WebScoket接続、基本システム構築
   */
  constructor(){
    DataManager.setClient({
      "id": this.createId(10),
      "name": this.createId(6)
    });

    this.WSClient = new WSClient();

    setInterval(()=>{
      this.WSClient.send(Builder("DATA_REQUEST"));

      DataManager.getPeers()
        .forEach(peer=>{
          if(new Date() - new Date(peer.time) < 10000) return DataManager.deletePeer(peer.client.id);
        });
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
   * グループ一覧の取得
   * @returns {Array} 存在するグループの配列
   */
  getGroups(){
    return DataManager.getPeers()
      .map(peer=>peer.group)
      .filter(group=>Object.keys(group).length !== 0)
      .filter((group,i,array)=>array.indexOf(group) === i);
  }

  /**
   * 接続されているメンバーを取得
   * @returns {Array} 接続されているメンバーのクライアントデータ
   */
  getMembers(){
    if(DataManager.getClient().status !== "CONNECTIONG") return;

    return DataManager.getConnections()
      .map(connection=>connection.client);
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
   * グループに参加する
   * @param {Number} id 参加するグループID
   * @returns 成功したら参加したグループデータ
   */
  joinGroup(id){
    const group = this.getGroups()
      .find(group=>group.id === id);

    if(!group) return;

    DataManager.setClient({"status":"WAITING"});

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
    const peers = DataManager.getPeers()
      .filter(peer=>peer.group?.id === DataManager.getGroup().id);

    peers.forEach(async(peer)=>{
      const connection = DataManager.setConnection(peer.client.id,{
        "client": peer.client,
        "group": peer.group,
        "rtc": new RTCClient()
      });
  
      this.WSClient.send(Builder(
        "OFFER_REQUEST",
        await connection.rtc.createOffer(),
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
        connection.rtc.close();
      });

    DataManager.deleteConnections();
    DataManager.deleteMessages();
    DataManager.setClient({"status":"IDLING"});
    DataManager.setGroup({});
  }

  /**
   * 接続中のピアにメッセージを送信します
   * @param {Object} data メッセージオブジェクト
   */
  send(data){
    DataManager.getConnections()
      .forEach(connection=>{
        connection.rtc.send(Builder("SEND_MESSAGE",data));
      });
  }

  data = {
    client:()=>{
      return DataManager.getClient();
    },
    group:()=>{
      return DataManager.getGroup();
    },
    peers:()=>{
      return DataManager.getPeers().length;
    },
    message:()=>{
      return DataManager.getMessage();
    }
  }
}
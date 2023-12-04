const WebSocketManager = require("./module/WebSocketManager");
const Client = require("./module/Client");
const Peers = require("./module/Peers");
const hash = require("./lib/hash");

module.exports = class System{
  constructor(){
    this.client = new Client(this.createId(10),this.createId(6));
    this.peers = new Peers();
    this.ws = new WebSocketManager(this.client,this.peers);

    setInterval(()=>{
      this.ws.send(this.client.packet({
        "type": "DATA_RESPONSE"
      }));

      this.peers.filter();
    },3000);
  }

  /**
   * ランダムなIDを生成します
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
    return this.peers.gets()
      .map(peer=>peer.group)
      .filter(group=>Object.keys(group).length !== 0)
      .filter((group,i,array)=>array.indexOf(group) === i);
  }

  /**
   * グループの作成
   * @param {String} name グループ名
   * @param {Boolean} isPublic チャットを公開するかどうか
   * @returns {String} グループID
   */
  async createGroup(name,isPublic){
    const id = this.createId(8);

    this.client.group = {
      "name": name,
      "id": isPublic ? id : await hash(id),
      "isPublic": isPublic
    };

    return id;
  }

  /**
   * グループに参加する
   * @param {Number} id 参加するグループID
   * @returns 成功したら参加したグループデータ
   */
  joinGroup(id){
    const group = this.getGroups()
      .find(async(group)=>{
        if(group.isPublic){
          return group.id === id;
        }else{
          return group.id === await hash(id);
        }
      });

    if(!group) return;

    this.client.group = {
      "name": group.name,
      "id": id,
      "isPublic": group.isPublic
    };
  }

  leaveGroup(){
    this.client.group = {};
  }

  connect(){
    if(!this.client.group.id) return;

    this.peers.gets()
      .filter(peer=>peer.group?.id === this.client.group.id)
      .forEach(async(peer)=>{
        await peer.createChannel("chat");

        this.ws.send(this.client.packet({
          "type": "OFFER_REQUEST",
          "address": peer.id,
          "data": await peer.createOffer()
        }));
      });
  }
}
let client = {};
let group = {};
let connections = {};
let peers = {};
let messages = [];

module.exports = {
  /**
   * クライアントデータを取得します
   * @returns クライアントデータ
   */
  getClient:()=>{
    return client;
  },
  /**
   * クライアントの情報を更新します
   * @param {Object} data 更新するクライアントオブジェクト
   * @returns 更新後のクライアントデータ
   */
  setClient:(data)=>{
    client = {
      "id": data.id||client.id,
      "name": data.name||client.name,
      "status": data.status||client.status
    };
    return client;
  },
  /**
   * 現在のグループを取得
   * @returns {Object} グループ
   */
  getGroup:()=>{
    return group;
  },
  /**
   * グループデータを変更します
   * @param {Object} data 変更するグループデータ
   * @returns {Object} 変更後のグループデータ
   */
  setGroup:(data)=>{
    group = {
      "name": data.name||group.name,
      "id": data.id||group.id,
      "isPublic": data.isPublic,
      "status": data.status||group.status
    };
    return group;
  },
  /**
   * 全ての接続データを取得
   * @returns {Array} 接続データの配列
   */
  getConnections:()=>{
    return Object.values(connections);
  },
  /**
   * 接続データを取得
   * @param {String} clientId 取得する相手のClientID
   * @returns {Object} 接続データ
   */
  getConnection:(clientId)=>{
    return connections[clientId];
  },
  /**
   * 接続データを追加
   * @param {String} clientId 設定するClientID
   * @param {Object} data 接続データ
   * @returns {Object} 追加したデータ
   */
  setConnection:(clientId,data)=>{
    const connection = connections[clientId];
    connections[clientId] = {
      "client": data.client||connection?.client,
      "group": data.group||connection?.group,
      "rtc": data.rtc||connection?.rtc,
      "channel": data.channel||connection?.channel
    };
    return connections[data.client.id];
  },
  /**
   * 接続データをすべて削除
   */
  deleteConnections:()=>{
    connections = {};
  },
  /**
   * 接続データを削除
   * @param {String} clientId 削除する相手のClientID
   */
  deleteConnection:(clientId)=>{
    delete connections[clientId];
  },
  /**
   * 全てのピアを取得します
   * @returns {Array} ピアの一覧
   */
  getPeers:()=>{
    return Object.values(peers);
  },
  /**
   * ピアを取得します
   * @param {String} clientId 取得するClientID 
   * @returns {Object} クライアントデータ
   */
  getPeer:(clientId)=>{
    return peers[clientId];
  },
  /**
   * ピアを追加します
   * @param {Object} data 通信データ 
   * @returns {Object} 追加されたデータ
   */
  setPeer:(data)=>{
    peers[data.client.id] = {
      "client": data.client,
      "group": data.group
    };
    return peers[data.client.id];
  },
  /**
   * ピアを削除します
   * @param {String} clientId 削除する相手のClientID
   */
  deletePeer:(clientId)=>{
    delete peers[clientId];
  },
  /**
   * メッセージを保存します
   * @param {Object} data 通信データ
   */
  addMessage:(data)=>{
    messages.push({
      "client": data.client,
      "group": data.group,
      "content": data.data
    });
  },
  /**
   * 全てのメッセージを削除します
   */
  deleteMessages:()=>{
    messages = [];
  }
}
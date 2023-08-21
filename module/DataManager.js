let client = {};
let group = {};
let connections = [];
let peers = [];

module.exports = {
  /**
   * クライアントデータを取得します
   * @returns クライアントデータ
   */
  getClient(){
    return client;
  },
  /**
   * クライアントの情報を更新します
   * @param {Object} data 更新するクライアントオブジェクト
   * @returns 更新後のクライアントデータ
   */
  setClient(data){
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
  getGroup(){
    return group;
  },
  /**
   * グループデータを変更します
   * @param {Object} data 変更するグループデータ
   * @returns {Object} 変更後のグループデータ
   */
  changeGroup(data){
    group = data;
    return group;
  },
  /**
   * 全ての接続データを取得
   * @returns {Array} 接続データの配列
   */
  getConnections(){
    return connections;
  },
  /**
   * 接続データを取得
   * @param {Number} clientId 取得する相手のClientID
   * @returns {Object} 接続データ
   */
  getConnection(clientId){
    return connections.find(connection=>connection.client.id === clientId);
  },
  /**
   * 接続データを追加
   * @param {Object} data 接続データ 
   */
  addConnection(data){
    connections.push(data);
  },
    /**
   * 接続データをすべて削除
   */
  deleteConnections(){
    connections = [];
  },
  /**
   * 接続データを削除
   * @param {Number} clientId 削除する相手のClientID
   */
  deleteConnection(clientId){
    connections.filter(connection=>connection.client.id !== clientId);
  },
  /**
   * 全てのピアを取得します
   * @returns {Array} ピアの一覧
   */
  getPeers(){
    return peers;
  },
  /**
   * ピアを取得します
   * @param {Number} clientId 取得するClientID 
   * @returns {Object} クライアントデータ
   */
  getPeer(clientId){
    return peers.find(peer=>peer.client.id === clientId);
  },
  /**
   * ピアを追加します
   * @param {Object} data 通信データ 
   */
  addPeer(data){
    peers.push({
      "client": data.client,
      "group": data.group
    });
  },
  /**
   * ピアを削除します
   * @param {Number} clientId 削除する相手のClientID
   */
  deletePeer(clientId){
    peers.filter(peer=>peer.client.id !== clientId)
  }
}
let client = {};
let status = "IDLING";
let group = {};
let connection = {};
let clients = {};

module.exports = {
  /**
   * クライアントの情報を更新します
   * @param {Object} data 更新するクライアントオブジェクト
   * @returns 更新後のクライアントデータ
   */
  setClient(data){
    client = {
      "id": data.id||client.id,
      "name": data.name||client.name
    };
    return client;
  },
  /**
   * 現在のステータスを取得します
   * @returns {String} ステータス
   */
  getStatus(){
    return status;
  },
  /**
   * ステータスを変更します
   * @param {String} name 変更するステータス
   * @returns {String} 変更後のステータス
   */
  changeStatus(name){
    status = name;
    return status;
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
    return Object.values(connection);
  },
  /**
   * 接続データを取得
   * @param {Number} clientId 取得する相手のClientID
   * @returns {Object} 接続データ
   */
  getConnection(clientId){
    return connection[clientId];
  },
  /**
   * 接続データを追加
   * @param {Number} clientId 追加する相手のClientID 
   * @param {Object} data 接続データ 
   */
  addConnection(clientId,data){
    connection[clientId] = data;
  },
  /**
   * 接続データを削除
   * @param {Number} clientId 削除する相手のClientID
   */
  deleteConnection(clientId){
    delete connection[clientId];
  },
  /**
   * 全てのクライアントを取得します
   * @returns {Array} クライアントの一覧
   */
  getClients(){
    return Object.values(clients);
  },
  /**
   * クライアントを取得します
   * @param {Number} clientId 取得するClientID 
   * @returns {Object} クライアントデータ
   */
  getClient(clientId){
    return clients[clientId];
  },
  /**
   * クライアントを追加します
   * @param {Number} clientId 追加する相手のClientID 
   * @param {Object} data クライアントデータ 
   */
  addClient(clientId,data){
    clients[clientId] = data;
  },
  /**
   * クライアントを削除します
   * @param {Number} clientId 削除する相手のClientID
   */
  deleteClient(clientId){
    delete clients[clientId];
  }
}
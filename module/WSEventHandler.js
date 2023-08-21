const DataManager = require("./DataManager");
const WSClient = require("./WSClient");
/**
 * WebSocketのイベント制御
 */
module.exports = class WSEventHandler{
  /**
   * WSClient情報
   * @param {WSClient} ws WSClientインスタンス
   * @param {Number} clientId 自分のClientID
   */
  constructor(WSClient,clientId){
    this.WSClient = WSClient;
    this.clientId = clientId;
  }

  /**
   * イベント制御
   * @param {Object} data 通信データオブジェクト 
   */
  async handle(data){
    if(data.type === "OFFER_REQUEST"){
      const RTCClient = new RTCClient(data.clientId)
      DataManager.addConnection(data.clientId,{
        "clientId": data.clientId,
        "rtc": RTCClient
      });

      DataManager.changeStatus("WAITING");

      this.WSClient.send({
        "type": "ANSWER_REQUEST",
        "clientId": this.clientId,
        "status": this.status,
        "group": DataManager.getGroup(),
        "data": RTCClient.createAnswer(data.data)
      });
    }else if(data.type === "ANSWER_REQUEST"){
      const RTCClient = new RTCClient(data.clientId)
      DataManager.addConnection(data.clientId,{
        "clientId": data.clientId,
        "rtc": RTCClient
      });

      DataManager.changeStatus("CONNECTING");
    }else if(data.type === "DATA_REQUEST"){
      this.WSClient.send({
        "type": "DATA_RESPONSE",
        "clientId": this.clientId,
        "status": this.status,
        "group": DataManager.getGroup(),
        "data": RTCClient.createAnswer(data.data)
      });
    }else if(data.type === "DATA_RESPONSE"){
      DataManager.addClient(data.clientId,data);
    }
  }
}
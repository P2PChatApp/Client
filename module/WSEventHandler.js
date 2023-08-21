const RTCClient = require("./RTCClient");
/**
 * WebSocketのイベント制御
 */
module.exports = class WSEventHandler{
  /**
   * WebSocket情報
   * @param {WebSocket} ws WebSocketインスタンス
   * @param {Number} clientId 自分のClientID
   */
  constructor(ws,clientId){
    this.ws = ws;
    this.clientId = clientId;
    this.connection = {};
    this.clients = {};
    this.status = "IDLING";
  }

  /**
   * イベント制御
   * @param {Object} data 通信データオブジェクト 
   */
  async handle(data){
    if(data.type === "OFFER_REQUEST"){
      const RTCClient = new RTCClient(data.clientId);
      this.connection[data.clientId] = {
        "clientId": data.clientId,
        "rtc": RTCClient
      };

      this.status = "WAITING"

      this.ws.send({
        "type": "ANSWER_REQUEST",
        "clientId": this.clientId,
        "status": this.status,
        "data": RTCClient.createAnswer(data.data)
      });
    }else if(data.type === "ANSWER_REQUEST"){
      this.status = "CONNECTING";
    }else if(data.type === "DATA_REQUEST"){
      this.ws.send({
        "type": "DATA_RESPONSE",
        "clientId": this.clientId,
        "status": this.status,
        "data": RTCClient.createAnswer(data.data)
      });
    }else if(data.type === "DATA_RESPONSE"){
      this.clients[data.clientId] = data;
    }
  }
}
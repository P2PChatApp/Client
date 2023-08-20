const RTCClient = require("./RTCClient");
/**
 * WebSocketのイベント制御
 */
module.exports = class WSEventHandler{
  /**
   * WebSocket情報
   * @param {WebSocket} ws WebSocketインスタンス
   */
  constructor(ws,clientId){
    this.clientId = clientId;
    this.ws = ws;
    this.connection = {};
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

      this.ws.send({
        "type": "ANSWER_REQUEST",
        "clientId": this.clientId,
        "status": "WAITING",
        "data": RTCClient.createAnswer(data.data)
      });
    }else if(data.type === "ANSWER_REQUEST"){

    }else if(data.type === "DATA_REQUEST"){

    }
  }
}
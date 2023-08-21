const DataManager = require("./DataManager");
const WSClient = require("./WSClient");
const RTCManager = require("./RTCManager");
/**
 * WebSocketのイベント制御
 */
module.exports = class WSEventManager{
  /**
   * WSClient情報
   * @param {WSClient} ws WSClientインスタンス
   */
  constructor(WSClient){
    this.WSClient = WSClient;

    this.RTCManager = new RTCManager();
  }

  /**
   * イベント制御
   * @param {Object} data 通信データオブジェクト 
   */
  async handle(data){
    if(data.type === "OFFER_REQUEST"){
      this.RTCManager.addConnection(data);

      DataManager.setClient({"status":"WAITING"});

      this.WSClient.send({
        "type": "ANSWER_REQUEST",
        "client": DataManager.getClient(),
        "group": DataManager.getGroup(),
        "data": (RTCManager.getRTCClient(data.client.id)).createAnswer(data.data)
      });
    }else if(data.type === "ANSWER_REQUEST"){
      this.RTCManager.addConnection(data);

      DataManager.setClient({"status":"CONNECTING"});
    }else if(data.type === "DATA_REQUEST"){
      this.WSClient.send({
        "type": "DATA_RESPONSE",
        "client": DataManager.getClient(),
        "group": DataManager.getGroup()
      });
    }else if(data.type === "DATA_RESPONSE"){
      DataManager.addPeer(data);
    }
  }
}
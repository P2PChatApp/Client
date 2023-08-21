const DataManager = require("./DataManager");
const WSClient = require("./WSClient");
const RTCManager = require("./RTCManager");

const Builder = require("../lib/Builder");
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
      if(data.group.id !== DataManager.getGroup().id) return;

      this.RTCManager.setConnection(data);
      DataManager.setClient({"status":"WAITING"});

      this.WSClient.send(Builder(
        "ANSWER_REQUEST",
        DataManager.getConnection(data.client.id).rtc.createAnswer(data.data)
      ));
    }else if(data.type === "ANSWER_REQUEST"){
      if(data.group.id !== DataManager.getGroup().id) return;

      this.RTCManager.setConnection(data);
      DataManager.setClient({"status":"CONNECTING"});

      this.RTCManager.connect(data.client.id);
    }else if(data.type === "DATA_REQUEST"){
      this.WSClient.send(Builder(
        "DATA_RESPONSE"
      ));
    }else if(data.type === "DATA_RESPONSE"){
      DataManager.setPeer(data);
    }
  }
}
const DataManager = require("./DataManager");
const RTCClient = require("./RTCClient");
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
    if(data.address !== DataManager.getClient().id) return;
    
    if(data.type === "OFFER_REQUEST"){
      if(data.group.id !== DataManager.getGroup().id) return;

      DataManager.setConnection(data.client.id,{
        "client": data.client,
        "group": data.group,
        "rtc": new RTCClient()
      });

      this.WSClient.send(Builder(
        "ANSWER_REQUEST",
        DataManager.getConnection(data.client.id).rtc.createAnswer(data.data)
      ));
    }else if(data.type === "ANSWER_REQUEST"){
      if(data.group.id !== DataManager.getGroup().id) return;

      DataManager.setConnection(data.client.id,{
        "client": data.client,
        "group": data.group,
        "rtc": new RTCClient()
      });

      this.WSClient.send(Builder(
        "READY",
        "",
        data.client.id
      ));

      DataManager.setClient({"status":"CONNECTING"});

      this.RTCManager.connect(data.client.id);
    }else if(data.type === "READY"){
      if(data.group.id !== DataManager.getGroup().id) return;

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
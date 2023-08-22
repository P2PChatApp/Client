const RTCClient = require("./RTCClient");
const DataManager = require("./DataManager");

const parse = require("../lib/parse");
const DataChecker = require("../lib/DataChecker");
/**
 * WebRTCの制御
 */
module.exports = class RTCManager{
  /**
   * イベント制御
   * @param {Object} data 通信データオブジェクト 
   */
  handle(data){
    if(data.type === "SEND_MESSAGE"){
      DataManager.addMessage(data);
    }else if(data.type === "DISCONNECT"){
      DataManager.deleteConnection(data.clent.id);
    }
  }

  /**
   * P2P通信の開始
   * @param {String} clientId 接続先のClientID
   */
  connect(clientId){
    const connection = DataManager.getConnection(clientId);
    DataManager.setConnection(clientId,{
      "channel": connection.rtc.createChannel("chat")
    });

    DataManager.setGroup({
      "status": "ACTIVE"
    });

    connection.channel.addEventListener("message",event=>{
      const data = parse(event.data.toString());
      if(!data) return;
      console.log(`WebRTC Data: ${data}`);

      if(!DataChecker(data)) return;
      this.handle(data);
    });
  }
}
const DataManager = require("./DataManager");
const parse = require("../lib/parse");
const DataChecker = require("../lib/DataChecker");
/**
 * WebRTCの制御
 */
module.exports = class RTCManager{
  /**
   * P2P通信の開始
   * @param {String} clientId 接続先のClientID
   */
  async connect(clientId){
    const connection = DataManager.getConnection(clientId);

    DataManager.setGroup({"status": "ACTIVE"});

    connection.rtc.channel.addEventListener("open",()=>{
      console.log("WebRTC Open");
    });

    connection.rtc.channel.addEventListener("message",event=>{
      const data = parse(event.data.toString());
      if(!data) return;
      console.log(`WebRTC Data: ${data}`);

      if(!DataChecker(data)) return;

      if(data.type === "SEND_MESSAGE"){
        DataManager.addMessage(data);
      }
    });

    connection.rtc.channel.addEventListener("error",event=>{
      console.log(`WebRTC Error: ${event.error}`);

      connection.rtc.close();
      DataManager.deleteConnection(clientId);
    });

    connection.rtc.channel.addEventListener("close",()=>{
      console.log("WebRTC Close");

      connection.rtc.close();
      DataManager.deleteConnection(clientId);
    });
  }
}
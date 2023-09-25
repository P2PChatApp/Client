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
    DataManager.setConnection(clientId,{
      "channel": await connection.rtc.createChannel("chat")
    });

    DataManager.setGroup({"status": "ACTIVE"});

    connection.channel.addEventListener("open",()=>{
      console.log("WebRTC Open");
    });

    connection.channel.addEventListener("message",event=>{
      const data = parse(event.data.toString());
      if(!data) return;
      console.log(`WebRTC Data: ${data}`);

      if(!DataChecker(data)) return;

      if(data.type === "SEND_MESSAGE"){
        DataManager.addMessage(data);
      }else if(data.type === "DISCONNECT"){
        DataManager.getConnection(data.client.id).rtc.close();
        DataManager.deleteConnection(data.client.id);
      }
    });

    connection.channel.addEventListener("error",event=>{
      console.log(`WebRTC Error: ${event.error}`);

      DataManager.getConnection(clientId).rtc.close();
      DataManager.deleteConnection(clientId);
    });

    connection.channel.addEventListener("close",()=>{
      console.log("WebRTC Close");

      DataManager.getConnection(clientId).rtc.close();
      DataManager.deleteConnection(clientId);
    });
  }
}
const RTCClient = require("./RTCClient");
const DataManager = require("./DataManager");
/**
 * WebRTCの制御
 */
module.exports = class RTCManager{
  constructor(){
    
  }
  /**
   * イベント制御
   * @param {Object} data 通信データオブジェクト 
   */
  async handle(data){
    if(data.type === "SEND_MESSAGE"){

    }
  }

  getRTCClient(clientId){
    return DataManager.getConnection(clientId).rtc;
  }

  addConnection(data){
    DataManager.setConnection({
      "client": data.client,
      "group": data.group,
      "rtc": new RTCClient()
    });
  }

  setChannel(clientId){

  }

  send(data){
    DataManager.getConnections()
      .forEach(connection=>{
        connection.rtc.send(connection.channel,data);
      });
  }
}
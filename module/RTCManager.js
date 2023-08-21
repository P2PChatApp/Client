const RTCClient = require("./RTCClient");
const DataManager = require("./DataManager");
/**
 * WebRTCの制御
 */
module.exports = class RTCManager{
  /**
   * RTCClient情報
   * @param {Number} clientId 自分のClientID
   */
  constructor(clientId){
    this.clientId = clientId;

    DataManager.getConnections()
      .forEach(connection=>{
        
      });
  }

  /**
   * イベント制御
   * @param {Object} data 通信データオブジェクト 
   */
  async handle(data){
    if(data.type === "SEND_MESSAGE"){

    }
  }
}
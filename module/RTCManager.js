/**
 * WebRTCの制御
 */
module.exports = class RTCManager{
  /**
   * RTCClient情報
   * @param {RTCClient} rtc RTCClientインスタンス
   * @param {Number} clientId 自分のClientID
   */
  constructor(rtc,clientId){
    this.rtc = rtc;
    this.clientId = clientId;
  }

  /**
   * イベント制御
   * @param {Object} data 通信データオブジェクト 
   */
  async handle(data){
    if(data.type === "SEND_MESSAGE"){

    }
  }

  send(data){

  }
}
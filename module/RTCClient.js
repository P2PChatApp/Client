const { RTCPeerConnection } = require("wrtc")

/**
 * WebRTC Client
 */
module.exports = class RTCClient{
  /**
   * RTCPeerConnection作成
   * @param {Number} clientId 相手のClientID
   */
  constructor(clientId){
    this.rtc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ]
    });
  }

  /**
   * 経路情報を取得しオファーを作成
   * @returns {RTCOfferDate} オファーデータ
   */
  async createOffer(){
    const offer = await this.rtc.createOffer();
    await this.rtc.setLocalDescription(offer);

    await this.getCandidates();
    return offer;
  }

  /**
   * 
   * @param {RTCOfferDate} offer 相手のオファーデータ
   * @returns {RTCAnswerDate} アンサーデータ
   */
  async createAnswer(offer){
    await this.rtc.setRemoteDescription(offer);

    await this.getCandidates();

    const answer = await this.rtc.createAnswer();
    await this.rtc.setLocalDescription(answer);
    return answer;
  }

  /**
   * 経路が全て見つかるまで待機する
   * @returns {Void}
   */
  async getCandidates(){
    return await new Promise(resolve=>{
      this.rtc.on("icecandidate",async(event)=>{
        if(event.candidate !== null) return;
          resolve();
      });
    })
  }
}
/**
 * WebRTC Client
 */
module.exports = class RTCClient{
  /**
   * RTCPeerConnection作成
   */
  constructor(){
    this.rtc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
      ]
    });
  }

  /**
   * 経路情報を取得しオファーを作成
   * @returns {RTCSessionDescriptionInit} オファーデータ
   */
  async createOffer(){
    const offer = await this.rtc.createOffer();
    await this.rtc.setLocalDescription(offer);

    await this.getCandidates();
    return this.rtc.localDescription;
  }

  /**
   * 経路情報を取得しアンサーを作成
   * @param {RTCSessionDescriptionInit} offer 相手のオファーデータ
   * @returns {RTCSessionDescriptionInit} アンサーデータ
   */
  async createAnswer(offer){
    await this.rtc.setRemoteDescription(offer);

    await this.getCandidates();

    const answer = await this.rtc.createAnswer();
    await this.rtc.setLocalDescription(answer);
    return this.rtc.localDescription;
  }

  /**
   * 経路が全て見つかるまで待機する
   */
  async getCandidates(){
    await new Promise(resolve=>{
      this.rtc.addEventListener("icecandidate",async(event)=>{
        if(event.candidate === null) resolve();
      });
    })
  }

  /**
   * データチャンネルを作成
   * @param {String} name データチャンネル名
   * @returns {RTCDataChannel} データチャンネル
   */
  async createChannel(name){
    const channel = this.rtc.createDataChannel(name);
    return await new Promise(resolve=>{
      channel.addEventListener("open",()=>{
        resolve(channel);
      })
    });
  }

  /**
   * メッセージを送信
   * @param {RTCDataChannel} channel データチャンネル
   * @param {Object} data 通信データオブジェクト 
   */
  send(channel,data){
    channel.send(JSON.stringify(data));
  }
}
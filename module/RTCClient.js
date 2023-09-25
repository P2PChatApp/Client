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
        {urls: "stun:stun.l.google.com:19302"},
        {urls: "stun:stun1.l.google.com:19302"},
        {urls: "stun:stun2.l.google.com:19302"},
        {urls: "stun:stun3.l.google.com:19302"},
        {urls: "stun:stun4.l.google.com:19302"}
      ]
    });

    this.rtc.addEventListener("datachannel",(event)=>{
      this.channel = event.channel;
    });
  }

  /**
   * 経路情報を取得しオファーを作成
   * @returns {RTCSessionDescriptionInit} オファーデータ
   */
  async createOffer(){
    await this.getCandidates();

    const offer = await this.rtc.createOffer();
    await this.rtc.setLocalDescription(offer);
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
   * アンサーをセット
   * @param {RTCSessionDescriptionInit} answer アンサーデータ
   */
  async setAnswer(answer){
    await this.rtc.setRemoteDescription(answer);
  }

  /**
   * 経路が全て見つかるまで待機する
   */
  async getCandidates(){
    await new Promise(resolve=>{
      this.rtc.addEventListener("icecandidate",(event)=>{
        if(event.candidate === null) resolve();
      });
    });
  }

  /**
   * データチャンネルを作成
   * @param {String} name データチャンネル名
   */
  async createChannel(name){
    if(this.channel) return;

    this.channel = this.rtc.createDataChannel(name,{
      ordered: false
    });
    
    await new Promise(resolve=>{
      this.channel.addEventListener("open",()=>{
        resolve();
      });
    });
  }

  /**
   * メッセージを送信
   * @param {Object} data 通信データオブジェクト 
   */
  send(data){
    if(!this.channel) return;
    this.channel.send(JSON.stringify(data));
  }

  /**
   * 接続を終了します
   */
  close(){
    this.rtc.close();
  }
}
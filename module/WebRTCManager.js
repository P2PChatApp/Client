module.exports = class WebRTCManager{
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
      if(this.channel) return;

      this.channel = event.channel;
    });
  }

  /**
   * オファーを作成
   * @returns {RTCSessionDescription} オファーデータ
   */
  async createOffer(){
    const offer = await this.rtc.createOffer();
    await this.rtc.setLocalDescription(offer);

    await this.getCandidates();

    return this.rtc.localDescription;
  }

  /**
   * アンサーを作成
   * @returns {RTCSessionDescription} アンサーデータ
   */
  async createAnswer(){
    const answer = await this.rtc.createAnswer();
    await this.rtc.setLocalDescription(answer);

    await this.getCandidates();

    return this.rtc.localDescription;
  }

  /**
   * オファーをセット
   * @param {RTCSessionDescription} offer オファーデータ
   */
  async setOffer(offer){
    await this.rtc.setRemoteDescription(offer);
  }

  /**
   * アンサーをセット
   * @param {RTCSessionDescription} answer アンサーデータ
   */
  async setAnswer(answer){
    await this.rtc.setRemoteDescription(answer);
  }

  /**
   * 経路が全て見つかるまで待機する
   */
  async getCandidates(){
    return new Promise(resolve=>{
      this.rtc.addEventListener("icecandidate",(event)=>{
        if(!event.candidate){
          resolve();
        }
      });
    });
  }

  /**
   * データチャンネルを作成
   * @param {String} name データチャンネル名
   */
  async createChannel(name){
    this.channel = this.rtc.createDataChannel(name,{
      ordered: false
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
    this.channel.close();
    this.rtc.close();
  }
}
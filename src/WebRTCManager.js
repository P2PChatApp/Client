class WebRTCManager{
  constructor(){
    this.reset();
  }

  reset(){
    this.rtc = new RTCPeerConnection({
      iceServers: [
        {urls: "stun:stun.l.google.com:19302"},
        {urls: "stun:stun1.l.google.com:19302"},
        {urls: "stun:stun2.l.google.com:19302"},
        {urls: "stun:stun3.l.google.com:19302"},
        {urls: "stun:stun4.l.google.com:19302"}
      ]
    });

    this.channel = null;
  }

  async createOffer(){
    const offer = await this.rtc.createOffer();
    await this.rtc.setLocalDescription(offer);

    await this.getCandidates();

    return this.rtc.localDescription;
  }

  async createAnswer(){
    const answer = await this.rtc.createAnswer();
    await this.rtc.setLocalDescription(answer);

    await this.getCandidates();

    return this.rtc.localDescription;
  }

  async setOffer(offer){
    await this.rtc.setRemoteDescription(offer);
  }

  async setAnswer(answer){
    await this.rtc.setRemoteDescription(answer);
  }

  async getCandidates(){
    return new Promise(resolve=>{
      this.rtc.addEventListener("icecandidate",(event)=>{
        if(!event.candidate){
          resolve();
        }
      });
    });
  }

  createChannel(name){
    this.channel = this.rtc.createDataChannel(name);
  }

  send(data){
    if(!this.channel||this.rtc.connectionState !== "connected") return;

    data = JSON.stringify(data);

    if(new TextEncoder().encode(data).length >= 64000) throw new Error("送信データ量が多すぎます");

    this.channel.send(data);
  }

  close(){
    if(this.channel){
      this.channel.close();
    }

    this.rtc.close();

    this.reset();
  }
}
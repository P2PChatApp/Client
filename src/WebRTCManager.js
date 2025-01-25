class WebRTCManager{
  constructor(){
    this.reset();
  }

  reset(){
    this.rtc = new RTCPeerConnection({
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
        { urls: "stun:stun2.l.google.com:19302" },
        { urls: "stun:stun3.l.google.com:19302" },
        { urls: "stun:stun4.l.google.com:19302" }
      ]
    });

    this.channels = {};
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
    this.channels[name] = this.rtc.createDataChannel(name);
  }

  addChannel(channel){
    this.channels[channel.label] = channel;
  }

  get isChannels(){
    return Object.keys(this.channels).length !== 0;
  }

  send(name,data){
    const channel = this.channels[name];

    if(!channel||this.rtc.connectionState !== "connected") return;

    channel.send(JSON.stringify(data));
  }

  close(){
    if(this.rtc.connectionState === "closed") return;

    if(this.isChannels){
      Object.values(this.channels)
        .forEach(ch=>ch.close());
    }

    this.rtc.close();

    this.reset();

    console.log("WebRTC Close");
  }
}

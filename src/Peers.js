class Peers extends EventTarget{
  constructor(client){
    super();

    this.client = client;
    this.list = {};
  }

  all(){
    return Object.values(this.list);
  }

  get(id){
    return this.list[id];
  }

  add(data){
    const peer = this.get(data.client.id);
    if(peer){
      peer.update(data);

      this.dispatchEvent(new CustomEvent("update",{
        "detail": {
          "peer": data
        }
      }));
    }else{
      this.list[data.client.id] = new Peer(data);

      this.dispatchEvent(new CustomEvent("add",{
        "detail": {
          "peer": this.get(data.client.id)
        }
      }));
    }
  }

  remove(id){
    this.dispatchEvent(new CustomEvent("remove",{
      "detail": {
        "peer": this.get(id)
      }
    }));

    delete this.list[id];
  }

  filter(){
    this.all()
      .forEach(peer=>{
        if(new Date() - new Date(peer.time) > 10000){
          this.remove(peer.id);
        }
      });
  }

  connect(id){
    const peer = this.get(id);
    if(!peer) return;

    console.log("WebRTC Open");

    if(peer.isChannels()){
      this.event(peer);
    }else{
      peer.rtc.addEventListener("datachannel",(event)=>{
        peer.addChannel(event.channel);

        this.event(peer);
      });
    }
  }

  disconnect(){
    this.all()
      .forEach(peer=>{
        if(!peer.isConnected) return;
        peer.isConnected = false;

        peer.close();
      });
  }

  send(data){
    this.all()
      .forEach(peer=>{
        if(!peer.isConnected) return;

        peer.send("chat",this.client.rtcPacket(data));
      });
  }

  sendFile(file){
    if(file.size === 0) throw new Error("空のファイルは送信できません");
    return
    this.all()
      .forEach(peer=>{
        if(!peer.isConnected) return;

        peer.send("file",file);
      });
  }

  event(peer){
    Object.values(peer.channels)
      .forEach(channel=>{
        channel.addEventListener("open",()=>{
          console.log(`${channel.label} DataChannel Open`);

          peer.isConnected = true;
          this.dispatchEvent(new CustomEvent("join",{
            "detail": {
              "peer": peer
            }
          }));
        });

        channel.addEventListener("message",(event)=>{
          const data = parse(event.data.toString());
          if(!data) return;

          console.log(`${channel.label} DataChannel Data: ${JSON.stringify(data)}`);

          this.dispatchEvent(new CustomEvent("message",{
            "detail":{
              "peer": peer,
              "data": data
            }
          }));
        });

        channel.addEventListener("error",(event)=>{
          console.log(`${channel.label} DataChannel Error: ${event.error}`);
        });

        channel.addEventListener("close",()=>{
          console.log(`${channel.label} DataChannel Close`);

          peer.close();

          this.dispatchEvent(new CustomEvent("leave",{
            "detail": {
              "peer": peer
            }
          }));
        });
      });
  }
}
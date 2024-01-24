class Peers extends EventTarget{
  constructor(client){
    super();

    this.client = client;
    this.list = {};

    this.stream = new ReceiveStream();

    this.stream.addEventListener("data",(event)=>{
      this.dispatchEvent(new CustomEvent("file",{
        "detail":{
          "peer": this.stream.peer,
          "data": event.detail.data,
          "file": this.stream.file
        }
      }));
    });
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

    if(peer.isChannels){
      console.log(peer)
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
        peer.close();
      });
  }

  #sendData(type,data){
    this.all()
      .forEach(peer=>{
        peer.send(type,data);
      });
  }

  send(data){
    this.#sendData("chat",this.client.rtcPacket(data));
  }

  sendFile(file){
    if(file.size === 0) throw new Error("空のファイルは送信できません");

    if(file.size > 31457280) throw new Error("30MB以上のファイルは送信できません");

    const stream = new SendStream(file);

    this.#sendData("file",{
      "type": "STREAM_START",
      "file":{
        "name": file.name,
        "size": file.size,
        "type": file.type
      },
      "time": new Date()
    });

    stream.addEventListener("data",(event)=>{
      this.#sendData("file",{
        "type": "STREAM_DATA",
        "data": event.detail.data,
        "offset": event.detail.offset,
        "time": new Date()
      });
    });
  }

  event(peer){
    Object.values(peer.channels)
      .forEach(channel=>{
        channel.addEventListener("open",()=>{
          console.log(`[${channel.label}] DataChannel Open`);

          this.dispatchEvent(new CustomEvent("join",{
            "detail": {
              "type": channel.label,
              "peer": peer
            }
          }));
        });

        channel.addEventListener("message",(event)=>{
          const data = parse(event.data.toString());
          if(!data) return;

          console.log(`[${channel.label}] DataChannel Data: ${JSON.stringify(data)}`);

          if(channel.label === "chat"){
            this.dispatchEvent(new CustomEvent("message",{
              "detail":{
                "peer": peer,
                "data": data
              }
            }));
          }else if(channel.label === "file"){
            if(data.type === "STREAM_START"){
              this.stream.set(data.file,peer);
            }else if(data.type === "STREAM_DATA"){
              this.stream.receive(data.data);
            }
          }
        });

        channel.addEventListener("error",(event)=>{
          console.log(`[${channel.label}] DataChannel Error: ${event.error}`);
        });

        channel.addEventListener("close",()=>{
          console.log(`[${channel.label}] DataChannel Close`);

          peer.close();

          this.dispatchEvent(new CustomEvent("leave",{
            "detail": {
              "type": channel.label,
              "peer": peer
            }
          }));
        });
      });
  }
}
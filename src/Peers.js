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

    if(peer.channel){
      this.event(peer);
    }else{
      peer.rtc.addEventListener("datachannel",(event)=>{
        peer.channel = event.channel;

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

  send(data,type){
    this.all()
      .forEach(peer=>{
        if(!peer.isConnected) return;

        peer.send(this.client.packet({
          "type": type || "SEND_MESSAGE",
          "data": data
        }));
      });
  }

  event(peer){
    peer.channel.addEventListener("open",()=>{
      console.log("WebRTC Open");

      peer.isConnected = true;
      this.dispatchEvent(new CustomEvent("open",{
        "detail": {
          "peer": peer
        }
      }));

      this.send({},"JOIN");
    });

    peer.channel.addEventListener("message",(event)=>{
      const data = parse(event.data.toString());
      if(!DataChecker(data)) return;

      console.log(`WebRTC Data: ${JSON.stringify(data)}`);

      if(data.type === "SEND_MESSAGE"){
        this.dispatchEvent(new CustomEvent("message",{
          "detail":{
            "peer": peer,
            "data": data.data
          }
        }));
      }else if(data.type === "JOIN"){
        this.dispatchEvent(new CustomEvent("join",{
          "detail":{
            "peer": peer
          }
        }));
      }else if(data.type === "LEAVE"){
        this.dispatchEvent(new CustomEvent("leave",{
          "detail":{
            "peer": peer
          }
        }));
      }
    });

    peer.channel.addEventListener("error",(event)=>{
      console.log(`WebRTC Error: ${event.error}`);

      peer.close();
    });

    peer.channel.addEventListener("close",()=>{
      console.log("WebRTC Close");

      peer.close();

      this.dispatchEvent(new CustomEvent("leave",{
        "detail": {
          "peer": peer
        }
      }));
    });
  }
}
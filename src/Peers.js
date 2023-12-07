class Peers extends EventTarget{
  constructor(client){
    super();

    this.client = client;
    this.list = {};
  }

  gets(){
    return Object.values(this.list);
  }

  get(id){
    return this.list[id];
  }

  add(data){
    this.dispatchEvent(new CustomEvent("add",{
      "peer": data
    }));

    this.list[data.client.id] = new Peer(data);
  }

  remove(id){
    this.dispatchEvent(new CustomEvent("remove",{
      "peer": this.get(id)
    }));

    delete this.list[id];
  }

  filter(){
    Object.values(this.list)
      .forEach(peer=>{
        if(new Date() - new Date(peer.time) < 10000) return this.remove(peer.client.id);
      });
  }

  connect(id){
    const peer = this.get(id);
    if(!peer) return;

    peer.channel.addEventListener("open",()=>{
      console.log("WebRTC Open");

      peer.isConnected = true;
      this.dispatchEvent(new CustomEvent("open",{
        "peer": peer
      }));
    });

    peer.channel.addEventListener("message",event=>{
      const data = parse(event.data.toString());
      if(!DataChecker(data)) return;
      console.log(`WebRTC Data: ${data}`);

      if(!DataChecker(data)) return;

      if(data.type === "SEND_MESSAGE"){
        this.dispatchEvent(new CustomEvent("message",{
          "peer": peer,
          "data": data
        }));
      }
    });

    peer.channel.addEventListener("error",event=>{
      console.log(`WebRTC Error: ${event.error}`);

      peer.close();
      this.dispatchEvent(new CustomEvent("close",{
        "peer": peer
      }));
    });

    peer.channel.addEventListener("close",()=>{
      console.log("WebRTC Close");

      peer.close();
      this.dispatchEvent(new CustomEvent("close",{
        "peer": peer
      }));
    });
  }

  disconnect(){
    this.gets()
      .forEach(peer=>{
        if(!peer.isConnected) return;
        peer.isConnected = false;

        peer.close();
      });
  }

  send(data){
    this.gets()
      .forEach(peer=>{
        if(!peer.isConnected) return;

        peer.send(this.client.packet({
          "type": "SEND_MESSAGE",
          "data": data
        }));
      });
  }
}
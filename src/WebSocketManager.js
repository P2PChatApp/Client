class WebSocketManager{
  constructor(client,peers,url){

    this.client = client;
    this.peers = peers;
    this.url = url;

    this.connect();
  }

  connect(){
    this.ws = new WebSocket(this.url);

    this.ws.addEventListener("open",()=>{
      console.log("WebSocket Open");

      this.send(this.client.packet({
        "type": "AUTH"
      }));
    });

    this.ws.addEventListener("close",()=>{
      console.log("WebSocket Close");

      setTimeout(()=>{
        this.connect();
      },5000);
    });

    this.ws.addEventListener("error",()=>{
      console.log("WebSocket Error");
    });

    this.ws.addEventListener("message",async(event)=>{
      const data = parse(event.data.toString());
      if(!DataChecker(data)) return;

      console.log(`WebSocket Data: ${JSON.stringify(data)}`);

      if(data.type === "OFFER_REQUEST"){
        const peer = this.peers.get(data.client.id);
        if(!peer) return;

        await peer.setOffer(data.data);

        this.send(this.client.packet({
          "type": "ANSWER_REQUEST",
          "address": peer.id,
          "data": await peer.createAnswer()
        }));

        this.peers.connect(data.client.id);
      }else if(data.type === "ANSWER_REQUEST"){
        const peer = this.peers.get(data.client.id);
        if(!peer) return;

        await peer.setAnswer(data.data);

        this.peers.connect(data.client.id);
      }else if(data.type === "DATA_REQUEST"){
        this.send(this.client.packet({
          "type": "DATA_RESPONSE",
          "address": data.client.id
        }));
      }else if(data.type === "DATA_RESPONSE"){
        this.peers.add(data);
      }
    });
  }

  send(data){
    if(this.ws.readyState !== 1) return;

    this.ws.send(JSON.stringify(data));
  }
}
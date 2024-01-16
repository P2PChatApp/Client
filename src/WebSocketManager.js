class WebSocketManager{
  constructor(client,peers){

    this.client = client;
    this.peers = peers;

    this.connect();
  }

  connect(){
    this.ws = new WebSocket("wss://ws.gakerbot.net");

    this.ws.addEventListener("open",()=>{
      console.log("WebSocket Open");

      this.send(this.client.packet({
        "type": "AUTH"
      }));
    });

    this.ws.addEventListener("close",(code,reason)=>{
      console.log(`WebSocket Close: ${code} ${reason}`);

      setTimeout(()=>{
        this.connect();
      },5000);
    });

    this.ws.addEventListener("error",(error)=>{
      console.log(`WebSocket Error: ${error}`);
    });

    this.ws.addEventListener("message",async(_data)=>{
      const data = parse(_data.toString());
      if(!DataChecker(data)) return;

      console.log(`WebSocket Data: ${data}`);

      if(data.type === "OFFER_REQUEST"){
        const peer = this.peers.get(data.client.id);
        if(!peer) return;

        await peer.setOffer(data.data);

        this.send(this.client.packet({
          "type": "ANSWER_REQUEST",
          "address": peer.id,
          "data": await peer.createAnswer()
        }));
      }else if(data.type === "ANSWER_REQUEST"){
        const peer = this.peers.get(data.client.id);
        if(!peer) return;

        await peer.setAnswer(data.data);

        this.send(this.client.packet({
          "type": "READY",
          "address": peer.id
        }));

        this.peers.connect(data.client.id);
      }else if(data.type === "READY"){
        await this.peers.connect(data.client.id);
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
    this.ws.send(JSON.stringify(data));
  }
}
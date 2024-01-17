class System extends EventTarget{
  constructor(){
    super();

    this.client = new Client(this.createId(10),this.createId(6));
    this.peers = new Peers(this.client);
    this.ws = new WebSocketManager(this.client,this.peers);

    setInterval(()=>{
      this.ws.send(this.client.packet({
        "type": "DATA_RESPONSE"
      }));

      this.peers.filter();

      this.dispatchEvent(new CustomEvent("update"));
    },3000);
  }

  createId(length){
    const str = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let id = "";
    for(let i = 0;i < length;i++){
      id += str.charAt(Math.floor(Math.random()*str.length));
    }
    return id;
  }

  getGroups(){
    return this.peers.all()
      .map(peer=>peer.group)
      .filter(group=>Object.keys(group).length !== 0)
      .filter((group,i,array)=>array.indexOf(group) === i);
  }

  async createGroup(name,isPublic){
    const id = this.createId(8);

    this.client.group = {
      "name": name,
      "id": isPublic ? id : await hash(id),
      "isPublic": isPublic
    };

    return id;
  }

  joinGroup(id){
    const group = this.getGroups()
      .find(async(group)=>{
        if(group.isPublic){
          return group.id === id;
        }else{
          return group.id === await hash(id);
        }
      });

    if(!group) throw new Error("指定したグループが存在しません");

    this.client.group = {
      "name": group.name,
      "id": id,
      "isPublic": group.isPublic
    };
  }

  leaveGroup(){
    this.peers.disconnect();
    this.client.group = {};
  }

  connect(){
    if(Object.keys(this.client.group).length === 0) throw new Error("グループに参加していません");

    this.peers.all()
      .filter(peer=>peer.group?.id === this.client.group.id)
      .forEach(async(peer)=>{
        await peer.createChannel("chat");

        this.ws.send(this.client.packet({
          "type": "OFFER_REQUEST",
          "address": peer.id,
          "data": await peer.createOffer()
        }));
      });
  }
}
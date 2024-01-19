class Peer extends WebRTCManager{
  constructor(data){
    super();

    this.name = data.client.name;
    this.id = data.client.id;
    this.time = data.client.time;
    this.group = data.group;

    this.isConnected = false;
  }

  update(data){
    this.name = data.client.name;
    this.id = data.client.id;
    this.time = data.client.time;
    this.group = data.group;
  }
}
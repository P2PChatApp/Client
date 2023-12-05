const WebRTCManager = require("./WebRTCManager");

module.exports = class Peer extends WebRTCManager{
  constructor(data){
    super();

    this.name = data.client.name;
    this.id = data.client.id;
    this.group = data.group;
    this.time = data.time;
    
    this.isConnected = false;
  }
}
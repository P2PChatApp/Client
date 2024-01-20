class Client{
  constructor(config){
    this.id = config.id;
    this.name = config.name;
    this.group = {};
  }

  packet(data){
    return {
      "type": data.type,
      "address": data.address,
      "client":{
        "name": this.name,
        "id": this.id,
        "time": new Date()
      },
      "group": this.group,
      "data": data.data
    };
  }
}
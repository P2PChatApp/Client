module.exports = class Client{
  constructor(id,name){
    this.id = id;
    this.name = name;
    this.group = {};
  }

  packet(data){
    return JSON.stringify({
      "type": data.type,
      "address": data.address,
      "client":{
        "name": this.name,
        "id": this.id,
        "time": new Date()
      },
      "group": this.group,
      "data": data.data
    });
  }
}
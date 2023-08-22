const DataManager = require("../module/DataManager.js");
module.exports = (type,data,address)=>{
  return {
    "type": type,
    "address": address,
    "client": DataManager.getClient(),
    "group": DataManager.getGroup(),
    "data": data
  };
}
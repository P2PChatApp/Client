const DataManager = require("../module/DataManager.js");
module.exports = (type,data)=>{
  return {
    "type": type,
    "client": DataManager.getClient(),
    "group": DataManager.getGroup(),
    "data": data
  };
}
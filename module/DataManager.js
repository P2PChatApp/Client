let status = "IDLING";
let group = {};
let connection = {};
let clients = {};

module.exports = {
  getStatus(){
    return status;
  },
  changeStatus(name){
    status = name;
    return status;
  },
  getGroup(){
    return group;
  },
  changeGroup(data){
    group = data;
    return group;
  },
  getConnections(){
    return connection;
  },
  getConnection(clientId){
    return connection[clientId];
  },
  addConnection(clientId,data){
    connection[clientId] = data;
  },
  deleteConnection(clientId){
    delete connection[clientId];
  },
  getClients(){
    return clients;
  },
  getClient(clientId){
    return clients[clientId];
  },
  addClient(clientId,data){
    clients[clientId] = data;
  },
  deleteClient(clientId){
    delete clients[clientId];
  },
}
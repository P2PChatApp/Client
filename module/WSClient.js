const RTCClient = require("./RTCClient");
const RTCManager = require("./RTCManager");
const DataManager = require("./DataManager");
const Builder = require("../lib/Builder");
const parse = require("../lib/parse");

/**
 * WebSocketクライアント
 */
module.exports = class WSClient{
  /**
   * システム構築
   */
  constructor(){
    this.RTCManager = new RTCManager();

    this.connect();
  }

  /**
   * WebSocket接続
   */
  connect(){
    this.ws = new WebSocket("ws://ws.gakerbot.net");

    this.ws.addEventListener("open",()=>{
      console.log("WebSocket Open");

      this.ws.send(Builder(
        "AUTH",
        DataManager.getClient().id
      ));
    });

    this.ws.addEventListener("close",(code,reason)=>{
      console.log(`WebSocket Close: ${code} ${reason}`);

      setTimeout(()=>{
        this.connect();
      },10000);
    });
    
    this.ws.addEventListener("error",(error)=>{
      console.log(`WebSocket Error: ${error}`); 
    });

    this.ws.addEventListener("message",async(_data)=>{
      const data = parse(_data.toString());
      if(!data) return;
      console.log(`WebSocket Data: ${data}`);

      this.event(data);
    });
  }

  /**
   * イベント制御
   * @param {Object} data 通信データ 
   */
  event(data){
    if(data.type === "OFFER_REQUEST"){
      const connection = DataManager.setConnection(data.client.id,{
        "client": data.client,
        "group": data.group,
        "rtc": new RTCClient()
      });

      await connection.rtc.setOffer(data.data);

      this.ws.send(Builder(
        "ANSWER_REQUEST",
        await connection.rtc.createAnswer()
      ));
    }else if(data.type === "ANSWER_REQUEST"){
      await DataManager.getConnection(data.client.id).rtc.setAnswer(data.data);

      this.ws.send(Builder(
        "READY",
        "",
        data.client.id
      ));

      DataManager.setClient({"status":"CONNECTING"});

      this.RTCManager.connect(data.client.id);
    }else if(data.type === "READY"){
      DataManager.setClient({"status":"CONNECTING"});

      this.RTCManager.connect(data.client.id);
    }else if(data.type === "DATA_REQUEST"){
      this.ws.send(Builder(
        "DATA_RESPONSE",
        new Date()
      ));
    }else if(data.type === "DATA_RESPONSE"){
      DataManager.setPeer(data);
    }
  }

  /**
   * 他のクライアントに送信
   * @param {Object} data 通信データオブジェクト
   */
  send(data){
    this.ws.send(JSON.stringify(data));
  }
}
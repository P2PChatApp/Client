/**
 * WebSocketクライアント
 */
module.exports = class WSClient{
  /**
   * 接続の開始
   */
  constructor(){
    this.ws = new WebSocket("ws://signaling.gakerbot.net");

    this.ws.addEventListener("close",(code,reason)=>{
      console.log(`WebSocket Close: ${code} ${reason}`);
    });
    
    this.ws.addEventListener("error",(error)=>{
      console.log(`WebSocket Error: ${error}`); 
    });
  }

  /**
   * 他のクライアントに送信
   * @param {Object} data 通信データオブジェクト
   */
  send(data){
    this.ws.send(JSON.stringify(data));
  }
}
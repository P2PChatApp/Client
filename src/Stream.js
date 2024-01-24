class SendStream extends EventTarget{
  constructor(file){
    super();

    this.file = file;
    this.offset = 0;
    this.chunkSize = 16384;
    this.fileReader = new FileReader();

    this.fileReader.addEventListener("error",()=>{
      throw new Error("ファイルを正しく読み込めませんでした");
    });

    this.fileReader.addEventListener("load",(event)=>{
      const data = event.target.result;

      this.offset += data.byteLength;

      this.dispatchEvent(new CustomEvent("data",{
        "detail": {
          "data": parseArray(data),
          "offset": this.offset
        }
      }));

      if(this.offset < this.file.size){
        this.readData();
      }
    });

    this.readData();
  }

  readData(){
    const data = this.file.slice(this.offset,this.offset+this.chunkSize);
    this.fileReader.readAsArrayBuffer(data);
  }

  parseArray(buffer){
    return Array.from(new Uint8Array(buffer));
  }
}

class ReceiveStream extends EventTarget{
  constructor(){
    super();

    this.buffer = [];
    this.bufferSize = 0;
    this.timeout = null;
  }

  set(file,peer){
    this.file = file;
    this.peer = peer;
  }

  reset(){
    this.file = null;
    this.buffer = [];
    this.bufferSize = 0;
    clearTimeout(this.timeout);
  }

  receive(chunk){
    const data = this.parseBuffer(chunk);

    this.buffer.push(data);
    this.bufferSize += data.byteLength;

    clearTimeout(this.timeout);

    this.timeout = setTimeout(()=>{
      this.reset();
    },1000);

    if(this.bufferSize === this.file.size){
      this.dispatchEvent(new CustomEvent("data",{
        "detail": {
          "data": new Blob(this.buffer)
        }
      }));

      this.reset();
    }
  }

  parseBuffer(data){
    return new Uint8Array(data).buffer;
  }
}
class SendStream extends EventTarget{
  constructor(file){
    super();

    this.file = file;
    this.offset = 0;
    this.chunkSize = 16384
    this.fileReader = new FileReader();

    this.fileReader.addEventListener("error",()=>{
      throw new Error("ファイルを正しく読み込めませんでした");
    });

    this.fileReader.addEventListener("load",(event)=>{
      const data = event.target.result;

      this.offset += data.byteLength;

      this.dispatchEvent(new CustomEvent("data",{
        "detail": {
          "data": data,
          "offset": this.offset
        }
      }));

      if(this.offset < this.file.size){
        this.readData();
      }else{
        this.dispatchEvent(new CustomEvent("end"));
      }
    });

    this.readData();
  }

  readData(){
    const data = this.file.slice(this.offset,this.offset+this.chunkSize);
    this.fileReader.readAsArrayBuffer(data);
  }
}

class ReceiveStream extends EventTarget{
  constructor(file){
    super();

    this.file = file;
    this.buffer = [];
    this.bufferSize = 0;
  }

  receive(chunk){
    const data = this.parseBuffer(chunk);

    this.buffer.push(data);
    this.bufferSize += data.byteLength;

    if(this.bufferSize === this.file.size){
      this.dispatchEvent(new CustomEvent("data",{
        "detail": {
          "data": new Blob(this.buffer)
        }
      }));
    }
  }

  parseBuffer(data){
    return new Uint8Array(data).buffer;
  }
}
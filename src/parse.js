function parse(data){
  try{
    return JSON.parse(data);
  }catch{
    return null;
  }
}
function DataChecker(data){
  if(!data) return false;

  if(
    !data.type||
    !data.client?.id||
    !data.client?.name||
    !data.client?.time
  ){
    console.log(`欠損パケット: ${JSON.stringify(data)}`);
    return false;
  }

  if(Object.keys(data.group).length !== 0){
    if(
      !data.group.id||
      !data.group.name
    ){
      console.log(`欠損パケット: ${JSON.stringify(data)}`);
      return false;
    }
  }

  return true;
}
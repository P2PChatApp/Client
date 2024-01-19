function DataChecker(data){
  if(!data) return false;

  if(
    !data.type||
    !data.client?.id||
    !data.client?.name||
    !data.client?.time
  ) return false;

  if(Object.keys(data.group).length !== 0){
    if(
      !data.group.id||
      !data.group.name
    ) return false;
  }

  return true;
}
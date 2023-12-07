function DataChecker(data){
  if(
    !data.type||
    !data.client?.id||
    !data.client?.name
  ) return false;

  if(Object.keys(data.group).length !== 0){
    if(
      !data.group.id||
      !data.group.name
    ) return false;
  }

  return true;
}
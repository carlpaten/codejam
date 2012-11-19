function getManager(time, strategy) {
  
  var time_period = time / 1800;
    
  var manager_period = managerPeriodFrom(time_period) * 2;

  if (strategy == "EMA" || strategy == "TMA") {
    manager_period++;
  }

  manager_period++;

  return "Manager" + manager_period;
}

function managerPeriodFrom(time_period) {  
  
  if (time_period == 4) {
    return 1;
  } else if(time_period == 13) {
    return 3;
  } else if(time_period <= 8) {
    return 0;
  } else {
    return 2;
  }
}

exports.getManager = getManager;

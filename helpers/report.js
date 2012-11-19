var schedule = require('./schedule');

function formatTransactionInfo(times, modes, prices, strategies) {
  var transactions = _.zip(times, modes, prices, strategies);
  var t = _.map(transactions, formatTransaction);
  return _.filter(t, function(a) { return a != null });
}

function formatTransaction(data) {
  var json;
  try {
    json = {
      time: data[0],
      type: data[1],
      price: data[2],
      manager: schedule.getManager( data[0], data[3] ),
      strategy: data[3]
    }
    return json;
  }
  catch(e) { 
    return null;
  }
}

exports.formatTransactionInfo = formatTransactionInfo;
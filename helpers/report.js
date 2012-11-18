var schedule = require('./schedule');

function formatTransactionInfo(times, modes, prices, strategies) {
  var transactions = _.zip(times, modes, prices, strategies);
  return _.map(transactions, formatTransaction);
}

function formatTransaction(data) {
  var json;
  try {
    json = {
      time: data[0].toString(),
      type: data[1],
      price: data[2],
      manager: schedule.getManager( data[0], data[3] ),
      strategy: data[3]
    }
  }
  catch(e) { console.log(e) }

  return json;
}

exports.formatTransactionInfo = formatTransactionInfo;
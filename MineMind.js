var program = require('commander'); // for nice command line arg parsing
var mineflayer = require('mineflayer');
var mcdata = require('minecraft-data')(mineflayer.version);

// behaviours
var trading = require('./behaviours/trading.js');

program
  .version('0.0.1')
  .option('-a, --address [address of server]', 'specifiy server ip')
  .option('-a, --address [address of server]', 'specifiy server ip')
  .option('-o, --owner [name]', 'Set owner')
  .option('-c, --cheese [type]', 'Add the specified type of cheese [marble]', 'marble')
  .parse(process.argv);



if(process.argv.length < 4 || process.argv.length > 6) {
  console.log('Usage : node trader.js <host> <port> [<name>] [<password>]');
  process.exit(1);
}



console.log('Commands :\n' +
  '  show villagers\n' +
  '  show inventory\n' +
  '  show trades <id>\n' +
  '  trade <id> <trade> [<times>]');

var bot = mineflayer.createBot({
  host: process.argv[2],
  port: parseInt(process.argv[3]),
  username: process.argv[4] ? process.argv[4] : 'trader',
  password: process.argv[5],
  verbose: true,
});



var is_public = false;

bot.smartchat = function (message) {
  if (is_public) {
    bot.chat(message);
  } else {
    bot.chat("/tell "+owner+message)
  }
};

bot.on('chat', function(username, message) {
  if(username === bot.username) return; // ignores own messages
  var command = message.split(' ');
  switch(true) {
    case 'show villagers' === message:
      trading.showVillagers();
      break;
    case 'show inventory' === message:
      trading.showInventory();
      break;
    case /^show trades [0-9]+$/.test(message):
      trading.showTrades(command[2]);
      break;
    case /^trade [0-9]+ [0-9]+( [0-9]+)?$/.test(message):
      trading.trade(command[1], command[2], command[3]);
      break;
  }
});

var program = require('commander'); // for nice command line arg parsing
var mineflayer = require('mineflayer');
var mcdata = require('minecraft-data')(mineflayer.version);

// behaviours
var trading = require('./behaviours/trading.js');

program
  .option('-h, --host [host]', 'specifiy server ip')
  .option('-p, --port [port]', 'specifiy server port')
  .option('-o, --owner [name]', 'set bot owner')
  .option('-u, --username [name]', 'set username for bot to login with')
  .option('-p, --password [password]', 'set password for bot to login with')
  .parse(process.argv);

bot = mineflayer.createBot({
  host: program.host,
  port: parseInt(program.port),
  username: program.username || "MineMindBot",
  password: program.password,
  verbose: true,
});

bot.owner = program.owner;

bot.smartChat = function (message) {
  if (bot.owner) {
    bot.chat("/tell "+bot.owner+ " " + message);
  } else {
    bot.chat(message);
  }
};

function ListCommands () {
  console.log('Commands :\n' +
    '  show villagers\n' +
    '  show inventory\n' +
    '  show trades <id>\n' +
    '  trade <id> <trade> [<times>]');
}

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

exports.bot = bot;

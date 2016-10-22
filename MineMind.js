var program = require('commander'); // for nice command line arg parsing
var mineflayer = require('mineflayer');
var mcdata = require('minecraft-data')(mineflayer.version);

// more bot smarts
var blockfinderPlugin = require('mineflayer-blockfinder')(mineflayer);
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);

// behaviours
var survival = require('./behaviours/survival.js');
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

// enable mineflayer extensions
navigatePlugin(bot);
//blockfinderPlugin(bot);

bot.on("login",function () {
  console.log("bot logged in");
});
bot.on("kicked",function (reason, loggedIn) {
  console.log("bot kicked for: "+reason);
});

bot.on("diggingCompleted", function (error) {
  bot.smartChat("Digging completed "+ error);
  console.log("Digging completed ");
  console.log(error);
});
bot.on("diggingAborted", function (error) {
  bot.smartChat("diggingAborted "+ error);
  console.log("diggingAborted ");
  console.log(error);
});

bot.owner = program.owner;

function getOwnerEntity () {
  let owner = bot.players[bot.owner]
  return owner.entity;
}

bot.smartChat = function (message) {
  if (bot.owner) {
    bot.whisper(bot.owner,message);
  } else {
    bot.chat(message);
  }
};

bot.moveToTarget = function (targetEntity) {
    if (targetEntity == null) return;
    console.log("Heading to location of ");
    console.log(targetEntity);

    var path = bot.navigate.findPathSync(targetEntity.position, {
        timeout: 1 * 1000,
        endRadius: 4,
    });
    bot.navigate.walk(path.path, function() {
        if (targetEntity != null) {
            //bot.lookAt(targetEntity.position.plus(vec3(0, 1.62, 0)));
        }
    });
}

bot.echo = false;

function ListCommands () {
  bot.smartChat("Commands:");
  let commands = [
    "show villagers",
    "show inventory",
    "show trades <id>",
    "trade <id> <trade> [<times>]"
  ];
  for(command of commands) {
    bot.smartChat(" "+command);
  }
}

function ReceivedMessage (username, message) {
    if(username === bot.username) return; // ignores own messages
    if(bot.owner && bot.owner !== username) return; // if bot has an owner, ignore everyone else
    if(bot.echo) bot.smartChat(username+" sent -- " +message);
    var command = message.split(' ');
    switch(true) {
      case 'help' === message:
        ListCommands();
        break;
      case 'come' === message:
        bot.moveToTarget(getOwnerEntity());
        break;
      case 'enable echo' === message:
        bot.echo = true;
        break;
      case 'disable echo' === message:
        bot.echo = false;
        break;
      case 'show health' === message:
        survival.ShowHealth();
        break;
      case 'search enemies' === message:
        survival.SearchEnemies();
        break;
      case 'show villagers' === message:
        trading.showVillagers();
        break;
      case 'dig hole' === message:
        survival.DigHole();
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
}

bot.on('whisper',ReceivedMessage );
bot.on('chat',ReceivedMessage );

exports.bot = bot;

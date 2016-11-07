var replSrv = require('repl').start({ useGlobal: false }); // allow chrome console like interactivity
var program = require('commander'); // for nice command line arg parsing
var mineflayer = require('mineflayer');
var mcdata = require('minecraft-data')(mineflayer.version);


// more bot smarts
var blockfinderPlugin = require('mineflayer-blockfinder')(mineflayer);
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);

program
  .option('-h, --host [host]', 'specifiy server ip, default: localhost')
  .option('-p, --port [port]', 'specifiy server port, default: 25565')
  .option('-o, --owner [name]', 'set bot owner')
  .option('-u, --username [name]', 'set username for bot to login with, default: MineMindBot')
  .option('-p, --password [password]', 'set password for bot to login with, optional with offline server')
  .parse(process.argv);

bot = mineflayer.createBot({
  host: program.host,
  port: parseInt(program.port),
  username: program.username || "MineMindBot",
  password: program.password,
  verbose: true,
});

// behaviours
var survival = require('./behaviours/survival.js');
var trading = require('./behaviours/trading.js');
var gathering = require('./behaviours/gathering.js');
var mining = require('./behaviours/mining.js');
var simple = require('./behaviours/simple.js');

replSrv.context.bot = bot;
replSrv.context.survival = survival;
replSrv.context.gathering = gathering;
replSrv.context.mining = mining;

// enable mineflayer extensions
navigatePlugin(bot);
blockfinderPlugin(bot);

bot.on("login",function () {
  console.log("bot logged in");
});
bot.on("kicked",function (reason, loggedIn) {
  console.log("bot kicked for: "+reason);
});
bot.on("death",function () {
  console.log("bot was killed");
});

bot.on("diggingCompleted", function (error) {
  bot.smartChat("diggingCompleted, error: ");
  console.log(error);
});
bot.on("diggingAborted", function (error) {
  bot.smartChat("diggingAborted, error: ");
  console.log(error);
});

bot.owner = program.owner;

bot.getOwnerEntity = function () {
  let owner = bot.players[bot.owner];
  return owner.entity;
};

bot.smartChat = function (message) {
  if (bot.owner) {
    bot.whisper(bot.owner,message);
  } else {
    bot.chat(message);
  }
  console.log("Chat: "+ message);
};

bot.findClosestTarget = function(targets) {
  let closest_target = null;
  let shortest_distance = 100;
  for(let target of targets) {
    let distance = bot.entity.position.distanceTo(target.position);
    if (distance < shortest_distance) {
      shortest_distance = distance;
      closest_target = target;
    }
  }
  return closest_target;
};

// a function to test if the bot is close enough to interact with the block
bot.canReach = function(block) {}

bot.moveToTarget = function (targetEntity,callback) {
    if (targetEntity === null) return;

    var path = bot.navigate.findPathSync(targetEntity.position, {
        timeout: 1000,
        endRadius: 2,
    });
    if (callback === undefined) {
        callback = function() { // provide a defualt callback
            if (targetEntity !== null) {
                //console.log("Finished moving");
            }
        };
    }
    bot.navigate.walk(path.path, callback);
    if (path.status !== 'success') {
      console.log("Pathing failed because: "+ path.status);
    }
};

// this function tries to determine if an object is visible to the bot
// use some sort of raymarching alg
bot.testVisible = function (entity) {

};

bot.echo = false;

function ListCommands () {
  bot.smartChat("Commands:");
  let commands = [
    "show villagers",
    "show inventory",
    "show trades <id>",
    "trade <id> <trade> [<times>]"
  ];
  for(let command of commands) {
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
      case 'follow' === message:
        simple.Follow();
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
      case 'survive' === message:
        survival.SearchEnemies();
        break;
      case 'show villagers' === message:
        trading.showVillagers();
        break;
      case 'dig hole' === message:
        survival.DigHole();
        break;
      case 'mine' === message:
        mining.Mine();
        break;
      case 'show inventory' === message:
        trading.showInventory();
        break;
      case 'gather wood' === message:
        gathering.Find(17);
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

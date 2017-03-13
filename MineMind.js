var replSrv = require('repl').start({ useGlobal: false }); // allow chrome console like interactivity
var program = require('commander'); // for nice command line arg parsing
var mineflayer = require('mineflayer');
var mcdata = require('minecraft-data')(mineflayer.version);


// more bot smarts
var blockfinderPlugin = require('mineflayer-blockfinder')(mineflayer);
var navigatePlugin = require('mineflayer-navigate')(mineflayer);
//var scaffoldPlugin = require('mineflayer-scaffold')(mineflayer);

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
var attention = require('./behaviours/attention.js');
var survival = require('./behaviours/survival.js');
var trading = require('./behaviours/trading.js');
var gathering = require('./behaviours/gathering.js');
var mining = require('./behaviours/mining.js');
var simple = require('./behaviours/simple.js');

replSrv.context.bot = bot;
replSrv.context.attention = attention;
replSrv.context.simple = simple;
replSrv.context.survival = survival;
replSrv.context.gathering = gathering;
replSrv.context.mining = mining;

// enable mineflayer extensions
navigatePlugin(bot);
blockfinderPlugin(bot);

let spawn_time = null;

let last_death_cause = null;

let death_logs = [];

function ProcessDeathMessage(message) {
  if (message.translate.substring(0,5) !== "death") { return null;}

  let death_reason = "killed with: " + message.translate;
  if (message.with[1]) {
    death_reason = death_reason +" by: "+ message.with[1].text;
  }
  return death_reason;
}

bot.on("login",function () {
  console.log("bot logged in");
  attention.Update();
});
bot.on("kicked",function (reason, loggedIn) {
  console.log("bot kicked for: "+reason);
});
bot.on("actionBar",function (message) {
  console.log("actionBar: "+message);
});
bot.on("message",function (message) {
  last_death_cause = ProcessDeathMessage(message);
});
bot.on("entityUpdate",function (entity) {
  attention.CheckEntity(entity); // run after each update
  //console.log("entity: "+entity.displayName);
});

bot.on("spawn",function () {
  spawn_time = new Date();
  console.log("bot spawned");
});
bot.on("death",function () {
  console.log("bot was killed");
  let current_date = new Date();
  let survived_seconds = (current_date - spawn_time) / 1000;
  death_logs.push( {last_death_cause,survived_seconds} );
  console.log("Survived seconds: ");
  console.log(survived_seconds);
});
bot.on("diggingCompleted", function (error) {
  bot.smartChat("diggingCompleted, error: ");
  console.log(error);
});
bot.on("diggingAborted", function (error) {
  bot.smartChat("diggingAborted, error: ");
  console.log(error);
});
process.on('SIGINT', function() {
  console.log("Exiting...");
  console.log(death_logs);
  bot.quit();
  process.exit();
});

bot.owner = program.owner;

bot.smartChat = function (message) {
  if (bot.owner) {
    bot.whisper(bot.owner,message);
  } else {
    bot.chat(message);
  }
  console.log("Chat: "+ message);
};

bot.getOwnerEntity = function () {
  if (!bot.owner) {bot.smartChat("Bot has no owner, cannot obtain entity.");}
  let owner = bot.players[bot.owner];
  return owner.entity;
};


bot.findClosestTarget = function(targets) {
  let closest_target = null;
  let shortest_distance = 100;
  for(let target of targets) {
    if (target !== bot.entity) { // this makes sure to remove bots own entity from consideration
      let distance = bot.entity.position.distanceTo(target.position);
      if (distance < shortest_distance) {
        shortest_distance = distance;
        closest_target = target;
      }
    }
  }
  return closest_target;
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
      case 'player visible' === message:
        let owner_entity = bot.getOwnerEntity();
        if (bot.canSeeBlock(owner_entity)) {
          bot.smartChat("Bot can see you");
        } else {
          bot.smartChat("Bot cannot see you");
        }
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


//gathering.setReturnFunction( gathering.Update ); // for now lets just use a recursive return function
// register behaviours to the attention system
attention.AddBehaviour("survival",survival);
attention.AddBehaviour("gathering",gathering);

// attention.Update() is run on successfull login

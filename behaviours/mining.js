var mineflayer = require('mineflayer');

function mining () {

}
const mining_level = 12; // the level to reach before beginning strip mining

let branch = 0;
let current_level = 0;
let number_branches = 0;
let current_target;

function onMineDiggingCompleted(err) {
  if(err) {
    console.log("error while digging: ");
    console.log(err.stack);
    return;
  }
  console.log("finished digging " + current_target.name);
  mining.Mine();
};

mining.BuildMineshaft = function (level) {

};

mining.MineBranch = function () {

};

mining.StartStripMine = function (level, number_branches) {
  mining.BuildMineshaft(level);

};

mining.BuildStairs = function () {

};


mining.SwitchToTool = function () {
  // switches to tool required to break current_target

};


mining.Mine = function () {
  // make sure not already digging
  //if (!bot.targetDigBlock) {
    let block_underneath = bot.blockAt(bot.entity.position.offset(0, -1, 0)); // the block underneath the bot
    if(block_underneath && bot.canDigBlock(block_underneath)) {
      current_target = block_underneath;
      console.log("Block underneath was dirt");
      bot.moveToTarget(current_target);
      bot.dig(current_target, onMineDiggingCompleted);
    } else {
      console.log("Unable to to dig block");
    }
  //}
};

module.exports = mining;

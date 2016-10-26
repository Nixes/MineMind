/*
this module will contain some techniques for gathering certain special materials
  - Collecting wood
  - Collecting seeds

*/

var mineflayer = require('mineflayer');

function gathering () {

}

let max_search_distance = 30;

gathering.GetWood = function(number, closest_wood) {
  console.log("Closest wood");
  console.log(closest_wood);
  // see if block below is also wood
  let block_below = bot.blockAt(closest_wood.position.plus(mineflayer.vec3(0, -1, 0)));
  if (block_below !== null && block_below.name === 'wood') {
    console.log("Found wood block below target");
  }
};

function BlockFound(thing) {
  bot.smartChat("Really found a block");
  console.log(thing);
}

gathering.Find = function () {
  let block_name = "wood";
//  if (block_name === null) return;
  console.log("Search for "+ block_name);
  /*let search_matches = Object.keys(bot.blocks).map(function (id) {
    return bot.blocks[id];
  }).filter(function (e) {
    return e.name === block_name && bot.entity.position.distanceTo(e.position) < max_search_distance;
  });*/

  let found_block = bot.findBlock({
    point: bot.entity.position,
    matching: 17, // 17 oak wood
  });
    console.log("Found:");
    console.log(found_block);


  /*let closest_target = bot.findClosestTarget(search_matches);
  // run block specific gather methods
  switch(true) {
    case 'wood' === block_name:
      gathering.GetWood(number,closest_target);
      break;
  }*/

};

module.exports = gathering;

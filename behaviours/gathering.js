/*
this module will contain some techniques for gathering certain special materials
  - Collecting wood
  - Collecting seeds

*/

var mineflayer = require('mineflayer');

function gathering () {

}

let max_search_distance = 30;

let current_target;

// the wood blocks of the tree being broken down
gathering.wood_blocks = new Array();

// list of items to collect
gathering.item_que = new Array();


function MovementCallback(stopreason) { // provide a defualt callback
  console.log("stopreason was: " + stopreason);
  if (stopreason === "arrived") {
      console.log("Bot finished moving to resource, starting to to dig it.");
      bot.dig(current_target, onDiggingCompleted);
  }
}

// go to and collect all of item type id within range
gathering.PickUpItem = function(item_id) {

};

/* trees may be surrounded by leaves only one block above dirt, these need to be cleared
 before mining can commence */
gathering.ClearLeaves = function () {

};

// does a 2d search on adjacent blocks
gathering.SeachAdjacentFlat = function (block_search_around,block_id_search) {
  if (block_search_around === null || block_id_search === null) return;
  let blocks_seach = new Array(8);
  blocks_seach[0] = bot.blockAt(block_search_around.position.plus(mineflayer.vec3(1, 0, 0) )); // front
  blocks_seach[1] = bot.blockAt(block_search_around.position.plus(mineflayer.vec3(-1, 0, 0) )); // behind
  blocks_seach[2] = bot.blockAt(block_search_around.position.plus(mineflayer.vec3(0, 0, 1) )); // left
  blocks_seach[3] = bot.blockAt(block_search_around.position.plus(mineflayer.vec3(0, 0, -1) )); // right
  blocks_seach[4] = bot.blockAt(block_search_around.position.plus(mineflayer.vec3(1, 0, 1) )); // left front
  blocks_seach[5] = bot.blockAt(block_search_around.position.plus(mineflayer.vec3(1, 0, -1) )); // right front
  blocks_seach[6] = bot.blockAt(block_search_around.position.plus(mineflayer.vec3(-1, 0, 1) )); // left behind
  blocks_seach[7] = bot.blockAt(block_search_around.position.plus(mineflayer.vec3(-1, 0, -1) )); // right behind

  for (let block of blocks_seach) {
    if (block.type === block_id_search) {
      return true;
    }
  }
  return false;
};

/* this function scans the length of the tree to try and find the
base (where the tree meets the air) */
gathering.FindTreeBase = function (tree_bottom, tree_top) {
  // scans bottom up
  let tree_length = (tree_top.position.y - tree_bottom.position.y) + 1; // the tree count should include the original wood block;
  console.log("Tree length was: " + tree_length);
  for (let i = 0; i < tree_length; i++) {
    let block_search_around = bot.blockAt( tree_bottom.position.plus(mineflayer.vec3(0, i, 0)) );
    if (gathering.SeachAdjacentFlat(block_search_around,0) ) {
      return block_search_around;
    } else {
      console.log("Bot was unable to find the tree base.");
    }
    console.log("Testing level: "+i);
  }
};

gathering.GetWood = function(target_wood) {
  gathering.wood_blocks.length = 0; // clear array
  let tree_bottom = target_wood;
  let tree_top = target_wood;


  // find how deep the tree goes
  let pos_to_test = target_wood.position.plus(mineflayer.vec3(0, -1, 0));
  let is_block_below = true;
  while (is_block_below) {
    pos_to_test = pos_to_test.plus(mineflayer.vec3(0, -1, 0));
    let block_below = bot.blockAt(pos_to_test);
    if (block_below !== null && block_below.material === 'wood') {
      console.log("Found wood block below target");
      tree_bottom = block_below;
      gathering.wood_blocks.push(block_below);
    } else {
      is_block_below = false;
    }
  }
  gathering.wood_blocks.push(target_wood);
  // find out how high the tree goes
  pos_to_test = target_wood.position.plus(mineflayer.vec3(0, -1, 0));
  let is_block_above = true;
  while (is_block_above) {
    pos_to_test = pos_to_test.plus(mineflayer.vec3(0, 1, 0));
    let block_above = bot.blockAt(pos_to_test);
    if (block_above !== null && block_above.material === 'wood') {
      console.log("Found wood block above target");
      tree_top = block_above;
      gathering.wood_blocks.push(block_above);
    } else {
      is_block_above = false;
    }
  }
  // the part of the tree that we can reach will be surrouned by air blocks
  console.log("Bottom of tree: " + tree_bottom.position);
  console.log("Top of tree: " + tree_top.position);
  tree_base = gathering.FindTreeBase(tree_bottom,tree_top);
  current_target = tree_base;
  bot.moveToTarget(current_target,MovementCallback);
  // start digging after we get there
  // bot.dig(current_target, onDiggingCompleted);
};

function onDiggingCompleted(err) {
  if(err) {
    console.log(err.stack);
    return;
  }
  console.log("finished digging " + tree_base.name);
}

gathering.GetBlock = function() {

};

gathering.Find = function (item_id) {
  if (item_id === null) return;
  console.log("Search for id: "+ item_id);

  bot.findBlock({
            point: bot.entity.position,
            matching: item_id, // 17 oak wood
            maxDistance: 64,
            count: 1,},
  function(err, blockPoints) {
    console.log("Findblock callback ran");
    if (err) {
        console.err(err);
        console.log("I couldn't find any " + item_id);
        return;
    }

    if (blockPoints.length) {
        var foundBlock = blockPoints[0];
        if(foundBlock.material === "wood") {
          gathering.GetWood(foundBlock);
        }
    } else {
        console.log("I couldn't find any " + item_id);
    }
  });
};

module.exports = gathering;

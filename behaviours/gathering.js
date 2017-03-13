/*
this module will contain some techniques for gathering certain special materials
  - Collecting wood
  - Collecting seeds

*/

var mineflayer = require('mineflayer');
var behaviour = require('./behaviour.js');
var vec3 = require('vec3');

// make it a subclass of behaviour
gathering = new behaviour();

// private variables
let max_search_distance = 30;
let current_target;

// the wood blocks of the tree being broken down
gathering.wood_blocks = new Array();
// list of items to collect, each item consists of an [{id,amount}]
gathering.item_que = new Array();

// when digging complete
function onDiggingCompleted(err) {
  if(err) {
    console.log(err.stack);
    return;
  }
  console.log("finished digging " + tree_base.name);
  // run the set return function
  gathering.return_function();
}

// when the bot picks up an item, talk about it
bot.on("playerCollect",function (collector, collected) {
  if (collector == bot.entity) {
    console.log("The bot picked up an item, it was: ");
    console.log(collected);
    // check if item was in the item que,
  }
});

function PickupMovementCallback(stopreason) {
  console.log("stopreason was: " + stopreason);
  if (stopreason === "arrived") {
      console.log("Bot finished moving to resource, starting to to dig it.");
      gathering.PickupNearby();
  }
}

function DiggingMovementCallback(stopreason) {
  console.log("stopreason was: " + stopreason);
  if (stopreason === "arrived") {
      console.log("Bot finished moving to resource, starting to to dig it.");
      bot.dig(current_target, onDiggingCompleted);
  }
}

gathering.PickupNearby = function () {
  bot.moveToTarget(current_target,PickupMovementCallback);
};

/* trees may be surrounded by leaves only one block above dirt, these need to be cleared
 before tree punching can commence */
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

// used to break down a specific block
gathering.MoveAndBreak = function(target) {
  current_target = target;
  bot.moveToTarget(current_target,DiggingMovementCallback);
};

gathering.ScanTree = function(target_wood) {
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

  gathering.MoveAndBreak(tree_base);
};

// this method decides what block of the tree to break next
gathering.WorkOnTree = function () {

};



// goes over each block of tree and removes anything that is no longer wood
gathering.UpdateTree = function () {
  console.log("UpdateTree Ran");
  console.log(" Length BEFORE: "+gathering.wood_blocks.length);
  // iterate in reverse so we can remove members
  for (let i = gathering.wood_blocks.length - 1; i>=0; --i) {
    let block = bot.blockAt(gathering.wood_blocks[i].position);
    // if its not wood anymore
    if (block.material !== "wood") {
      // then remove it
      gathering.wood_blocks.splice(i,1);
      console.log("  A non-wood block was found and removed");
    }
  }
    console.log(" Length AFTER: "+gathering.wood_blocks.length);
};

gathering.GetWood = function (target_wood) {
  // see if there is still a tree in progress
  gathering.UpdateTree();

  if (gathering.wood_blocks.length > 0) {
    // if there is, keep working at it
    console.log("Found tree in progress, continuing...");
    gathering.WorkOnTree();
  } else {
    // otherwise scan the tree and add to wood_blocks
    gathering.ScanTree(target_wood);
  }
};

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

gathering.Update = function() {
  // if item que empty, don't bother
  if (gathering.item_que.length < 1) return;

  gathering.Find(gathering.item_que[0].id);
};

gathering.AddQue = function (item_id,item_amount) {
  // the default amount when not specified is one
  if (item_amount === undefined) {
      item_amount = 1;
  }

  // check to see if item is already in the list
  for (let item of gathering.item_que) {
    // if it is add the newly requested amount to the existing number
    if (item.id === item_id) {
      item.amount += item_amount;
      return;
    }
  }
  // if not found add it to the que
  gathering.item_que.push({id:item_id, amount:item_amount});
  gathering.return_function();
};


module.exports = gathering;

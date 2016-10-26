/*
this module will contain some techniques for gathering certain special materials
  - Collecting wood
  - Collecting seeds

*/

var mineflayer = require('mineflayer');

function gathering () {

}

let max_search_distance = 30;


/* trees may be surrounded by leaves only one block above dirt, these need to be cleared
 before mining can commence */
gathering.ClearLeaves = function () {

}

gathering.GetWood = function(target_wood) {
  console.log("Found wood");
  let coords_tree_starts;
  let coords_tree_ends;


  // find how deep the tree goes
  let pos_to_test = target_wood.position.plus(mineflayer.vec3(0, -1, 0));
  let is_block_below = true;
  while (is_block_below) {
    pos_to_test = pos_to_test.position.plus(mineflayer.vec3(0, -1, 0));
    let block_below = bot.blockAt(pos_to_test);
    if (block_below !== null && block_below.material === 'wood') {
      console.log("Found wood block below target");
      is_block_below = true;
    } else {
      is_block_below = false;
    }
  }
  // find out how high the tree goes
  pos_to_test = target_wood.position.plus(mineflayer.vec3(0, -1, 0));
  let is_block_above = true;
  while (is_block_above) {
    pos_to_test = pos_to_test.position.plus(mineflayer.vec3(0, 1, 0));
    let block_above = bot.blockAt(pos_to_test);
    if (block_above !== null && block_above.material === 'wood') {
      console.log("Found wood block above target");
      is_block_above = true;
    } else {
      is_block_above = false;
    }
  }
  // the part of the tree that we can reach will be surrouned by air blocks
};

gathering.GetBlock = function() {

}

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

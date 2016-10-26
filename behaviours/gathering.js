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
  // see if block below is also wood

  let block_below = bot.blockAt(target_wood.position.plus(mineflayer.vec3(0, -1, 0)));
  if (block_below !== null && block_below.material === 'wood') {
    console.log("Found wood block below target");
  }
};

gathering.GetBlock = function() {

}

gathering.Find = function (item_id) {
//  if (block_name === null) return;
  console.log("Search for id: "+ item_id);
  /*let search_matches = Object.keys(bot.blocks).map(function (id) {
    return bot.blocks[id];
  }).filter(function (e) {
    return e.name === block_name && bot.entity.position.distanceTo(e.position) < max_search_distance;
  });*/

bot.findBlock({
            point: bot.entity.position,
            matching: item_id, // 17 oak wood
            maxDistance: 256,
            count: 1,
        }, function(err, blockPoints) {
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
        }
    );


  /*let closest_target = bot.findClosestTarget(search_matches);
  // run block specific gather methods
  switch(true) {
    case 'wood' === block_name:
      gathering.GetWood(number,closest_target);
      break;
  }*/

};

module.exports = gathering;

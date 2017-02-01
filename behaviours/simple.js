// these are simmple commands that interface with the bot api directly
var attention = require('./attention.js');
var mineflayer = require('mineflayer');
var vec3 = require('vec3');

function simple () {

}

// public variables
simple.following = false;
simple.following_last_distance = 0;

bot.on('entityGone', function onGone(entity) {
    if (entity.username !== bot.owner) return;

    simple.following = false;
});


simple.UpdateFollow = function () {
  if (simple.following === true) {
    let owner_entity = bot.getOwnerEntity();
    if (owner_entity !== null) {
      attention.moveToTarget(owner_entity);
      bot.lookAt(owner_entity.position.plus(vec3(0, 1.62, 0)), true);
      let distance = Math.round( bot.entity.position.distanceTo(owner_entity.position) );
      if (distance != simple.following_last_distance) { // don't talk about current distance if it hasn't changed
        bot.smartChat(distance+" blocks from owner");
        simple.following_last_distance = distance;
      }
      timeoutId = setTimeout(simple.UpdateFollow, 2000); // this keeps it following
    } else {
      bot.smartChat("Unable to follow, could not find owner, stopping");
      simple.following = false;
    }
  }
};

simple.Follow = function () {
  if (simple.following === true) {
    simple.following = false;
    bot.smartChat("stopped following");
  } else {
    simple.following = true;
    bot.smartChat("started following");
  }
  simple.UpdateFollow();
};

simple.ShowHealth = function() {
  bot.smartChat("Health: "+bot.health);
  bot.smartChat("Hunger: "+bot.food);
};

simple.ListInventory = function () {
  let items = bot.inventory.items();
  console.log("/* Inventory contents:");

  for (let item of items) {
    console.log( ' name: '+ item.name + ' type(id): '+ item.type + ' amount: ' + item.count);
  }
  console.log("*/ \n");
};

// drop entire inventory contents
simple.DropAll = function () {

};

module.exports = simple;

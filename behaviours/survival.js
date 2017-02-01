/*
this module will contain a minimal set of behaviours
that will protect the bot from dying every few minutes
  - Running away from danger.
  - Making holes for hiding.
  - Attacking enemies when they get too close
    - Some special behaviour for skeletons?
    - Need to be able to determine line of sight
    - Dodging patterns?

*/

var mineflayer = require('mineflayer');
var vec3 = require('vec3');
var attention = require('./attention.js');
var behaviour = require('./behaviour.js');

let dirt_like = [
  3, // dirt
  12, // sand
  13 // gravel
];




// make it a subclass of behaviour
survival = new behaviour();

/*
Priority levels and meanings:
 1 - Only constant dangers (food levels)
 2 - Just took damage but environment safe
 3 - Entered dark cave
 4 - Night time
*/

survival.danger_enemies = [];

function DiggingStopped(error) {
  bot.smartChat("Digging interupted: "+error);
}

/*bot.on('entityGone', function onGone(entity) {
    if (currently_attacking_id == null) return;
    if (entity != currently_attacking_id) return;

    currently_attacking_id = null;
    survival.SearchEnemies();
});*/

survival.UpdateDangerLevel = function () {

};

survival.IsNight = function() {
  if (bot.time.day > 12000) {
    return true;
  } else {
    return false;
  }
};

// equip the best weapon in inventory to fight with
survival.PickBestWeapon = function () {

};

survival.AttackTarget = function (target) {
  if (target !== null) {
    bot.lookAt(target.position.plus(vec3(0, 1.62 + 0.5, 0)), true); // look where we are swinging
    //attention.moveToTarget(enemy); // move towards the enemy before attacking
    bot.attack(target);
  }
};

survival.RunAttackTarget = function (target) {
  if (target !== null) {
    attention.moveToTarget(target); // move towards the enemy before attacking
    bot.lookAt(target.position.plus(vec3(0, 1.62 + 0.5, 0)), true); // look where we are swinging
    bot.attack(target);
  }
};

// this when given a list of enemys, will choose the best one to focus on.
// currently just attacks the closest
survival.ChooseTarget = function (targets) {
  //console.log("Targets ("+targets.length+"):");
  //console.log(targets);
  let closest_target = bot.findClosestTarget(targets);
  //console.log("Chosen target");
  //console.log(closest_target);
  // check to see if this behaviour is allowed to perform movement
  if (!attention.movement_reserved) {
    if (closest_target.name === 'Skeleton' || closest_target.name === 'Witch' ) {
      survival.RunAttackTarget(closest_target);
    } else {
      survival.AttackTarget(closest_target);
    }
  }
};

survival.CheckDanger = function() {
  if( survival.IsNight()) {
      //survival.setPriorityIfGreater(3);
  }
};

survival.DigHole = function() {
  // find something dirt like
  let dirt_location = bot.findBlock({
    point: bot.entity.position,
    matching: 3, // dirt
    maxDistance: 5
  });

  console.log(dirt_location);

  if (dirt_location !== null) {
    attention.moveToTarget(dirt_location);
  }

};

survival.Update = function () {
  survival.CheckDanger();
  if (survival.danger_enemies && survival.danger_enemies.length > 0) {
    //console.log("Enemies listed, finding target");
    survival.ChooseTarget(survival.danger_enemies);
  } else {
    //console.log("No targets");
  }
};

module.exports = survival;

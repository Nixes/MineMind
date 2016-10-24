/*
this module will contain a minimal set of behaviours
that will protect the bot from dying every few minutes
  - Running away from danger.
  - Making holes for hiding.
  - Attacking enemies when they get too close
    - Some special behaviour for skeletons?
    - Need to be able to determine line of sight

*/

var mineflayer = require('mineflayer');

let dirt_like = [
  3, // dirt
  12, // sand
  13 // gravel
];


let distance_close = 15; // the range at which awareness of enemies should improve
let distance_danger = 5; // the range at which the bot should attack mobs


function survival() {

}

survival.danger_level = 0;
/*
levels and meaning:
 1 - Just took damage but environment safe
 2 - Entered dark cave
 3 - Night time

*/

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

}

survival.IsNight = function() {
  if (bot.time.day > 12000) {
    return true;
  } else {
    return false;
  }
};

// equip the best weapon in inventory to fight with
survival.PickBestWeapon = function () {

}

survival.AttackTarget = function (target) {
  if (target !== null) {
    bot.lookAt(target.position.plus(mineflayer.vec3(0, 1.62 + 0.5, 0)), true); // look where we are swinging
    //bot.moveToTarget(enemy); // move towards the enemy before attacking
    bot.attack(target);
  }
}

survival.RunAttackTarget = function (target) {
  if (target !== null) {
    bot.moveToTarget(target); // move towards the enemy before attacking
    bot.lookAt(target.position.plus(mineflayer.vec3(0, 1.62 + 0.5, 0)), true); // look where we are swinging
    bot.attack(target);
  }
}

// this when given a list of enemys, will choose the best one to focus on.
// currently just attacks the closest
survival.ChooseTarget = function (targets) {
  console.log("Targets ("+targets.length+"):");
  console.log(targets);
  let closest_target = bot.findClosestTarget(targets)
  console.log("Chosen target");
  console.log(closest_target);
  if (closest_target.name === 'Skeleton' || closest_target.name === 'Witch' ) {
    survival.RunAttackTarget(closest_target);
  } else {
    survival.AttackTarget(closest_target);
  }
}

survival.SearchEnemies = function () {
  console.log("Searching for enemies")
  let close_enemies = Object.keys(bot.entities).map(function (id) {
    return bot.entities[id];
  }).filter(function (e) {
    return e.kind === 'Hostile mobs' && bot.entity.position.distanceTo(e.position) < distance_close;
  });

  let danger_enemies = close_enemies.filter(function (e) {
      // add to danger list if normal mob and very close or close and skeleton
      return bot.entity.position.distanceTo(e.position) < distance_danger || e.name === 'Skeleton' || e.name === 'Witch';
  });

  console.log('  found ' + close_enemies.length + ' close enemies');
  console.log('  found ' + danger_enemies.length + ' dangerously close enemies');
  //bot.smartChat(close_enemies_ids.join(', '));
  //console.log(close_enemies);
    if (danger_enemies.length > 0) {
      console.log("Dangerously close enemies found, attacking.");
      survival.ChooseTarget(danger_enemies);
    }
    if (close_enemies.length > 0) {
      // if close enemies found then keep searching
      setTimeout(survival.CheckDanger, 300);
    } else {
      setTimeout(survival.CheckDanger, 5000); // search again in 5 seconds
    }
};

survival.CheckDanger = function() {
  if( survival.IsNight() && survival.danger_level < 3 ) {
      survival.danger_level = 3;
  }
  survival.SearchEnemies();
}

survival.DigHole = function() {
  // find something dirt like
  let dirt_location = bot.findBlock({
    point: bot.entity.position,
    matching: 3, // dirt
    maxDistance: 5
  });

  console.log(dirt_location);

  if (dirt_location !== null) {
    bot.moveToTarget(dirt_location);

  }

};

module.exports = survival;

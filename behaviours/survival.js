/*
this module will contain a minimal set of behaviours
that will protect the bot from dying every few minutes
  - Running away from danger.
  - Not touching physics objects (water/lava) where avoidable
  - Making holes for hiding.

*/

let dirt_like = [
  3, // dirt
  12, // sand
  13 // gravel
];


let distance_close = 15; // these are enemies which can be navigated around
let distance_danger = 5; // the range at which the bot should attack mobs

let currently_attacking_id; // contains the id of the entity that is being attacked, null if not attacking

function survival() {

}

function DiggingStopped(error) {
  bot.smartChat("Digging interupted: "+error);
}

bot.on('entityGone', function onGone(entity) {
    if (currently_attacking_id == null) return;
    if (entity != currently_attacking_id) return;

    currently_attacking_id = null;
    survival.SearchEnemies();
});

survival.IsNight = function() {
  if (bot.time.day > 12000) {
    return true;
  } else {
    return false;
  }
};

// attacks the enemy specified by currently_attacking_id
survival.AttackTarget = function (target) {

  if (target !== null) bot.attack(target);
    //bot.moveToTarget(enemy); // move towards the enemy before attacking
}

// this when given a list of enemys, will choose the best one to focus on.
// currently just attacks the closest
survival.ChooseTarget = function (targets) {
  let closest_target;
  let shortest_distance;
  for(target of targets) {
    let distance = bot.entity.position.distanceTo(target.position);
    if (distance < shortest_distance) {
      shortest_distance = distance;
      closest_target = target;
    }
  }
  console.log("Chosen target");
  console.log(closest_target);
  survival.AttackTarget(closest_target);
}

survival.SearchEnemies = function () {
  console.log("Searching for enemies")
  let close_enemies = Object.keys(bot.entities).map(function (id) {
    return bot.entities[id];
  }).filter(function (e) {
    return e.type === 'mob' && bot.entity.position.distanceTo(e.position) < distance_close;
  });

  let danger_enemies = close_enemies.filter(function (e) {
      return bot.entity.position.distanceTo(e.position) < distance_danger;
  });

  console.log('  found ' + close_enemies.length + ' close enemies');
  console.log('  found ' + danger_enemies.length + ' dangerously close enemies');
  //bot.smartChat(close_enemies_ids.join(', '));
  //console.log(close_enemies);
    if (danger_enemies.length > 0) {
      bot.smartChat("Dangerously close enemies found, attacking.");
      survival.ChooseTarget(danger_enemies);
    }
    if (close_enemies.length > 0) {
      // if close enemies found then keep searching
      setTimeout(survival.SearchEnemies, 500); // search again in half a second
    } else {
      setTimeout(survival.SearchEnemies, 5000); // search again in 5 seconds
    }
};

survival.CheckDanger = function() {
  if( survival.IsNight() ) {
    survival.SeachEnemies();
  }
}

survival.DigHole = function() {
  // find something dirt like
  let dirt_location = bot.findBlock({
    point: bot.entity.position,
    matching: 3,
    maxDistance: 5
  });

  console.log(dirt_location);

  if (dirt_location !== null) {
    bot.moveToTarget(dirt_location);

  }

};

module.exports = survival;

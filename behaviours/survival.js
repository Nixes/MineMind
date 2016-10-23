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


let distance_close = 10; // these are enemies which can be navigated around
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
survival.AttackEnemy = function (enemy) {
    bot.moveToTarget(enemy); // move towards the enemy before attacking
    bot.attack(enemy);
}

// this when given a list of enemys, will choose the best one to focus on.
survival.ChooseTarget = function (enemies) {
  for(enemy of enemies) {
  }
}

survival.SearchEnemies = function () {
  let close_enemies = Object.keys(bot.entities).map(function (id) {
    return bot.entities[id];
  }).filter(function (e) {
    return e.type === 'mob' && bot.entity.position.distanceTo(e.position) < distance_close;
  });

  let danger_enemies = close_enemies.filter(function (e) {
      return bot.entity.position.distanceTo(e.position) < distance_danger;
  });

  bot.smartChat('found ' + close_enemies.length + ' close enemies');
  bot.smartChat('found ' + danger_enemies.length + ' dangerously close enemies');
  //bot.smartChat(close_enemies_ids.join(', '));
  console.log(close_enemies);
    if (danger_enemies.length > 0) {
      bot.smartChat("Dangerously close enemies found, attacking.");
      survival.ChooseTarget(danger_enemies);
    }
};

survival.CheckDanger = function() {
  if( survival.IsNight() ) {
    survival.SeachEnemies();
  }
}

survival.DigHole = function() {
  // find something dirt like
  let dirt_location = bot.findBlock(
    {
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

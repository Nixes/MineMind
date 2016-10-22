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


let distance_close = 10;
let distance_attack = 5; // the range at which the bot should attack mobs



function survival() {

}

function DiggingStopped(error) {
  bot.smartChat("Digging interupted: "+error);
}

survival.IsNight = function() {
  if (bot.time.day > 12000) {
    return true;
  } else {
    return false;
  }
};

survival.SearchEnemies = function () {
  let distance = 10;

  let close_enemies = Object.keys(bot.entities).map(function (id) {
    return bot.entities[id];
  }).filter(function (e) {

    return e.type === 'mob' && bot.entity.position.distanceTo(e.position) < distance;
  });

  bot.smartChat('found ' + close_enemies.length + ' enemies');
  //bot.smartChat(close_enemies_ids.join(', '));
  console.log(close_enemies);
};

survival.CheckDanger = function() {
  if( survival.IsNight() ) {
    survival.SeachEnemies();
  }
}

survival.ShowHealth = function() {
  bot.smartChat("Health: "+bot.health);
  bot.smartChat("Hunger: "+bot.food);
};



survival.DigHole = function() {
  // find something dirt like
  let dirt_location = bot.findBlock(
    {
    point: bot.entity.position,
    matching: 3,
    minDistance: 2,
    maxDistance: 10
  });

  console.log(dirt_location);

  if (dirt_location !== null) {
    bot.dig(dirt_location, DiggingStopped );
  }

};

module.exports = survival;

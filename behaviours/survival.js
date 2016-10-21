/*
this module will contain a minimal set of behaviours
that will protect the bot from dying every few minutes
  - Running away from danger.
  - Not touching physics objects (water/lava) where avoidable
  - Making holes for hiding.

*/

function survival() {

}

survival.ShowHealth= function() {
  bot.smartChat("Health: "+bot.health);
  bot.smartChat("Hunger: "+bot.food);
};

survival.BuildHole = function() {

};

module.exports = survival;

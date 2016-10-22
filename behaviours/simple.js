// these are simmple commands that interface with the bot api directly

function simple () {

}

simple.following = false;

simple.following_last_distance = 0;

simple.UpdateFollow = function () {
  if (simple.following === true) {
    let owner_entity = bot.getOwnerEntity();
    bot.moveToTarget(owner_entity);
    let distance = Math.round( bot.entity.position.distanceTo(owner_entity.position) );
    if (distance != simple.following_last_distance) { // don't talk about current distance if it hasn't changed
      bot.smartChat(distance+" blocks from owner");
      simple.following_last_distance = distance;
    }
    timeoutId = setTimeout(simple.UpdateFollow, 2000); // this keeps it following
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

// drop entire inventory contents
simple.DropAll = function () {

}

module.exports = simple;

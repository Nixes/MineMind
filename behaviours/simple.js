// these are simmple commands that interface with the bot api directly

function simple () {

}

simple.following = false;

simple.UpdateFollow = function () {
  if (simple.following === true) {
    bot.moveToTarget(bot.getOwnerEntity());
    timeoutId = setTimeout(simple.UpdateFollow, 2 * 1000); // this keeps it following
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

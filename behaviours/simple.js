// these are simmple commands that basicly interface with the bot api directly

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
  simple.following = !simple.following;
  simple.UpdateFollow();
}

module.exports = simple;

function behaviour () {}
  // public variables, these should be moved into the constructor
  behaviour.name;
  behaviour.module;
  behaviour.priority;

behaviour.disable = function () {
    this.attention = 0;
};
behaviour.increase = function() {
    this.attention++;
};
behaviour.decrease = function() {
    this.attention--;
};

module.exports = behaviour;

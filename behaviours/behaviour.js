function behaviour () {
}
// public variables, these should be moved into the constructor
behaviour.priority;
behaviour.return_function;

behaviour.setReturnFunction = function (return_function) {
  this.return_function = return_function;
};

behaviour.setPriority = function (priority) {
  this.priority = priority;
};

behaviour.disable = function () {
  this.priority = 0;
};
behaviour.increase = function() {
  this.priority++;
};
behaviour.decrease = function() {
  this.priority--;
};

module.exports = behaviour;

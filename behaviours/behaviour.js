function behaviour () {
}

// NOTE: All Behaviours must supply their own Update() method and must return to return_function() when they are finished

// public variables, these should be moved into the constructor
behaviour.priority = 1;
behaviour.return_function;

behaviour.setReturnFunction = function (return_function) {
  this.return_function = return_function;
};

behaviour.setPriority = function (priority) {
  if (priority > 0) {
    this.priority = priority;
  } else {
    console.log("Something tried to set priority to a negative number");
  }
};
behaviour.setPriorityIfGreater = function (priority) {
  if (priority > this.priority) {
    this.priority = priority;
  } else {
    console.log("Priority was lesser ignoring");
  }
};

behaviour.disable = function () {
  this.priority = 0;
};
behaviour.increase = function() {
  this.priority++;
};
behaviour.decrease = function() {
  // a priority should never be a negative number
  if (this.priority !== 0) {
    this.priority--;
  }
};

module.exports = behaviour;

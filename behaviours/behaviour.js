function behaviour () {
  // public variables
  this.priority = 1;
  this.enabled = false;
  this.return_function = null;
  this.last_run = null; // Date
}

// NOTE: All Behaviours must supply their own Update() method and must return to return_function() when they are finished

behaviour.prototype.setReturnFunction = function (return_function) {
  this.return_function = return_function;
};

behaviour.prototype.setPriority = function (priority) {
  if (priority > 0) {
    this.priority = priority;
  } else {
    console.log("Something tried to set priority to a negative number");
  }
};
behaviour.prototype.setPriorityIfGreater = function (priority) {
  if (priority > this.priority) {
    this.priority = priority;
  } else {
    console.log("Priority was lesser ignoring");
  }
};

behaviour.prototype.disable = function () {
  this.priority = 0;
};
behaviour.prototype.increase = function() {
  this.priority++;
};
behaviour.prototype.decrease = function() {
  // a priority should never be a negative number
  if (this.priority !== 0) {
    this.priority--;
  }
};

module.exports = behaviour;

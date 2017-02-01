/*
Bot attention system ideas:
    - A command with a ! at the end wipes the command que and replaces with said command
    - The command que will contain a list of actions that have been requested FIFO
    - How should actions be referenced? Callbacks?


*/


function attention () {
  console.log("Attention initialised");
}

/*
  priority 0 is disabled
  priority 1 is most important
  priority >1 is less important
*/

// this contains a list of module names and its intrinsic importance, higher in the list is more important
// this is used for conflict resolution when two submodules have same internal priorities
attention.conflict_priorities = [
  "survival",
  "crafting",
  "gathering",
  "mining"
];

attention.behaviours = [];

// this disables the automatic attention process
attention.command_mode = false;

// only one function can be allowed to perform movements at a time.
attention.movement_reserved = false;

attention.moveToTarget = function (targetEntity,callback) {
    if (targetEntity === null) return;

    var path = bot.navigate.findPathSync(targetEntity.position, {
        timeout: 1000,
        endRadius: 2,
    });
    if (callback === undefined) {
        callback = function() { // provide a defualt callback
            if (targetEntity !== null) {
                console.log("Finished moving");
            }
            // remove reservation
            attention.movement_reserved = false;
        };
    }
    attention.movement_reserved = true;
    bot.navigate.walk(path.path, callback);
    if (path.status !== 'success') {
      console.log("Pathing failed because: "+ path.status);
    }
};

attention.AddBehaviour = function (name,behaviour) {
  console.log("Adding behaviour "+ name + " to attention.");
  behaviour.return_function = attention.Return;
  attention.behaviours.push( {name,behaviour} );
};

// this decides what module should recieve an update next
attention.Update = function () {
  let highest_priority_value = 0;
  let highest_priority_task;
  console.log("Behaviours: ");
  console.log(attention.behaviours);

  // find the task with the highest priority
  for (let behaviour of attention.behaviours) {
    if (behaviour.priority > highest_priority_value) {
      highest_priority_value = behaviour.priority;
      highest_priority_task = behaviour;
    }
  }
  console.log("Highest priority task was: ");
  console.log(highest_priority_task);
  // run the task
  highest_priority_task.behaviour.Update();
};

// this is called externally by all modules that interact with this system, when they finish their current task
attention.Return = function (calling_module_name) {
  // reset internal timmer
  attention.Update();
};


module.exports = attention;

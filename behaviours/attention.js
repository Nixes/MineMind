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

attention.submodules = [];

// this disables the automatic attention process
attention.command_mode = false;


attention.AddModule = function (module) {
  attention.submodules.push( new attention_submodule(name,module,starting_attention) );
};

// this decides what module should recieve an update next
attention.Update = function () {
  for (let module of submodules) {
    module.priority
  }
};

// this is called externally by all modules that interact with this system, when they finish their current task
attention.Return = function (calling_module_name) {
  // reset internal timmer
  attention.Update();
};

/*
Bot attention system ideas:
    - A command with a ! at the end wipes the command que and replaces with said command
    - The command que will contain a list of actions that have been requested FIFO
    - How should actions be referenced? Callbacks?


*/

class attention_submodule {
  constructor(name,module_ref,attention) {
    this.name = name;
    this.module = module_ref;
    this.attention = attention;
  }
  disable() {
    this.attention = 0;
  }
  increase() {

  }
  decrease() {

  }
}

function attention () {

}

/*
  attention 0 is disabled
  attention 1 is most important
  attention >1 is less important
*/

attention.submodules = {
  survival:{module:survival,attention:0},
  gathering:{module:gathering,attention:0},
  mining:{module:mining,attention:0},
};


attention.AddModule = function (name,module,starting_attention) {
  attention.submodules.push( new attention_submodule(name,module,starting_attention) );
};

// this decides what module should recieve an update next
attention.Update = function () {
};

// this is called externally by all modules that interact with this system, when they finish their current task
attention.Return = function (calling_module_name) {
  // reset internal timmer
  attention.Update();
};

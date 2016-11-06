/*
Bot attention system ideas:
    - A command with a ! at the end wipes the command que and replaces with said command
    - The command que will contain a list of actions that have been requested FIFO
    - How should actions be referenced? Callbacks?


*/

function attention () {

}

/*
  survival,
  gathering,
  crafting
*/
attention.goals = [];

attention.Push = function () {};

attention.Pop = function () {};

attention.MoveToTop = function () {

};

// this decides what module should recieve an update next
attention.Update = function () {

};

// this is called externally by all modules that interact with this system, when they finish their current task
attention.Return = function () {

};

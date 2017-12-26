var behaviour = require('./behaviour.js');

const Recipe = require('prismarine-recipe')('1.12').Recipe

const crafting_table = 58;

crafting = new behaviour(); // crafting is a behaviour subclass

// list of items to collect, each item consists of an [{id,amount}]
crafting.item_que = new Array();

// private methods
/**
 * FindQueIndex - description
 *
 * @param  {int} item_id description
 * @return {int}       index of item in que
 */
function FindQueIndex(item_id) {
  for (let i=0; i < crafting.item_que.length;i++) {
    if (crafting.item_que[i].id === item_id) {
      return i;
    }
  }
  return null;
}


/**
 * FindQue - description
 *
 * @param  {int} item_id description
 * @return {array}         actual que item
 */
function FindQue(item_id) {
  let index = FindQueIndex(item_id);
  if (index === null) return null;

  return crafting.item_amount[index];
}

/**
 * AddQue - description
 *
 * @param  {int} item_id     description
 * @param  {int} item_amount description
 * @return {type}             description
 */
crafting.AddQue = function (item_id,item_amount) {
  // the default amount when not specified is one
  if (item_amount === undefined) {
      item_amount = 1;
  }

  // check to see if item is already in the list
  let match = FindQue(item_id);
  if (match !== null) {
    item.amount += item_amount;
  }

  // if not found add it to the que
  crafting.item_que.push({id:item_id, amount:item_amount});
  crafting.return_function();
};

/**
 * AddQue - description
 *
 * @param  {int} item_id     description
 * @param  {int} item_amount description
 * @return {type}             description
 */
crafting.DecrementQue = function (item_id,item_amount) {
  // the default amount when not specified is one
  if (item_amount === undefined) {
      item_amount = 1;
  }

  // check to see if item is already in the list
  let match = FindQue(item_id);
  if (match !== null) {
    item.amount -= item_amount;
  }

  if (item.amount === 0) {
    let index = FindQueIndex(item_id);
    crafting.item_que.splice(index,1);
  }
};


/**
 * HaveCraftingTable - returns if we have a crafting table or not
 *
 * @return {bool}  description
 */
crafting.HaveCraftingTable = function () {
  for(let slot of bot.inventory.slots) {
    if (slot !== null && slot.type === crafting_table) {
      return true;
    }
  }
  return false;
}

/**
 * CraftItem - description
 *
 * @param  {item} item  description
 * @param  {bool} force description
 */
crafting.CraftItem = function (item,force) {

    bot.smartChat('crafting: '+item);
    console.log(item);
    const recipe = Recipe.find(item)[0];
    console.log('Recipe: ');
    console.log(recipe);

    // if it requires a crafting table then make sure we have one of those first
    if (recipe.requiresTable === true && crafting.HaveCraftingTable() === false) {
      console.log("Recipe requires crafting table, but we don't have one. Building that first.");
      crafting.CraftItem(crafting_table);
    }
    crafting.AddQue(1,item);
}


/**
 * TryCrafting - description
 *
 * @param  {array} item description
 * @return {null}      description
 */
crafting.TryCrafting = function(item) {
  let recipe = bot.recipesFor(item.id);
  // if recipe exists, and there are no more components required, other than this item itself
  if (recipe !== null && recipe.delta !== [] && recipe.delta[0].id === item.id) {
    // attempt to craft the item
    // if successful, remove from que
    bot.craft(recipe, item.amount, craftingTable, function() {
      // remove from que after successful crafting
      crafting.DecrementQue(recipe.id,item.amount);
    });
  }
}

crafting.Update = function() {
  console.log("Crafting update ran");
  // if item que empty, don't bother
  if (crafting.item_que.length < 1) return;

  crafting.TryCrafting(crafting.item_que[0]);
};


module.exports = crafting;

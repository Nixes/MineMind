/*
Bot attention system ideas:
    - A command with a ! at the end wipes the command que and replaces with said command
    - The command que will contain a list of actions that have been requested FIFO
    - How should actions be referenced? Callbacks?


*/
var vec3 = require('vec3');

// hardcoded values for danger radius
let distance_close = 16; // the range at which awareness of enemies should improve
let distance_danger = 6; // the range at which the bot should attack mobs


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
        if (attention.movement_reserved) { return;}
        callback = function() { // provide a defualt callback
            if (targetEntity !== null) {
                console.log("Finished moving");
            }
            // remove reservation
            attention.movement_reserved = false;
        };
    }
    if (attention.movement_reserved) { callback();}
    attention.movement_reserved = true;
    var tmp_callback = function () {
      attention.movement_reserved = false;
      callback();
    };
    bot.navigate.walk(path.path, tmp_callback);
    if (path.status !== 'success') {
      console.log("Pathing failed because: "+ path.status);
    }
};

function RemoveEntity(changed_entity, list_entities) {
  for(let i=0;i < list_entities.length; i++) {
    if (list_entities[i].id === changed_entity.id) {
      list_entities.splice(i, 1); // remove 1 element from position i
      return; // success so return early
    }
  }
}

function AddOrUpdateEntity(changed_entity, list_entities) {
  // if no list then just add it
  if (!list_entities) list_entities.push(changed_entity);

  for (var i = 0; i < list_entities.length; i++) {
    if (list_entities[i].id === changed_entity.id) {
      list_entities[i] = changed_entity;
      return; // success so return early
    }
  }
  // if not found by this point just add it
  list_entities.push(changed_entity);
}

// this function check the updated entity to see if it is of interest to the bot
attention.CheckEntity = function (updated_entity) {
  console.time("check_entity");

  // check to see if the bot was close enough to be interesting
  if (bot.entity.position.distanceTo(updated_entity.position) < distance_close) {

    // check to see if it was hostile
    if (updated_entity.kind === 'Hostile mobs') {

      // then check to see if its going to be a threat
      if (bot.entity.position.distanceTo(updated_entity.position) < distance_danger || updated_entity.name === 'Skeleton' || updated_entity.name === 'Witch') {
        // search to see if it needs adding to dangerous targets
        AddOrUpdateEntity(updated_entity,attention.behaviours.survival.danger_enemies);
      }
    }

  } else {
    // make sure the list exists first
    if (attention.behaviours.survival.danger_enemies) {
      // search to see if it needs removal
      if (!(bot.entity.position.distanceTo(updated_entity.position) < distance_danger || updated_entity.name === 'Skeleton' || updated_entity.name === 'Witch') ) {
        // remove it from the list
        RemoveEntity(updated_entity,attention.behaviours.survival.danger_enemies)
      }
    }
  }
  console.timeEnd("check_entity");
};

// search for nearby entities, this runs on every update
attention.CheckEntities = function () {
  console.time("entities_search");

  let entity_update_interval = 800;

  let close_entities = Object.keys(bot.entities).map(function (id) {
    return bot.entities[id];
  }).filter(function (e) {
    return bot.entity.position.distanceTo(e.position) < distance_close;
  });
  if (close_entities.length > 0) {entity_update_interval = 500;}

  //console.log("Searching for enemies");
  let close_enemies = close_entities.filter(function (e) {
    return e.kind === 'Hostile mobs';
  });

  //console.log('  found ' + close_enemies.length + ' close enemies');
  if (close_enemies.length > 0) {entity_update_interval = 200;}

  let danger_enemies = close_enemies.filter(function (e) {
      // add to danger list if normal mob and very close or close and skeleton
      return bot.entity.position.distanceTo(e.position) < distance_danger || e.name === 'Skeleton' || e.name === 'Witch';
  });
  //console.log('  found ' + danger_enemies.length + ' dangerously close enemies');
  if (danger_enemies.length > 0) {entity_update_interval = 100;}

  // update the list of dangerous entities to allow the survival module to make a decision
  attention.behaviours.survival.danger_enemies = danger_enemies;
  //setTimeout(attention.CheckEntities, entity_update_interval);

  // make it so the bot always looks at the closest target
  {
    let closest_target = bot.findClosestTarget(close_entities);
    if (closest_target) {
      bot.lookAt(closest_target.position.plus(vec3(0, 1.62, 0)));
    }
  }

  console.timeEnd("entities_search");
};

attention.AddBehaviour = function (name,behaviour) {
  console.log("Adding behaviour "+ name + " to attention.");
  behaviour.return_function = attention.Return;
  behaviour.last_run = new Date();
  attention.behaviours[name] = behaviour;
};

// this decides what module should recieve an update next
attention.Update = function () {
  let highest_priority_value = 0;
  let highest_priority_task_name = "";
  //console.log("Behaviours: "); console.log(attention.behaviours);

  // find the task with the highest priority
  for (let behaviour in attention.behaviours) {
    if (attention.behaviours[behaviour].priority > highest_priority_value) {
      highest_priority_value = attention.behaviours[behaviour].priority;
      highest_priority_task_name = behaviour;
    }
  }
  //console.log("Highest priority task was: " + highest_priority_task_name + " with: " + highest_priority_value);

  // run the task
  attention.behaviours[highest_priority_task_name].Update();
  setTimeout(attention.Return, 50);
};

// this is called externally by all modules that interact with this system, when they finish their current task
attention.Return = function (calling_module_name) {
  // reset internal timer
  attention.Update();
};


module.exports = attention;

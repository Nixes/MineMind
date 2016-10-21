function trading() {

}

trading.showVillagers = function () {
  var villagers = Object.keys(bot.entities).map(function (id) {
    return bot.entities[id];
  }).filter(function (e) {
    return e.entityType === 120;
  });
  var closeVillagersId = villagers.filter(function (e) {
    return bot.entity.position.distanceTo(e.position) < 3;
  }).map(function (e) {
    return e.id;
  });
  bot.smartChat('found ' + villagers.length + ' villagers');
  bot.smartChat('villager(s) you can trade with: ' + closeVillagersId.join(', '));
};

trading.showInventory = function() {
  let items = bot.inventory.slots.filter(function(item) {
    return item;
  });
  bot.smartChat("items: "+items.length);
  if (items.length > 0) {
    console.log(items);

    items.forEach(function (item) {
      bot.smartChat(stringifyItem(item));
    });
  } else {
    bot.smartChat("inventory was empty")
  }
};

trading.showTrades = function(id) {
  var e = bot.entities[id];
  switch (true) {
    case !e:
    bot.smartChat('cant find entity with id ' + id);
    break;
    case e.entityType !== 120:
    bot.smartChat('entity is not a villager');
    break;
    case bot.entity.position.distanceTo(e.position) > 3:
    bot.smartChat('villager out of reach');
    break;
    default:
    var villager = bot.openVillager(e);
    villager.once('ready', function() {
      villager.close();
      stringifyTrades(villager.trades).forEach(function (trade , i) {
        bot.smartChat(i + 1 + ': ' + trade);
      });
    });
  }
};

trading.trade = function(id, index, count) {
  var e = bot.entities[id];
  switch (true) {
    case !e:
    bot.smartChat('cant find entity with id ' + id);
    break;
    case e.entityType !== 120:
    bot.smartChat('entity is not a villager');
    break;
    case bot.entity.position.distanceTo(e.position) > 3:
    bot.smartChat('villager out of reach');
    break;
    default:
    var villager = bot.openVillager(e);
    villager.once('ready', function() {
      var trade = villager.trades[index - 1];
      count = count || trade.maxTradeuses - trade.tooluses;
      switch (true) {
        case !trade:
        villager.close();
        bot.smartChat('trade not found');
        break;
        case trade.disabled:
        villager.close();
        bot.smartChat('trade is disabled');
        break;
        case trade.maxTradeuses - trade.tooluses < count:
        villager.close();
        bot.smartChat('cant trade that often');
        break;
        case !hasResources(villager.window, trade, count):
        villager.close();
        bot.smartChat('dont have the resources to do that trade');
        break;
        default:
        bot.smartChat('starting to trade');
        bot.trade(villager, index - 1, count, function(err) {
          villager.close();
          if (err) {
            bot.smartChat('an error acured while tyring to trade');
            console.log(err);
          } else {
            bot.smartChat('traded ' + count + ' times');
          }
        });
      }
    });
  }

  trading.hasResources = function(window, trade, count) {
    var first = enough(trade.firstInput, count);
    var second = !trade.hasSecondItem || enough(trade.secondaryInput, count);
    return first && second;

    function enough(item, count) {
      return window.count(item.type, item.metadata) >= item.count * count;
    }
  };
};

trading.stringifyTrades = function(trades) {
  return trades.map(function (trade) {
    var text = stringifyItem(trade.firstInput);
    if (trade.secondaryInput) text += ' & ' + stringifyItem(trade.secondaryInput);
    if (trade.disabled) text += ' x ';else text += ' » ';
    text += stringifyItem(trade.output);
    return '(' + trade.tooluses + '/' + trade.maxTradeuses + ') ' + text;
  });
};

function stringifyItem (item) {
  if (!item) return 'nothing';
  var text = item.count + ' ' + item.displayName;
  if (item.nbt && item.nbt.value) {
    var ench = item.nbt.value.ench;
    var StoredEnchantments = item.nbt.value.StoredEnchantments;
    var Potion = item.nbt.value.Potion;
    var display = item.nbt.value.display;

    if (Potion) text += ' of ' + (Potion.value.replace(/_/g, ' ').split(':')[1] || 'unknow type');
    if (display) text += ' named ' + display.value.Name.value;
    if (ench || StoredEnchantments) {
      text += ' enchanted with ' + (ench || StoredEnchantments).value.value.map(function (e) {
        var lvl = e.lvl.value;
        var id = e.id.value;
        return mcdata.enchantments[id].displayName + ' ' + lvl;
      }).join(' ');
    }
  }
  return text;
};

module.exports = trading;

Mostly abandoned, while javascript somehow has the best Minecraft bot API of all languages (Mineflayer FTW!), actually building anything large in it gets old fast, typescript would help, but mineflayer does not yet have typings. Also an event based interface like provided by Mineflayer just doesn't seem really suited to AI development.

# MineMind
a minecraft bot for fun

## Usage
```
-h, --host [host]', specifiy server ip, default: localhost
-p, --port [port]', specifiy server port, default: 25565
-o, --owner [name]', set bot owner
-u, --username [name]', set username for bot to login with, default: MineMindBot
-p, --password [password]', set password for bot to login with, optional with offline serve
```

General Todo List:
- [x] Attack Enemies when they get too close
- [ ] Strip mining functionality
- [ ] Robust stair building


# Modules

## Attention
Decides which of goals most needs attention (an update tick)

## Mining
Stores current mining operation state and manages mining operations.

## Survival
Mostly concerned with self preservation, attacks enemies that get too close, manages food consumption.

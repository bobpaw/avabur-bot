# avabur-bot
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fbobpaw%2Favabur-bot.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fbobpaw%2Favabur-bot?ref=badge_shield)[![Build Status](https://travis-ci.com/bobpaw/avabur-bot.svg?branch=master)]


Requires a mysql database setup with:
 - avabur.events (time (timestamp))
 - 'avabur-bot'@'localhost' with permissions insert, select on avabur.events

Requires a secrets file like this:

```JavaScript
exports.bot_token = "bot_token_from_discord";
exports.sql_pass = "password for mysql user 'avabur-bot'@'localhost'";
```

Gathers event data if you have a [Notifications of Avabur](https://github.com/davidmcclelland/notifications-of-avabur) webhookup only. This means `!luck` is also invalid without it.

# Commands
 * `!ping` Replies pong
 * `!luck` Replies with the current event luck (time since last event)/(average time between events)
 * `!market` Replies with market values for space-separated currencies (see [the code](https://github.com/bobpaw/avabur-bot/blob/experimental/server.js#L99-L141) for acceptable arguments).
 * `!source` Replies with a link to this repository
 * `!math`, `!calc`, `!calculate` Calculates arbitary math expressions
   - Uses [Math.js](https://mathjs.org/) for the legwork
   - Resolves numeric literals like `100k` to `100,000` (Supports T, B, M, and K and is is case-insensitive)
   - Includes `units(c,n)` function that calculates the price of `n`-units of `c` currency (of the 10 supported by [roa-apis](https://github.com/edvordo/roa-apis/blob/master/market-currency.md)). Each of them have shortened variables and single character shortcuts.
 * `!version` Responds with the release tag (if there is one), commit hash (if the branch is experimental), or branch name
 * `!help`, `!commands` Replies with a list of commands


## License
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fbobpaw%2Favabur-bot.svg?type=large)](https://app.fossa.com/projects/git%2Bgithub.com%2Fbobpaw%2Favabur-bot?ref=badge_large)

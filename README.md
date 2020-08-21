# avabur-bot

Requires a mysql database setup with:
 - avabur.events (time (timestamp))
 - 'avabur-bot'@'localhost' with permissions insert, select on avabur.events

Requires a secrets file like this:

```JavaScript
exports.bot_token = "bot_token_from_discord";
exports.sql_pass = "password for mysql user 'avabur-bot'@'localhost'";
```

Gathers event data if you have a [Notifications of Avabur](https://github.com/davidmcclelland/notifications-of-avabur) webhookup only. This means `!luck` is also invalid without it.

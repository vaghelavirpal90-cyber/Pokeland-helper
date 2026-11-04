# Pokeland Helper

A fan-made helper app for the mobile game Pokeland Legends: daily rotation, weather boosts, events and server timers. It is a single-page app that can be installed on a phone (PWA).

Live site: https://pokeland-helper-3sm.pages.dev/

## Files

- `index.html` - the whole app (HTML, CSS and JavaScript in one file)
- `sw.js` - service worker (offline support and caching)
- `manifest.json` - PWA install settings
- `icons/` - app icons

## Updating the app

When `index.html` changes, change `CACHE_NAME` in `sw.js` (for example `pokeland-helper-v2`). If it is not changed, some users may keep seeing the old version.

## Related

- Discord bot: https://github.com/vaghelavirpal90-cyber/pokeland-helper-bot
- Team workflow (issues, PRs, roles): https://github.com/vaghelavirpal90-cyber/ai-team

Unofficial fan project, not affiliated with the game's developers.

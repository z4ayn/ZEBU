# ZEBU — Discord Music & Utility Bot

> **Originally developed by [](https://discord.com/users/1519443744011714632)**

> ** Development:** [discord.gg/skyline](https://discord.gg/skylinee)

---

## Overview

Groove is a feature-rich Discord bot built with discord.js v14, centered around high-quality music playback via Lavalink (Kazagumo/Shoukaku). It also includes moderation, automod, invite tracking, giveaways, and server utilities. Uses hybrid sharding for scalability and SQLite for persistent storage.

---

## Features

- **Music** — Play from YouTube Music, Spotify, Apple Music, Deezer, and more. Full queue controls, filters, autoplay, lyrics, liked songs, 24/7 mode, now-playing cards
- **Moderation** — Ban, kick, mute, purge, lock/hide channels, nuke, snipe, role management
- **Automod** — Anti-link, anti-spam, anti-mention, anti-caps, anti-emoji, anti-NSFW with heat-based punishments
- **Invite Tracking** — Full invite tracking, leaderboard, fake/rejoin detection, invite logs
- **Giveaways** — Start, end, and reroll giveaways
- **User Profiles** — Bio, badges, friends, marry, rank system, profile cards
- **Information & Utility** — User/server info, avatar, audit logs, timers, and more
- **Owner Tools** — Blacklist, no-prefix access, server list, reload, restart, backup

---

## Prerequisites

- Node.js v18+
- A running Lavalink server (v4 recommended)
- Discord bot token with intents: `GUILDS`, `GUILD_MEMBERS`, `GUILD_MESSAGES`, `GUILD_VOICE_STATES`, `MESSAGE_CONTENT`, `GUILD_INVITES`, `GUILD_MESSAGE_REACTIONS`

---

## Installation

```bash
git clone https://github.com/AeroXDevelopment/groove.git
cd groove
npm install
```

---

## Configuration

Create `src/config.json`:

```json
{
  "token": "YOUR_BOT_TOKEN",
  "prefix": "!",
  "ownerID": ["YOUR_USER_ID"],
  "color": "#HEX_COLOR",
  "nodes": [
    {
      "name": "Main",
      "url": "localhost:2333",
      "auth": "yourlavalinksecret",
      "secure": false
    }
  ],
  "spotify": {
    "clientId": "YOUR_SPOTIFY_CLIENT_ID",
    "clientSecret": "YOUR_SPOTIFY_CLIENT_SECRET"
  }
}
```

---

## Commands

### Music
| Command | Description |
|---|---|
| `play` | Play a track or playlist |
| `pause` / `resume` | Pause or resume playback |
| `skip` / `forceskip` | Skip the current track |
| `skipto` | Skip to a queue position |
| `previous` | Play the previous track |
| `stop` | Stop and clear the queue |
| `queue` | Show the queue |
| `nowplaying` | Show the current track |
| `volume` | Set playback volume |
| `loop` | Toggle loop mode |
| `shuffle` | Shuffle the queue |
| `seek` / `rewind` / `forward` | Seek controls |
| `speed` | Set playback speed |
| `remove` / `clearqueue` / `move` | Queue management |
| `lyrics` | Fetch song lyrics |
| `search` | Search interactively |
| `grab` | Send track info to DMs |
| `replay` | Restart current track |
| `sleep` | Set a sleep timer |
| `autoplay` | Toggle autoplay |
| `artistradio` | Start an artist radio |
| `similar` / `mood` | Discover related tracks |
| `history` | Recently played tracks |
| `join` / `leave` | Join or leave voice |
| `filter` | Apply audio filters |
| `forcefix` | Fix a broken player |

### Liked Songs
| Command | Description |
|---|---|
| `like` / `unlike` | Like or unlike the current track |
| `likeall` | Like everything in the queue |
| `showliked` | View your liked songs |
| `playliked` | Play your liked songs |

### Moderation
| Command | Description |
|---|---|
| `ban` / `unban` | Ban or unban a user |
| `kick` | Kick a user |
| `mute` / `unmute` | Mute or unmute a user |
| `purge` | Bulk delete messages |
| `snipe` | View last deleted message |
| `lock` / `unlock` / `lockall` / `unlockall` | Lock channels |
| `hide` / `unhide` / `hideall` / `unhideall` | Hide channels |
| `nuke` | Recreate a channel |
| `rename` | Rename a channel |
| `role` | Add or remove a role |

### Configuration
| Command | Description |
|---|---|
| `setprefix` | Change server prefix |
| `ignore` | Toggle ignored channels |
| `247` | Toggle 24/7 mode |
| `source` | Set default music source |
| `automod` | Configure automod |

### Invite Tracking
| Command | Description |
|---|---|
| `invites` | Check your invites |
| `invited` | Who invited a user |
| `inviter` | Who a user has invited |
| `invitecodes` | Your active invite codes |
| `leaderboard` | Invite leaderboard |
| `invitetracking` | Enable/disable tracking |
| `clearinvites` / `resetmyinvites` | Reset invites |

### Giveaways
| Command | Description |
|---|---|
| `gstart` | Start a giveaway |
| `greroll` | Reroll winners |
| `gend` | End a giveaway early |

### Information
| Command | Description |
|---|---|
| `userinfo` / `serverinfo` | User or server info |
| `avatar` / `banner` | Avatars and banners |
| `roleinfo` / `channelinfo` | Role or channel info |
| `membercount` / `boostcount` | Server counts |
| `audit` | Recent audit log entries |
| `presence` | User's current activity |
| `firstmsg` | First message in a channel |
| `checkvanity` | Check a vanity URL |

### Utility
| Command | Description |
|---|---|
| `help` | Command list |
| `ping` | Bot latency |
| `stats` / `uptime` | Bot stats |
| `bio` / `profile` | User bio and profile card |
| `invite` / `support` | Bot links |
| `timer` | Set a reminder |

### Owner
| Command | Description |
|---|---|
| `blacklist` | Blacklist a user |
| `nopaccess` | Grant no-prefix access |
| `serverlist` / `leaveserver` | Server management |
| `reload` / `restart` | Reload or restart the bot |
| `node` / `team` | Node and team info |
| `backup` / `badge` / `branding` | Misc owner tools |

---

## Running

```bash
# Production
npm start

# Development
npm run dev
```

---

## Credits

| | |
|---|---|
| Original Developer | [not.blaxe](https://discord.com/users/689047015665172569) |
| Open Sourced By | [AeroX Development](https://discord.gg/aerox) |

This project was originally private and was leaked by a friend of the developer. AeroX Development has open-sourced it with the full consent of not.blaxe.

**Join us:** [discord.gg/aerox](https://discord.gg/aerox)

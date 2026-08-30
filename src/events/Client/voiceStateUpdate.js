const {
    PermissionsBitField,
    ChannelType
} = require('discord.js');

module.exports = {
    name: 'voiceStateUpdate',
    once: false,

    async run(client, oldState, newState) {

        try {

            const guild =
                newState.guild ||
                oldState.guild;

            if (!guild) return;

            /*
            ==========================================
            VC GUARD MEMORY
            ==========================================
            */

            if (!client.vcGuardChannels) {
                return;
            }

            /*
            User must be entering a VC.
            Ignore leaving a VC.
            */

            if (!newState.channelId) {
                return;
            }

            const channelId =
                newState.channelId;

            /*
            ==========================================
            CHECK GUARDED VC
            ==========================================
            */

            if (
                !client.vcGuardChannels.has(
                    channelId
                )
            ) {
                return;
            }

            const member =
                newState.member;

            if (!member) return;

            /*
            ==========================================
            BOTS ARE ALLOWED
            ==========================================
            */

            if (member.user.bot) {
                return;
            }

            /*
            ==========================================
            ALLOW LIST
            ==========================================
            
            IMPORTANT:

            ONLY explicitly allowed users
            can enter.

            No:
            - Administrator bypass
            - Moderator bypass
            - Server Owner bypass
            - Manage Server bypass
            - Bot Owner bypass
            */

            const allowed =
                client.vcGuardAllowed?.get(
                    channelId
                );

            if (
                allowed &&
                allowed.has(member.id)
            ) {
                return;
            }

            /*
            ==========================================
            BOT PERMISSION
            ==========================================
            */

            const me =
                guild.members.me;

            if (
                !me ||
                !me.permissions.has(
                    PermissionsBitField.Flags.MoveMembers
                )
            ) {

                console.log(
                    `[VC Guard] Missing Move Members permission in ${guild.name}`
                );

                return;
            }

            /*
            ==========================================
            WARNING SYSTEM
            ==========================================
            
            Per user:

            Maximum:
            6 warning messages
            within 10 minutes.

            After 6:
            No more messages for 10 minutes.

            Every warning:
            Automatically deleted after 5 seconds.
            */

            if (!client.vcGuardWarnings) {

                client.vcGuardWarnings =
                    new Map();

            }

            const now =
                Date.now();

            let userData =
                client.vcGuardWarnings.get(
                    member.id
                );

            /*
            Create user data
            */

            if (!userData) {

                userData = {
                    count: 0,
                    resetAt: now + 10 * 60 * 1000
                };

                client.vcGuardWarnings.set(
                    member.id,
                    userData
                );
            }

            /*
            ==========================================
            RESET 10 MINUTE WINDOW
            ==========================================
            */

            if (
                now >= userData.resetAt
            ) {

                userData.count = 0;

                userData.resetAt =
                    now + 10 * 60 * 1000;
            }

            /*
            ==========================================
            KICK USER FIRST
            ==========================================
            */

            await member.voice
                .disconnect(
                    'VC Guard: User is not allowed'
                )
                .catch(error => {

                    console.error(
                        `[VC Guard] Failed to disconnect ${member.user.tag}:`,
                        error.message
                    );

                });

            /*
            ==========================================
            MESSAGE CHANNEL
            ==========================================
            
            Voice channels can have an associated
            text chat.

            Send warning there.
            */

            const voiceChannel =
                guild.channels.cache.get(
                    channelId
                );

            if (!voiceChannel) {
                return;
            }

            /*
            ==========================================
            6 MESSAGE LIMIT / 10 MINUTE COOLDOWN
            ==========================================
            */

            if (
                userData.count >= 6
            ) {

                /*
                User already reached
                6 warnings.

                Do NOT send another message.
                */

                return;
            }

            /*
            ==========================================
            FIND VC CHAT
            ==========================================
            */

            let warningChannel = null;

            /*
            Discord voice channels have an
            associated text chat channel.

            Try the channel itself first.
            */

            if (
                typeof voiceChannel.send ===
                'function'
            ) {

                warningChannel =
                    voiceChannel;

            }

            /*
            Some Discord.js versions expose
            the associated text channel through
            the channel object.

            Fallback:
            Search guild channels using
            matching name / parent.
            */

            if (!warningChannel) {

                warningChannel =
                    guild.channels.cache.find(
                        channel =>
                            channel.type ===
                                ChannelType.GuildText &&
                            channel.parentId ===
                                voiceChannel.parentId &&
                            channel.name ===
                                voiceChannel.name
                    );
            }

            /*
            If no writable channel exists,
            still keep the kick working.
            */

            if (
                !warningChannel ||
                typeof warningChannel.send !==
                    'function'
            ) {

                return;
            }

            /*
            ==========================================
            SEND WARNING
            ==========================================
            */

            userData.count++;

            const remaining =
                6 - userData.count;

            const warningMessage =
                await warningChannel
                    .send({
                        content:
                            `${member}\n` +
                            `🛡️ **This voice channel is guarded.**\n` +
                            `You must get permission from the VC owner before joining this channel.` +
                            (
                                remaining > 0
                                    ? `\n\n-# Warning ${userData.count}/6`
                                    : `\n\n-# You have reached the 6/6 warning limit.`
                            ),

                        allowedMentions: {
                            users: [
                                member.id
                            ]
                        }
                    })
                    .catch(() => null);

            /*
            ==========================================
            AUTO DELETE AFTER 5 SECONDS
            ==========================================
            */

            if (warningMessage) {

                setTimeout(
                    () => {

                        warningMessage
                            .delete()
                            .catch(() => {});

                    },
                    5000
                );

            }

        } catch (error) {

            console.error(
                '[VC GUARD ERROR]',
                error
            );

        }

    }
};

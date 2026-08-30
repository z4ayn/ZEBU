const {
    PermissionsBitField
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
            GUARD CHECK
            ==========================================
            */

            if (!client.vcGuardChannels) {
                return;
            }

            /*
            User left VC completely
            */

            if (!newState.channelId) {
                return;
            }

            const channelId =
                newState.channelId;

            /*
            Is destination VC guarded?
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
            BOTS
            ==========================================
            
            Bots are allowed.
            Remove this block if you want
            bots to be kicked too.
            */

            if (member.user.bot) {
                return;
            }

            /*
            ==========================================
            ALLOW LIST
            ==========================================
            */

            const allowed =
                client.vcGuardAllowed?.get(
                    channelId
                );

            /*
            IMPORTANT:

            User MUST be explicitly allowed.

            No:
            - Admin bypass
            - Moderator bypass
            - Server owner bypass
            - Bot owner bypass
            - Permission bypass
            */

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

            const me = guild.members.me;

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
            KICK UNAUTHORIZED USER
            ==========================================
            */

            await member.voice
                .disconnect(
                    'VC Guard: User is not allowed'
                )
                .catch(err => {

                    console.error(
                        `[VC Guard] Failed to disconnect ${member.user.tag}:`,
                        err.message
                    );

                });

        } catch (error) {

            console.error(
                '[VC GUARD ERROR]',
                error
            );

        }
    }
};

const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "voiceStateUpdate",

    async execute(oldState, newState, client) {
        try {
            if (!client.db?.vcguard) return;

            const guild = newState.guild || oldState.guild;
            if (!guild) return;

            const guard = client.db.vcguard.get(guild.id);

            if (!guard || !guard.enabled) return;

            const member = newState.member;
            if (!member || member.user.bot) return;

            // Server owner / bot owner
            if (
                member.id === guild.ownerId ||
                client.owners?.includes(member.id)
            ) {
                return;
            }

            // Allowed users
            if (guard.allowedUsers?.includes(member.id)) {
                return;
            }

            // Only when user joins/moves to a VC
            if (!newState.channelId) return;

            // Bot needs Move Members
            const me = guild.members.me;

            if (
                !me?.permissions.has(
                    PermissionsBitField.Flags.MoveMembers
                )
            ) {
                console.log(
                    "[VC Guard] Missing Move Members permission."
                );
                return;
            }

            // Disconnect unauthorized user
            await member.voice
                .disconnect("VC Guard: user not allowed")
                .catch(() => {});

        } catch (error) {
            console.error(
                "[VC GUARD ERROR]",
                error
            );
        }
    }
};

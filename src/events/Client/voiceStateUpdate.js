const { PermissionsBitField } = require("discord.js");

module.exports = {
    name: "voiceStateUpdate",
    once: false,

    async run(client, oldState, newState) {
        try {
            const guild = newState.guild || oldState.guild;
            if (!guild) return;

            const guard = client.vcGuard?.get(guild.id);
            if (!guard || !guard.enabled) return;

            const channel = newState.channel;
            if (!channel || channel.id !== guard.channelId) return;

            const member = newState.member;
            if (!member || member.user.bot) return;

            // Server owner / bot owner always allowed
            if (
                member.id === guild.ownerId ||
                client.owners?.includes(member.id)
            ) return;

            // Allowed users
            if (guard.allowed?.includes(member.id)) return;

            // Bot needs Move Members
            const me = guild.members.me;
            if (!me?.permissions.has(PermissionsBitField.Flags.MoveMembers)) return;

            await member.voice.disconnect("VC Guard: user not allowed").catch(() => {});
        } catch (err) {
            console.error("[VC Guard Error]", err);
        }
    }
};

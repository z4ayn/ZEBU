module.exports = {
    name: 'voiceStateUpdate',

    async execute(oldState, newState, client) {
        try {
            if (!client.vcGuardChannels) return;

            // User joined a voice channel
            if (!oldState.channelId && newState.channelId) {

                const channelId = newState.channelId;

                // This VC is not guarded
                if (!client.vcGuardChannels.has(channelId)) {
                    return;
                }

                const member = newState.member;

                if (!member) return;

                // Don't kick bots
                if (member.user.bot) return;

                // Allowed users can join
                const allowed =
                    client.vcGuardAllowed?.get(channelId);

                if (allowed && allowed.has(member.id)) {
                    return;
                }

                // Kick user from VC
                await member.voice.disconnect(
                    'VC Guard: User is not allowed'
                ).catch(() => {});

                return;
            }

            // User moved from another VC into guarded VC
            if (
                oldState.channelId !== newState.channelId &&
                newState.channelId
            ) {

                const channelId = newState.channelId;

                if (!client.vcGuardChannels.has(channelId)) {
                    return;
                }

                const member = newState.member;

                if (!member) return;

                if (member.user.bot) return;

                const allowed =
                    client.vcGuardAllowed?.get(channelId);

                if (allowed && allowed.has(member.id)) {
                    return;
                }

                await member.voice.disconnect(
                    'VC Guard: User is not allowed'
                ).catch(() => {});
            }

        } catch (error) {
            console.error(
                '[VC GUARD ERROR]',
                error
            );
        }
    }
};

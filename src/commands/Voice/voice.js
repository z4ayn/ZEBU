const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    PermissionFlagsBits,
    ChannelType
} = require('discord.js');

const emoji = require('../../emojis');

module.exports = {
    name: 'voice',
    description: 'Voice moderation commands',
    category: 'Voice',
    aliases: ['vc'],
    usage: 'voice <subcommand> [args]',
    example: 'voice kick @user | voice muteall | voice lock',

    subCommands: [
        'kick', 'kickall',
        'mute', 'unmute', 'muteall', 'unmuteall',
        'deafen', 'undeafen', 'deafenall', 'undeafenall',
        'move', 'moveall',
        'pull', 'pullall',
        'lock', 'unlock',
        'private', 'unprivate',
        'allow', 'unallow', 'list',
        'guard', 'unguard'
    ],

    async execute(message, args, client, prefix) {
        if (!args.length) {
            return this.sendHelpMenu(message, client, prefix);
        }

        const subcommand = args[0].toLowerCase();

        return this.handleVoice(
            message,
            subcommand,
            args.slice(1),
            client,
            prefix
        );
    },

    async handleVoice(context, subcommand, options, client, prefix) {

        const guild = context.guild;
        if (!guild) return;

        const member = context.member;
        const user = context.author || context.user;

        if (!member || !user) return;

        /*
        ==========================================
        VC GUARD MEMORY
        ==========================================

        vcGuardChannels
        Set<ChannelID>

        vcGuardAllowed
        Map<ChannelID, Set<UserID>>

        ==========================================
        */

        if (!client.vcGuardChannels) {
            client.vcGuardChannels = new Set();
        }

        if (!client.vcGuardAllowed) {
            client.vcGuardAllowed = new Map();
        }

        const voiceChannel = member.voice?.channel;

        const isOwner =
            client.owners?.includes(user.id);

        /*
        ==========================================
        HELPERS
        ==========================================
        */

        const getTarget = async (arg) => {

            if (!arg) return null;

            const id =
                arg.replace(/[<@!>]/g, '');

            let target =
                await guild.members
                    .fetch(id)
                    .catch(() => null);

            if (!target) {

                const search =
                    arg.toLowerCase();

                target =
                    guild.members.cache.find(m =>
                        m.user.username
                            .toLowerCase() === search ||

                        m.displayName
                            .toLowerCase() === search ||

                        m.user.tag?.toLowerCase() === search
                    );
            }

            return target || null;
        };

        const getChannel = async (arg) => {

            if (!arg) return null;

            const id =
                arg.replace(/[<#>]/g, '');

            let channel =
                guild.channels.cache.get(id);

            if (!channel) {

                const search =
                    arg.toLowerCase();

                channel =
                    guild.channels.cache.find(c =>
                        c.name.toLowerCase() === search &&
                        (
                            c.type === ChannelType.GuildVoice ||
                            c.type === ChannelType.GuildStageVoice
                        )
                    );
            }

            return channel || null;
        };

        /*
        ==========================================
        SUCCESS
        ==========================================
        */

        const success = (msg) => {

            const display =
                new TextDisplayBuilder()
                    .setContent(
                        `${emoji.check} ${msg}`
                    );

            const container =
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        display
                    );

            return context.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        };

        /*
        ==========================================
        ERROR
        ==========================================
        */

        const error = (msg) => {

            const display =
                new TextDisplayBuilder()
                    .setContent(
                        `${emoji.warn} ${msg}`
                    );

            const container =
                new ContainerBuilder()
                    .addTextDisplayComponents(
                        display
                    );

            return context.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        };

        /*
        ==========================================
        USAGE
        ==========================================
        */

        const usage = (
            cmd,
            use,
            desc,
            aliases = 'none'
        ) => {

            const container =
                new ContainerBuilder();

            container.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        '```<> : Required | [] : Optional```'
                    )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder()
            );

            let content =
                `> **\`${prefix}voice ${cmd} ${use}\`**\n\n` +
                `${emoji.arrowright} ${desc}\n`;

            if (
                aliases &&
                aliases.toLowerCase() !== 'none'
            ) {
                content +=
                    `${emoji.arrowright} **Aliases :** \`${aliases}\`\n`;
            }

            container.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(content)
            );

            container.addSeparatorComponents(
                new SeparatorBuilder()
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `-# Requested by ${user.displayName}`
                    )
            );

            return context.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2
            });
        };

        /*
        ==========================================
        SUBCOMMAND ALIASES
        ==========================================
        */

        const subAliases = {

            k: 'kick',
            ka: 'kickall',
            kall: 'kickall',

            m: 'mute',
            um: 'unmute',

            ma: 'muteall',
            mall: 'muteall',

            uma: 'unmuteall',
            umall: 'unmuteall',

            d: 'deafen',
            ud: 'undeafen',

            da: 'deafenall',
            dall: 'deafenall',

            uda: 'undeafenall',
            udall: 'undeafenall',

            mv: 'move',
            mva: 'moveall',
            mvall: 'moveall',

            p: 'pull',
            pa: 'pullall',
            pall: 'pullall',

            l: 'lock',
            ul: 'unlock',

            pr: 'private',
            upr: 'unprivate'
        };

        const realSub =
            subAliases[subcommand] ||
            subcommand;

        /*
        ==========================================
        BOT PERMISSIONS
        ==========================================
        */

        const botPerms = {

            kick:
                PermissionFlagsBits.MoveMembers,

            kickall:
                PermissionFlagsBits.MoveMembers,

            mute:
                PermissionFlagsBits.MuteMembers,

            unmute:
                PermissionFlagsBits.MuteMembers,

            muteall:
                PermissionFlagsBits.MuteMembers,

            unmuteall:
                PermissionFlagsBits.MuteMembers,

            deafen:
                PermissionFlagsBits.DeafenMembers,

            undeafen:
                PermissionFlagsBits.DeafenMembers,

            deafenall:
                PermissionFlagsBits.DeafenMembers,

            undeafenall:
                PermissionFlagsBits.DeafenMembers,

            move:
                PermissionFlagsBits.MoveMembers,

            moveall:
                PermissionFlagsBits.MoveMembers,

            pull:
                PermissionFlagsBits.MoveMembers,

            pullall:
                PermissionFlagsBits.MoveMembers,

            lock:
                PermissionFlagsBits.ManageChannels,

            unlock:
                PermissionFlagsBits.ManageChannels,

            private:
                PermissionFlagsBits.ManageChannels,

            unprivate:
                PermissionFlagsBits.ManageChannels,

            guard:
                PermissionFlagsBits.MoveMembers,

            unguard:
                PermissionFlagsBits.MoveMembers,

            allow:
                PermissionFlagsBits.MoveMembers,

            unallow:
                PermissionFlagsBits.MoveMembers,

            list:
                PermissionFlagsBits.MoveMembers
        };

        const requiredPerm =
            botPerms[realSub];

        const me =
            guild.members.me;

        if (
            requiredPerm &&
            !me?.permissions.has(requiredPerm)
        ) {
            return error(
                'I need the required permission to perform this action.'
            );
        }

        try {

            switch (realSub) {

                /*
                ==========================================
                GUARD
                ==========================================
                */

                case 'guard': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    /*
                    Enable Guard
                    */

                    client.vcGuardChannels.add(
                        voiceChannel.id
                    );

                    /*
                    Create allow list
                    */

                    if (
                        !client.vcGuardAllowed.has(
                            voiceChannel.id
                        )
                    ) {
                        client.vcGuardAllowed.set(
                            voiceChannel.id,
                            new Set()
                        );
                    }

                    return success(
                        `🛡️ VC Guard enabled for ${voiceChannel}.\n` +
                        `Only explicitly allowed users can join this VC.`
                    );
                }

                /*
                ==========================================
                UNGUARD
                ==========================================
                */

                case 'unguard': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    client.vcGuardChannels.delete(
                        voiceChannel.id
                    );

                    client.vcGuardAllowed.delete(
                        voiceChannel.id
                    );

                    return success(
                        `🛡️ VC Guard disabled for ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                ALLOW
                ==========================================
                */

                case 'allow': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    if (
                        !client.vcGuardChannels.has(
                            voiceChannel.id
                        )
                    ) {
                        return error(
                            `VC Guard is not enabled for ${voiceChannel}.`
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'allow',
                            '<user>',
                            'Allows a user to join the guarded voice channel.'
                        );
                    }

                    const target =
                        await getTarget(
                            options[0]
                        );

                    if (!target) {
                        return error(
                            'User not found.'
                        );
                    }

                    if (
                        !client.vcGuardAllowed.has(
                            voiceChannel.id
                        )
                    ) {
                        client.vcGuardAllowed.set(
                            voiceChannel.id,
                            new Set()
                        );
                    }

                    const allowed =
                        client.vcGuardAllowed.get(
                            voiceChannel.id
                        );

                    allowed.add(
                        target.id
                    );

                    return success(
                        `${target} is now allowed to join ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                UNALLOW
                ==========================================
                */

                case 'unallow': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'unallow',
                            '<user>',
                            'Removes a user from the VC allow list.'
                        );
                    }

                    const target =
                        await getTarget(
                            options[0]
                        );

                    if (!target) {
                        return error(
                            'User not found.'
                        );
                    }

                    const allowed =
                        client.vcGuardAllowed.get(
                            voiceChannel.id
                        );

                    if (
                        !allowed ||
                        !allowed.has(target.id)
                    ) {
                        return error(
                            `${target} is not in the allow list.`
                        );
                    }

                    allowed.delete(
                        target.id
                    );

                    /*
                    If currently inside guarded VC,
                    disconnect immediately.
                    */

                    if (
                        target.voice.channelId ===
                        voiceChannel.id
                    ) {

                        await target.voice
                            .disconnect(
                                'VC Guard: User removed from allow list'
                            )
                            .catch(() => {});
                    }

                    return success(
                        `${target} has been removed from the allow list.`
                    );
                }

                /*
                ==========================================
                LIST
                ==========================================
                */

                case 'list': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    if (
                        !client.vcGuardChannels.has(
                            voiceChannel.id
                        )
                    ) {
                        return error(
                            `VC Guard is not enabled for ${voiceChannel}.`
                        );
                    }

                    const allowed =
                        client.vcGuardAllowed.get(
                            voiceChannel.id
                        );

                    if (
                        !allowed ||
                        allowed.size === 0
                    ) {
                        return success(
                            `No users are allowed in ${voiceChannel}.`
                        );
                    }

                    const users =
                        [...allowed]
                            .map(
                                id =>
                                    `<@${id}>`
                            )
                            .join(', ');

                    return success(
                        `Allowed users in ${voiceChannel}: ${users}`
                    );
                }

                /*
                ==========================================
                KICK
                ==========================================
                */

                case 'kick': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'kick',
                            '<user>',
                            'Kicks a user from their voice channel.',
                            'k'
                        );
                    }

                    const target =
                        await getTarget(
                            options[0]
                        );

                    if (
                        !target ||
                        !target.voice.channel
                    ) {
                        return error(
                            'User is not in a voice channel.'
                        );
                    }

                    const targetChannel =
                        target.voice.channel;

                    await target.voice
                        .disconnect();

                    return success(
                        `Kicked ${target} from ${targetChannel}.`
                    );
                }

                /*
                ==========================================
                KICK ALL
                ==========================================
                */

                case 'kickall': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    const members =
                        voiceChannel.members.filter(
                            m => !m.user.bot
                        );

                    for (
                        const [, m]
                        of members
                    ) {
                        await m.voice
                            .disconnect()
                            .catch(() => {});
                    }

                    return success(
                        `Kicked all users from ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                MUTE
                ==========================================
                */

                case 'mute': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MuteMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Mute Members` permission.'
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'mute',
                            '<user>',
                            'Mutes a user in their voice channel.',
                            'm'
                        );
                    }

                    const target =
                        await getTarget(
                            options[0]
                        );

                    if (
                        !target ||
                        !target.voice.channel
                    ) {
                        return error(
                            'User is not in a voice channel.'
                        );
                    }

                    if (target.voice.mute) {
                        return error(
                            `${target} is already muted.`
                        );
                    }

                    await target.voice
                        .setMute(true);

                    return success(
                        `Muted ${target}.`
                    );
                }

                /*
                ==========================================
                UNMUTE
                ==========================================
                */

                case 'unmute': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MuteMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Mute Members` permission.'
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'unmute',
                            '<user>',
                            'Unmutes a user in their voice channel.',
                            'um'
                        );
                    }

                    const target =
                        await getTarget(
                            options[0]
                        );

                    if (
                        !target ||
                        !target.voice.channel
                    ) {
                        return error(
                            'User is not in a voice channel.'
                        );
                    }

                    if (!target.voice.mute) {
                        return error(
                            `${target} is not muted.`
                        );
                    }

                    await target.voice
                        .setMute(false);

                    return success(
                        `Unmuted ${target}.`
                    );
                }

                /*
                ==========================================
                MUTE ALL
                ==========================================
                */

                case 'muteall': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MuteMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Mute Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    const members =
                        voiceChannel.members.filter(
                            m =>
                                !m.user.bot &&
                                !m.voice.mute
                        );

                    if (!members.size) {
                        return error(
                            'Everyone is already muted.'
                        );
                    }

                    for (
                        const [, m]
                        of members
                    ) {
                        await m.voice
                            .setMute(true)
                            .catch(() => {});
                    }

                    return success(
                        `Muted everyone in ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                UNMUTE ALL
                ==========================================
                */

                case 'unmuteall': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MuteMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Mute Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    const members =
                        voiceChannel.members.filter(
                            m =>
                                !m.user.bot &&
                                m.voice.mute
                        );

                    if (!members.size) {
                        return error(
                            'No one is muted.'
                        );
                    }

                    for (
                        const [, m]
                        of members
                    ) {
                        await m.voice
                            .setMute(false)
                            .catch(() => {});
                    }

                    return success(
                        `Unmuted everyone in ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                DEAFEN
                ==========================================
                */

                case 'deafen': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.DeafenMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Deafen Members` permission.'
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'deafen',
                            '<user>',
                            'Deafens a user in their voice channel.',
                            'd'
                        );
                    }

                    const target =
                        await getTarget(
                            options[0]
                        );

                    if (
                        !target ||
                        !target.voice.channel
                    ) {
                        return error(
                            'User is not in a voice channel.'
                        );
                    }

                    if (target.voice.deaf) {
                        return error(
                            `${target} is already deafened.`
                        );
                    }

                    await target.voice
                        .setDeaf(true);

                    return success(
                        `Deafened ${target}.`
                    );
                }

                /*
                ==========================================
                UNDEAFEN
                ==========================================
                */

                case 'undeafen': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.DeafenMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Deafen Members` permission.'
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'undeafen',
                            '<user>',
                            'Undeafens a user in their voice channel.',
                            'ud'
                        );
                    }

                    const target =
                        await getTarget(
                            options[0]
                        );

                    if (
                        !target ||
                        !target.voice.channel
                    ) {
                        return error(
                            'User is not in a voice channel.'
                        );
                    }

                    if (!target.voice.deaf) {
                        return error(
                            `${target} is not deafened.`
                        );
                    }

                    await target.voice
                        .setDeaf(false);

                    return success(
                        `Undeafened ${target}.`
                    );
                }

                /*
                ==========================================
                DEAFEN ALL
                ==========================================
                */

                case 'deafenall': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.DeafenMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Deafen Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    const members =
                        voiceChannel.members.filter(
                            m =>
                                !m.user.bot &&
                                !m.voice.deaf
                        );

                    if (!members.size) {
                        return error(
                            'Everyone is already deafened.'
                        );
                    }

                    for (
                        const [, m]
                        of members
                    ) {
                        await m.voice
                            .setDeaf(true)
                            .catch(() => {});
                    }

                    return success(
                        `Deafened everyone in ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                UNDEAFEN ALL
                ==========================================
                */

                case 'undeafenall': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.DeafenMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Deafen Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    const members =
                        voiceChannel.members.filter(
                            m =>
                                !m.user.bot &&
                                m.voice.deaf
                        );

                    if (!members.size) {
                        return error(
                            'No one is deafened.'
                        );
                    }

                    for (
                        const [, m]
                        of members
                    ) {
                        await m.voice
                            .setDeaf(false)
                            .catch(() => {});
                    }

                    return success(
                        `Undeafened everyone in ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                MOVE
                ==========================================
                */

                case 'move': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'move',
                            '<user> <channel>',
                            'Moves a user to another voice channel.',
                            'mv'
                        );
                    }

                    if (!options[1]) {

                        return usage(
                            'move',
                            '<user> <channel>',
                            'Provide the destination channel.',
                            'mv'
                        );
                    }

                    const target =
                        await getTarget(
                            options[0]
                        );

                    const dest =
                        await getChannel(
                            options[1]
                        );

                    if (
                        !target ||
                        !target.voice.channel
                    ) {
                        return error(
                            'User is not in a voice channel.'
                        );
                    }

                    if (
                        !dest ||
                        (
                            dest.type !==
                                ChannelType.GuildVoice &&
                            dest.type !==
                                ChannelType.GuildStageVoice
                        )
                    ) {
                        return error(
                            'Provide a valid voice channel.'
                        );
                    }

                    await target.voice
                        .setChannel(dest);

                    return success(
                        `Moved ${target} to ${dest}.`
                    );
                }

                /*
                ==========================================
                MOVE ALL
                ==========================================
                */

                case 'moveall': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'moveall',
                            '<channel>',
                            'Moves users from current VC to another.',
                            'mva, mvall'
                        );
                    }

                    const dest =
                        await getChannel(
                            options[0]
                        );

                    if (
                        !dest ||
                        (
                            dest.type !==
                                ChannelType.GuildVoice &&
                            dest.type !==
                                ChannelType.GuildStageVoice
                        )
                    ) {
                        return error(
                            'Provide a valid voice channel.'
                        );
                    }

                    const members =
                        voiceChannel.members.filter(
                            m => !m.user.bot
                        );

                    for (
                        const [, m]
                        of members
                    ) {
                        await m.voice
                            .setChannel(dest)
                            .catch(() => {});
                    }

                    return success(
                        `Moved everyone from ${voiceChannel} to ${dest}.`
                    );
                }

                /*
                ==========================================
                PULL
                ==========================================
                */

                case 'pull': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'pull',
                            '<user>',
                            'Pulls a user into your current VC.',
                            'p'
                        );
                    }

                    const target =
                        await getTarget(
                            options[0]
                        );

                    if (
                        !target ||
                        !target.voice.channel
                    ) {
                        return error(
                            'User is not in a voice channel.'
                        );
                    }

                    await target.voice
                        .setChannel(
                            voiceChannel
                        );

                    return success(
                        `Pulled ${target} into ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                PULL ALL
                ==========================================
                */

                case 'pullall': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.MoveMembers
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Move Members` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    if (!options[0]) {

                        return usage(
                            'pullall',
                            '<channel>',
                            'Pulls all users from another VC into yours.',
                            'pa, pall'
                        );
                    }

                    const source =
                        await getChannel(
                            options[0]
                        );

                    if (
                        !source ||
                        (
                            source.type !==
                                ChannelType.GuildVoice &&
                            source.type !==
                                ChannelType.GuildStageVoice
                        )
                    ) {
                        return error(
                            'Provide a valid voice channel.'
                        );
                    }

                    const members =
                        source.members.filter(
                            m => !m.user.bot
                        );

                    for (
                        const [, m]
                        of members
                    ) {
                        await m.voice
                            .setChannel(
                                voiceChannel
                            )
                            .catch(() => {});
                    }

                    return success(
                        `Pulled everyone from ${source} into ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                LOCK
                ==========================================
                */

                case 'lock': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.ManageChannels
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Manage Channels` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    await voiceChannel
                        .permissionOverwrites
                        .edit(
                            guild.roles.everyone,
                            {
                                Connect: false
                            }
                        );

                    return success(
                        `Locked ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                UNLOCK
                ==========================================
                */

                case 'unlock': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.ManageChannels
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Manage Channels` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    await voiceChannel
                        .permissionOverwrites
                        .edit(
                            guild.roles.everyone,
                            {
                                Connect: null
                            }
                        );

                    return success(
                        `Unlocked ${voiceChannel}.`
                    );
                }

                /*
                ==========================================
                PRIVATE
                ==========================================
                */

                case 'private': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.ManageChannels
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Manage Channels` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    await voiceChannel
                        .permissionOverwrites
                        .edit(
                            guild.roles.everyone,
                            {
                                ViewChannel: false
                            }
                        );

                    return success(
                        `Made ${voiceChannel} private.`
                    );
                }

                /*
                ==========================================
                UNPRIVATE
                ==========================================
                */

                case 'unprivate': {

                    if (
                        !member.permissions.has(
                            PermissionFlagsBits.ManageChannels
                        ) &&
                        !isOwner
                    ) {
                        return error(
                            'You need `Manage Channels` permission.'
                        );
                    }

                    if (!voiceChannel) {
                        return error(
                            'You must be in a voice channel.'
                        );
                    }

                    await voiceChannel
                        .permissionOverwrites
                        .edit(
                            guild.roles.everyone,
                            {
                                ViewChannel: null
                            }
                        );

                    return success(
                        `Made ${voiceChannel} public.`
                    );
                }

                default:

                    return this.sendHelpMenu(
                        context,
                        client,
                        prefix
                    );
            }

        } catch (err) {

            console.error(
                '[VOICE COMMAND ERROR]',
                err
            );

            return error(
                `An error occurred: ${err.message}`
            );
        }
    },

    /*
    ==========================================
    HELP MENU
    ==========================================
    */

    async sendHelpMenu(
        message,
        client,
        prefix
    ) {

        const usedPrefix =
            prefix || client.prefix;

        const pages = [

            {
                items: [
                    {
                        cmd: 'voice guard',
                        desc: 'Enables VC Guard. Only explicitly allowed users can join.'
                    },
                    {
                        cmd: 'voice allow',
                        desc: 'Allows a user to join the guarded VC.'
                    },
                    {
                        cmd: 'voice unallow',
                        desc: 'Removes a user from the VC allow list.'
                    },
                    {
                        cmd: 'voice list',
                        desc: 'Shows users allowed in the guarded VC.'
                    },
                    {
                        cmd: 'voice unguard',
                        desc: 'Disables VC Guard.'
                    }
                ]
            },

            {
                items: [
                    {
                        cmd: 'voice kick',
                        desc: 'Kicks a user from their voice channel.'
                    },
                    {
                        cmd: 'voice kickall',
                        desc: 'Kicks all users from the current VC.'
                    },
                    {
                        cmd: 'voice lock',
                        desc: 'Locks the current voice channel.'
                    },
                    {
                        cmd: 'voice unlock',
                        desc: 'Unlocks the current voice channel.'
                    },
                    {
                        cmd: 'voice move',
                        desc: 'Moves a user to another voice channel.'
                    },
                    {
                        cmd: 'voice moveall',
                        desc: 'Moves users to another voice channel.'
                    }
                ]
            },

            {
                items: [
                    {
                        cmd: 'voice mute',
                        desc: 'Mutes a user.'
                    },
                    {
                        cmd: 'voice muteall',
                        desc: 'Mutes all users.'
                    },
                    {
                        cmd: 'voice unmute',
                        desc: 'Unmutes a user.'
                    },
                    {
                        cmd: 'voice unmuteall',
                        desc: 'Unmutes all users.'
                    },
                    {
                        cmd: 'voice deafen',
                        desc: 'Deafens a user.'
                    },
                    {
                        cmd: 'voice undeafen',
                        desc: 'Undeafens a user.'
                    }
                ]
            },

            {
                items: [
                    {
                        cmd: 'voice deafenall',
                        desc: 'Deafens everyone in the current VC.'
                    },
                    {
                        cmd: 'voice undeafenall',
                        desc: 'Undeafens everyone in the current VC.'
                    },
                    {
                        cmd: 'voice pull',
                        desc: 'Pulls a user into your current VC.'
                    },
                    {
                        cmd: 'voice pullall',
                        desc: 'Pulls all users from another VC.'
                    },
                    {
                        cmd: 'voice private',
                        desc: 'Makes the current VC private.'
                    },
                    {
                        cmd: 'voice unprivate',
                        desc: 'Makes the current VC public.'
                    }
                ]
            }
        ];

        let currentPage = 0;

        const author =
            message.author ||
            message.user;

        const totalCommands =
            pages.reduce(
                (acc, p) =>
                    acc + p.items.length,
                0
            );

        const createContainer = (
            pageIdx
        ) => {

            const page =
                pages[pageIdx];

            const container =
                new ContainerBuilder();

            container.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `### ${emoji.info} Voice Command [${totalCommands}]`
                    )
            );

            container.addSeparatorComponents(
                new SeparatorBuilder()
            );

            const content =
                page.items
                    .map(
                        item =>
                            `> **\`${usedPrefix}${item.cmd}\`**\n╰ ${item.desc}`
                    )
                    .join('\n\n');

            container.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(content)
            );

            container.addSeparatorComponents(
                new SeparatorBuilder()
            );

            container.addTextDisplayComponents(
                new TextDisplayBuilder()
                    .setContent(
                        `-# Page ${pageIdx + 1}/${pages.length} | Requested by ${author.displayName}`
                    )
            );

            return container;
        };

        const getButtons = () => {

            return new ActionRowBuilder()
                .addComponents(

                    new ButtonBuilder()
                        .setCustomId('home')
                        .setLabel('Home')
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId('prev')
                        .setLabel('Previous')
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId('next')
                        .setLabel('Next')
                        .setStyle(
                            ButtonStyle.Secondary
                        ),

                    new ButtonBuilder()
                        .setCustomId('close')
                        .setLabel('Close')
                        .setStyle(
                            ButtonStyle.Danger
                        )
                );
        };

        const msg =
            await message.reply({

                content: '',

                components: [
                    createContainer(
                        currentPage
                    ),
                    getButtons()
                ],

                flags:
                    MessageFlags.IsComponentsV2,

                allowedMentions: {
                    parse: []
                }
            });

        const collector =
            msg.createMessageComponentCollector({

                filter:
                    i =>
                        i.user.id ===
                        author.id,

                time: 60000,

                componentType:
                    ComponentType.Button
            });

        collector.on(
            'collect',
            async interaction => {

                if (
                    interaction.customId ===
                    'close'
                ) {

                    return interaction.message
                        .delete()
                        .catch(() => {});
                }

                if (
                    interaction.customId ===
                    'home'
                ) {
                    currentPage = 0;
                }

                if (
                    interaction.customId ===
                    'prev'
                ) {

                    currentPage =
                        (
                            currentPage -
                            1 +
                            pages.length
                        ) %
                        pages.length;
                }

                if (
                    interaction.customId ===
                    'next'
                ) {

                    currentPage =
                        (
                            currentPage +
                            1
                        ) %
                        pages.length;
                }

                await interaction.update({

                    components: [
                        createContainer(
                            currentPage
                        ),
                        getButtons()
                    ],

                    flags:
                        MessageFlags.IsComponentsV2,

                    allowedMentions: {
                        parse: []
                    }
                });
            }
        );

        collector.on(
            'end',
            () => {

                msg.edit({

                    components: [
                        createContainer(
                            currentPage
                        )
                    ],

                    flags:
                        MessageFlags.IsComponentsV2,

                    allowedMentions: {
                        parse: []
                    }

                }).catch(() => {});
            }
        );
    }
};

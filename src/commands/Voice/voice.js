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

    example:
        'voice kick @user | voice muteall | voice lock',

    subCommands: [
        'kick',
        'kickall',
        'mute',
        'unmute',
        'muteall',
        'unmuteall',
        'deafen',
        'undeafen',
        'deafenall',
        'undeafenall',
        'move',
        'moveall',
        'pull',
        'pullall',
        'lock',
        'unlock',
        'private',
        'unprivate',
        'allow',
        'unallow',
        'list',
        'guard',
        'unguard'
    ],

    async execute(message, args, client, prefix) {

        if (!args.length) {
            return this.sendHelpMenu(
                message,
                client,
                prefix
            );
        }

        const subcommand =
            args[0].toLowerCase();

        return this.handleVoice(
            message,
            subcommand,
            args.slice(1),
            client,
            prefix
        );
    },

    async handleVoice(
        context,
        subcommand,
        options,
        client,
        prefix
    ) {

        const guild = context.guild;

        if (!guild) return;

        const member = context.member;
        const user =
            context.author ||
            context.user;

        if (!member || !user) return;

        /*
        ==========================================
        VC GUARD MEMORY
        ==========================================
        */

        if (!client.vcGuardChannels) {
            client.vcGuardChannels =
                new Set();
        }

        if (!client.vcGuardAllowed) {
            client.vcGuardAllowed =
                new Map();
        }

        const voiceChannel =
            member.voice?.channel;

        const isOwner =
            client.owners?.includes(
                user.id
            );

        /*
        ==========================================
        HELPERS
        ==========================================
        */

        const getTarget = async (arg) => {

            if (!arg) return null;

            const id =
                arg.replace(
                    /[<@!>]/g,
                    ''
                );

            let target =
                await guild.members
                    .fetch(id)
                    .catch(() => null);

            if (!target) {

                const search =
                    arg.toLowerCase();

                target =
                    guild.members.cache.find(
                        m =>
                            m.user.username
                                .toLowerCase() === search ||

                            m.displayName
                                .toLowerCase() === search ||

                            m.user.tag
                                ?.toLowerCase() === search
                    );
            }

            return target || null;
        };

        const getChannel = async (arg) => {

            if (!arg) return null;

            const id =
                arg.replace(
                    /[<#>]/g,
                    ''
                );

            let channel =
                guild.channels.cache.get(id);

            if (!channel) {

                const search =
                    arg.toLowerCase();

                channel =
                    guild.channels.cache.find(
                        c =>
                            c.name
                                .toLowerCase() === search &&
                            (
                                c.type ===
                                    ChannelType.GuildVoice ||

                                c.type ===
                                    ChannelType.GuildStageVoice
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
                flags:
                    MessageFlags.IsComponentsV2
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
                flags:
                    MessageFlags.IsComponentsV2
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
                aliases.toLowerCase() !==
                    'none'
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
                flags:
                    MessageFlags.IsComponentsV2
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

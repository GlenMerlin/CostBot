import { Message, Client, GuildMember } from 'discord.js';
import { parseMemberMention } from '../utils/parse';

export default {
    name: 'user-info',
    description: 'Display info about the mentioned user or yourself.',
    aliases: ['whois', 'user', 'ui'],
    permissions: ['EMBED_LINKS'],
    cooldown: 5,
    do: async (message: Message, _client: Client, args: string[], Discord: typeof import('discord.js')) => {
        const member: GuildMember =
            parseMemberMention(args[0], message.guild) || message.guild.members.cache.get(args[0]) || message.member;

        const embed = new Discord.MessageEmbed()
            .setColor(member.displayHexColor)
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ format: 'png', dynamic: true }))
            .setDescription(`User mention: ${member}\nUser ID: \`${member.id}\``)
            .setThumbnail(member.user.displayAvatarURL({ format: 'png', dynamic: true }))
            .addFields(
                { name: 'Nickname', value: member.displayName, inline: true },
                { name: 'User Status', value: member.presence.status, inline: true },
                { name: 'Bot', value: member.user.bot ? 'Definitely' : 'Most likely not', inline: true },
                {
                    name: 'Avatar URL',
                    value: `[Click here](${member.user.displayAvatarURL({ format: 'png', dynamic: true })})`,
                    inline: true,
                },
                { name: 'Joined Server', value: member.joinedAt },
                { name: 'Joined Discord', value: member.user.createdAt, inline: true },
            )
            .setTimestamp()
            .setFooter(
                `Requested by ${message.author.tag}`,
                message.author.displayAvatarURL({ format: 'png', dynamic: true }),
            );

        message.channel.send(embed);
    },
};

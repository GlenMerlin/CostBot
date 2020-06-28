const { prefix, botAdmin, botOwner } = require('../config.json');

module.exports = async (Discord, client, message) => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
	|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.disabled === true) {
		return message.channel.send(':warning: This command has been temporarily disabled.');
	}
	if (command.ownerOnly && (botOwner.includes(message.author.id) !== true
	|| command.adminOnly && (botAdmin.includes(message.author.id) !== true))) {
		return message.reply('You cannot use this command!');
	}

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply(':x: I can\'t execute this command inside DMs!');
	}

	if (command.permissions && message.channel.type === 'text'
	&& !message.guild.me.hasPermission(command.permissions, { checkAdmin: true })) {
		return message.channel.send(`:x: Sorry, I need the \`${command.permissions}\` permission(s) in order to execute this command.`);
	}

	if (command.args && !args.length) {
		let reply = `:warning: You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}
		return message.channel.send(reply);
	}

	if (!client.cooldowns.has(command.name)) {
		client.cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = client.cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			const sentMessage = await message.reply(`please wait ${timeLeft.toFixed(1)} second(s) before using \`${command.name}\` again.`);
			return sentMessage.delete({ timeout: 3000 });
		}
	} timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
	try {
		command.do(message, client, args, Discord);
	}
	catch (error) {
		console.error(error);
		message.reply(`I encountered an error while trying to execute this command: \n\`\`\`${error.message}\`\`\``);
	}
};
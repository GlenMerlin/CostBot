module.exports = {
	name: 'command-reload',
	description: 'Reloads a command.',
	ownerOnly: true,
	args: true,
	aliases: ['cmdr'],
	usage: '[command name]',
	do: async (message, client, args) => {
		const commandName = args[0].toLowerCase();
		const command = client.commands.get(commandName)
			|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

		if (!command) {
			return message.channel.send(`:x: There is no command with name or alias \`${commandName}\`!`);
		}

		delete require.cache[require.resolve(`./${command.name}.js`)];

		try {
			const newCommand = require(`./${command.name}.js`);
			client.commands.set(newCommand.name, newCommand);
			message.channel.send(`:white_check_mark: Command \`${command.name}\` was reloaded!`);
		}
		catch (error) {
			console.log(error);
			message.channel.send(`:x: There was an error while reloading command \`${command.name}\`:\n\`\`\`js \n ${error.message}\`\`\``);
		}
	},
};
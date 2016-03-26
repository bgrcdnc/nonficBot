//Logon
//{
process.stdout.write('\033c');
//}

//Variables
//{
var jsonFolder = "./json/",
	alias = {
	"out": "logout",
	"testing": "test"
	};
//}

//Require
//{
try {
	var Discord = require("discord.js");
} catch (e){
	console.log("Please run npm install and ensure it passes with no errors!");
	process.exit();
}

// Get authentication data
try {
	var AuthDetails = require(jsonFolder + "auth.json");
} catch (e){
	console.log("Please create an auth.json like auth.json.example with at least an email and password.");
	process.exit();
}

try{
	Permissions = require(jsonFolder + "permissions.json");
} catch(e) {
	var Permissions = {};
}

try{
	songs = require(jsonFolder + "songs.json");
} catch(e) {
	var songs = {};
}

//load config data
var Config = {};
try{
	Config = require(jsonFolder + "config.json");
} catch(e){ //no config file, use defaults
	Config.debug = false;
	Config.respondToInvalid = false;
	Config.pub = false;
}
//}

//Functions
//{
function updateJSON(fnjson, fjson) {
    require("fs").writeFile(jsonFolder + fnjson,JSON.stringify(fjson,null,2), null);
}
function updateConfig() {
	updateJSON("config.json", Config);
}
function updateSongs() {
	updateJSON("songs.json", songs);
}
function updateAuth() {
	updateJSON("auth.json", AuthDetails);
}
function checkPermission(id, permission){
	try {
		var allowed = false;
		try{
			if(Permissions[id].hasOwnProperty(permission)){
				allowed = Permissions[id][permission] == true;
			}
		} catch(e){}
		return allowed;
	} catch(e){}
	return false;
}
function isset(arg) {
	return (typeof arg == 'undefined' ? false : true);
}

function sendMes(msg, mes, opt, call) {
	if(typeof msg === undefined) {
		console.log("Error in sendMes: msg = " + msg);
		return;
	}
	if(typeof mes === undefined) {
		mes = null;
	}
	if(typeof opt === undefined) {
		opt = null;
	}
	if(typeof call === undefined) {
		call = null;
	}
	if(msg.sender.id == bot.user.id) {
		bot.updateMessage(msg, "**Bot** > " + mes, opt, call);
	} else {
		bot.sendMessage(msg.channel, "**Bot** > " + mes, opt, call);
	}
}
function deleteMes(msg, opt, call) {
	if(typeof opt === undefined) {
		opt = null;
	}
	if(typeof call === undefined) {
		call = null;
	}

	if(msg.sender.id == bot.user.id) {
		bot.deleteMessage(msg, opt, call);
	}
}
function sndMes(msg, content, time, opt, call) {
	if(typeof time === undefined || !time) {
		time = 1000;
	}
	if(typeof opt === undefined) {
		opt = null;
	}
	if(typeof call === undefined) {
		call = null;
	}
	sendMes(msg, content, opt, function() {
		setTimeout(function() {
			deleteMes(msg, opt, call);
		}, time);
	});
}
Date.prototype.addHours = function(h) {
   this.setTime(this.getTime() + (h*60*60*1000));
   return this;
};
Date.prototype.addMinutes = function(m) {
   this.setTime(this.getTime() + (m*60*1000));
   return this;
};
//}

//Commands
//{
var commands = {
	"myid": {
		description: "kişinin kendi id'sini gösterir",
		process: function(bot,msg){ sendMes(msg, msg.sender + " kullanıcısının id'si " + msg.author.id);}
	},
	"channelid": {
		description: "ismi verilen kanalın id'sini gösterir",
		process: function(bot,msg,suffix) {
			if(suffix) {
				var mention = false;
				if(suffix.startsWith('<#')) {
					suffix = suffix.replace("<#","");
                    suffix = suffix.replace(">","");
					mention = true;
				}
				if(mention) {
					var ch = msg.channel.server.channels.get("id", suffix);
					sendMes(msg, ch + " kanalının id'si " + ch.id);
				} else {
					var channels = msg.channel.server.channels.getAll("name", suffix);
					if(channels.length == 1){
						sendMes(msg, channels[0] + " kanalının id'si " + channels[0].id);
					} else if(channels.length > 1){
						var response = "birden fazla kanal bulundu:";
						for(var i=0;i<channels.length;i++){
							var ch = channels[i];
							response += "\r\n" + ch + " kanalının id'si " + ch.id;
						}
						sendMes(msg,response);
					} else {
						sendMes(msg, suffix + " adı ile hiç kanal bulunamadı.");
					}
				}
			} else {
				sendMes(msg, msg.channel + " kanalının id'si " + msg.channel.id);
			}
		}
	},
    "serverid": {
		description:"server'ın id'sini gösterir",
		process: function(bot,msg,suffix) {
            sendMes(msg, msg.channel.server + " server'ının id'si " + msg.channel.server.id);
		}
	},
	"userid": {
		description: "ismi verilen kişinin id'sini gösterir",
		process: function(bot,msg,suffix) {
			if(suffix) {
				var mention = false;
				if(suffix.startsWith('<@')) {
					suffix = suffix.replace("<@","");
                    suffix = suffix.replace(">","");
					mention = true;
				}
				if(mention) {
					var u = bot.users.get("id", suffix);
					sendMes(msg, u.name + " kullanıcısının id'si " + u.id);
				} else {
					var users = msg.channel.server.members.getAll("username", suffix);
					if(users.length == 1){
						sendMes(msg, users[0].name + " kullanıcısının id'si " + users[0].id);
					} else if(users.length > 1){
						var response = "birden fazla kullanıcı bulundu:";
						for(var i=0;i<users.length;i++){
							var user = users[i];
							response += "\r\n" + user.name + " kullanıcısının id'si " + user.id;
						}
						sendMes(msg,response);
					} else {
						sendMes(msg, suffix + " adı ile hiç kullanıcı bulunamadı.");
					}
				}
			} else {
				sendMes(msg, msg.author.name + " kullanıcısının id'si " + msg.author.id);
			}
		}
	},
	"test": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			if(checkPermission(msg.sender.id, "nonfic")) {
				sndMes(msg, "testing... testing...");
			}
		}
	},
	"ping": {
		description: "eğer bot açık ise kullanıcıya geri cevap verir",
		process: function(bot,msg,suffix) {
			bot.sendMessage(msg.channel, "**Bot** > ping - pong!", (e, sentMsg) => { bot.updateMessage(sentMsg,"**Bot** > ping - pong! (" + (sentMsg.timestamp - msg.timestamp) + "ms)") });
			deleteMes(msg);
		}
	},
	"pong!": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			sndMes(msg, msg.sender + ", gotcha!");
		}
	},
	"pub": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			if(checkPermission(msg.sender.id,"nonfic")){
				Config.pub = !Config.pub;
				updateConfig();
				if(Config.pub) {
					sndMes(msg, "Bot durumu: public");
				} else {
					sndMes(msg, "Bot durumu: kısıtlı");
				}
			}
		}
	},
	"pubstat": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			if(Config.pub) {
				sndMes(msg, "Bot durumu: public");
			} else {
				sndMes(msg, "Bot durumu: kısıtlı");
			}
		}
	},
	"setgame": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			try {
				if(checkPermission(msg.sender.id, "nonfic")) {
					bot.setPlayingGame(suffix);
					sndMes(msg, bot.user.name + " \"" + suffix + "\" oynuyor.", 500);
				}
			} catch(e) {
				console.log("Error at setgame: " + e);
			}
		}
	},
	"getgame": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			try {
				if(checkPermission(msg.sender.id, "nonfic")) {
					var user;
					if(suffix.startsWith('<@') && suffix.indexOf('>') > -1) {
						suffix = suffix.substring(suffix.indexOf('<@')+2, suffix.indexOf('>'));
						user = bot.users.get("id", suffix);
					} else if(suffix) {
						user = bot.users.get("name", suffix);
					} else {
						user = bot.users.get("id","134987945827368960");
					}
					if(user.game != undefined) {
						sendMes(msg, user.name + " \"" + user.game.name + "\" oynuyor.");
					} else {
						sendMes(msg, user.name + " oyun oynamıyor.");
					}
				}
			} catch(e) {
				console.log("Error at getgame: " + e);
			}
		}
	},
	"logout": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			if(checkPermission(msg.sender.id, "nonfic")){
				sndMes(msg, "Güle güle!", 1000, false, function() {
					console.log("\r\nShuting down by the command of " + msg.sender.name);
					process.exit(0);
				});
			}
		}
	},
	"osu": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			if(checkPermission(msg.sender.id, "nonfic")){
				bot.sendMessage(msg.channel, "!osu nonfiction178");
				deleteMes(msg);
			}
		}
	},
	"warwick": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			if(checkPermission(msg.sender.id, "nonfic")){
				bot.sendMessage(msg.channel, "!who dabılyuardabılyuiçk");
				deleteMes(msg);
			}
		}
	},
	"s": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			try {
				if(checkPermission(msg.sender.id, "nonfic")) {
					if(suffix.startsWith("ekle")) {
						var args = suffix.split(' ');
						if(args.length < 3) {
							return;
						}
						var cmd = args.shift();
						var songID = args.shift();
						var songName = args.join(' ');
						songs[songName] = songID;
						updateSongs();
						sndMes(msg, "\"" + songName + "\" şarkısı eklendi!");
					} else if(suffix.startsWith("sil")) {
						var args = suffix.split(' ');
						if(args.length < 2) {
							return;
						}
						var cmd = args.shift();
						var songName = args.join(' ');
						delete songs[songName];
						updateSongs();
						sndMes(msg, "\"" + songName + "\" şarkısı silindi!");
					} else {
						if(songs.hasOwnProperty(suffix)) {
							sndMes(msg, "\"" + suffix + "\" şarkısı çalınıyor...");
							bot.sendMessage(msg.channel, ".çal " + songs[suffix]);
						}
					}
				}
			} catch(e) {
				console.log("Error at s: " + e);
			}
		}
	}
};
//}

//Bot Events
//{
var bot = new Discord.Client();
bot.on("ready", function () {
	console.log("Bot Service Initialized. Serving in " + bot.channels.length + " channels.");
	bot.setStatusIdle();
	//load_plugins();
});
bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error

});
bot.on("message", function (msg) {
	if(!bot.servers.get("id", "134666472864743424").members.has(msg.sender)) {
		return;
	}
	if(!(checkPermission(msg.sender.id, "nonfic") || checkPermission(msg.sender.id,"bot") || Config.pub)) {
		return;
	}
	//check if message is a command
	if(msg.content[0] === '%' || msg.content.indexOf(bot.user.mention()) == 0){
		var cmdTxt = msg.content.split(" ")[0].substring(1);
        var suffix = msg.content.substring(cmdTxt.length+2);//add one for the ! and one for the space
        if(msg.content.indexOf(bot.user.mention()) == 0){
			try {
				cmdTxt = msg.content.split(" ")[1];
				suffix = msg.content.substring(bot.user.mention().length+cmdTxt.length+2);
			} catch(e){ return; }
        }
		if(alias.hasOwnProperty(cmdTxt))
			cmdTxt = alias[cmdTxt];

		var cmd = commands[cmdTxt];
		if(cmdTxt === "help") {
			console.log("treating \"" + msg.content + "\" from " + msg.author.name + " as command.");
			var texttosend = "\n***Kullanılabilir Komutlar: (Lütfen komutları kullanırken başına ünlem (!) işareti koymayınız)***\n";
			if(suffix) {

			} else {

				for(var c in commands) {
					var info = "**%" + c;
					var usage = commands[c].usage;
					var hidden = commands[c].hidden;
					var disabled = commands[c].disabled;
					if(hidden || disabled) {
						continue;
					}
					if(usage){
						info += " " + usage;
					}
					info += "**";
					var description = commands[c].description;
					if(description){
						info += " - " + description;
					}
					texttosend += info + "\r\n";
				}
			}
			bot.sendMessage(msg.author,texttosend);
			deleteMes(msg);
        } else if(cmd) {
			try{
				if(cmd.disabled) return;
				console.log("treating \"" + msg.content + "\" from " + msg.author.name + " as command");
				cmd.process(bot,msg,suffix);
			} catch(e){
				if(Config.debug){
					sendMes(msg, "Komut " + cmdTxt + " hatası :(\n" + e.stack);
				}
			}
		} else {
			if(Config.respondToInvalid){
				sendMes(msg, "Bozuk komut: " + cmdTxt);
			}
		}
	} else {
		if(checkPermission(msg.sender.id, "nonfic")) {
        	var edited = false;
			var mes = false;
			var name = "Eren";
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf(name) > -1) {
					mes = mes.replace(name, '<@111476801762537472>');
					if(!edited) edited = true;
				}
				console.log("fixing " + name + "...");
			}
			name = "Yiğit";
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf(name) > -1) {
					mes = mes.replace(name, '<@90076279646212096>');
					if(!edited) edited = true;
				}
				console.log("fixing " + name + "...");
			}
			name = "Storm";
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf(name) > -1) {
					mes = mes.replace(name, '<@142672240494772224>');
					if(!edited) edited = true;
				}
				console.log("fixing " + name + "...");
			}
			name = "Yücel";
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf(name) > -1) {
					mes = mes.replace(name, '<@89563416406020096>');
					if(!edited) edited = true;
				}
				console.log("fixing " + name + "...");
			}
			name = "Apollon";
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf(name) > -1) {
					mes = mes.replace(name, '<@134672885435334656>');
					if(!edited) edited = true;
				}
				console.log("fixing " + name + "...");
			}
			name = "Genco";
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf(name) > -1) {
					mes = mes.replace(name, '<@92944306171572224>');
					if(!edited) edited = true;
				}
				console.log("fixing " + name + "...");
			}
			name = "Kappa"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(msg.content === name)
					deleteMes(msg);
				bot.sendFile(msg.channel, "./pics/kappa.png", "kappa.png");
				console.log("sending " + name + "...");
			}
			name = "FeelsBadMan"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(msg.content === name)
					deleteMes(msg);
				bot.sendFile(msg.channel, "./pics/feelsbadman.png", "feelsbadman.png");
				console.log("sending " + name + "...");
			}
			name = "FeelsGoodMan"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(msg.content === name)
					deleteMes(msg);
				bot.sendFile(msg.channel, "./pics/feelsgoodman.png", "feelsgoodman.png");
				console.log("sending " + name + "...");
			}
			name = "GabeN"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(msg.content === name)
					deleteMes(msg);
				bot.sendFile(msg.channel, "./pics/gaben.png", "gaben.png");
				console.log("sending " + name + "...");
			}
			name = "OhMyGoodness"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(msg.content === name)
					deleteMes(msg);
				bot.sendFile(msg.channel, "./pics/ohmygoodness.png", "ohmygoodness.png");
				console.log("sending " + name + "...");
			}
			name = "PokerFace"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(msg.content === name)
					deleteMes(msg);
				bot.sendFile(msg.channel, "./pics/pokerface.png", "pokerface.png");
				console.log("sending " + name + "...");
			}
			name = "RageFace"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(msg.content === name)
					deleteMes(msg);
				bot.sendFile(msg.channel, "./pics/RageFace.png", "RageFace.png");
				console.log("sending " + name + "...");
			}
			name = "D:"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(msg.content === name)
					deleteMes(msg);
				bot.sendFile(msg.channel, "./pics/d.png", "d.png");
				console.log("sending " + name + "...");
			}
			name = "DansGame"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(msg.content === name)
					deleteMes(msg);
				bot.sendFile(msg.channel, "./pics/dansgame.png", "dansgame.png");
				console.log("sending " + name + "...");
			}
			name = "BibleThump"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				if(msg.content === name)
					deleteMes(msg);
				bot.sendFile(msg.channel, "./pics/biblethump.png", "biblethump.png");
				console.log("sending " + name + "...");
			}
			name = "lennyface"
			if(msg.content.indexOf(name) > -1 && msg.content[0] != '!') {
				var text = msg.content;
				while(text.indexOf(name) > -1) {
					text = text.replace("lennyface", " ( ͡° ͜ʖ ͡°)");
				}
				bot.updateMessage(msg, text);
				console.log("sending " + name + "...");
			}
			if(edited) {
				deleteMes(msg);
				bot.sendMessage(msg.channel, mes);
			}
		}

        /*if(msg.author == bot.user) {
            return;
        }*/

        /*if (msg.author != bot.user && msg.isMentioned(bot.user)) {
                sendMes(msg,msg.author + ", you called?");
        }*/
    }
});
bot.on("presence", function(user,status,gameId) {});

if(isset(AuthDetails.logtoken)) {
    bot.loginWithToken(AuthDetails.logtoken, function(err,token) {if(err) {console.log(err);}});
} else {
    bot.login(AuthDetails.email, AuthDetails.password, function(error,token) {
        try {
            if(isset(token)) {
                AuthDetails["logtoken"] = token;
                updateAuth();
            }
        } catch(e) {

        }
    });
}
//}

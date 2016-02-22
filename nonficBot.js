//Logon
//{
process.stdout.write('\033c');
//}

//Variables
//{
var nickname = "nonfic",
	parakasTimeout = null,
	jsonFolder = "./json/",
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
function conmes(out, nl) {
	var messg = " * " + out;
	if(isset(nl) && nl)
		messg+="\r\n";
	console.log(messg);
}
function sendMes(msg, mes, opt, call) {
	if(typeof msg === undefined) {
		conmes("Error in sendMes: msg = " + msg);
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
    var name = bot.user.name;
	if(msg.sender.id == bot.user.id) {
		bot.updateMessage(msg, "**" + name + "Bot** > " + mes, opt, call);
	} else {
		bot.sendMessage(msg.channel, "**" + name + "Bot** > " + mes, opt, call);
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
function slotChat(type, amount, time) {
	var date = new Date();
	date.addMinutes(time / 60);
	date.addHours(2);
	var user = bot.channels.get("id", "144215812553703425");
	bot.sendMessage(user, "sıradaki: " + date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds());
	if(type == 0) {
		bot.sendMessage(user, "!maaş");
	} else if(type == 1) {
		bot.sendMessage(user, "!slot " + amount);
	}
	parakasTimeout = setTimeout(function() {
		slotChat(type, amount, time);
	}, time * 1000);
}
function clearParaKas() {
	clearTimeout(parakasTimeout);
	parakasTimeout = null;
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
			sendMes(msg, "ping - pong!");
		}
	},
	"pong!": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			sndMes(msg, msg.sender + ", gotcha!");
		}
	},
	"ş": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			if(Config.botMode) {
				sndMes(msg, "Bot modu: aktif");
			} else {
				sndMes(msg, "Bot modu: kısıtlı");
			}
		}
	},
	"t": {
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
	"ts": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			if(Config.pub) {
				sndMes(msg, "Bot durumu: public");
			} else {
				sndMes(msg, "Bot durumu: kısıtlı");
			}
		}
	},
	"parakas": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			try {
				if(checkPermission(msg.sender.id, "nonfic")) {
					if(parakasTimeout) {
						clearParaKas();
					}
					var args = suffix.split(' ');
					var type = 0;
					var amount = "maaş";
					var time = 300;
					if(suffix) {
						if(args.length == 3) {
							type = parseInt(args.shift(), 10);
							amount = args.shift();
							time = parseInt(args.join(' '), 10);
						}
					}
					slotChat(type, amount, time);
					deleteMes(msg);
				}
			} catch(e) {
				conmes("Error at parakas: " + e);
			}
		}
	},
	"parakasma": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			try {
				if(checkPermission(msg.sender.id, "nonfic")) {
					clearParaKas();
					sndMes(msg, "Başarıyla iptal edildi.");
				}
			} catch(e) {
				conmes("Error at parakasma: " + e);
			}
		}
	},
	"setgame": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			try {
				if(checkPermission(msg.sender.id, "nonfic")) {
					bot.setPlayingGame(suffix);
					sndMes(msg, "nonfic \"" + suffix + "\" oynuyor.", 500);
				}
			} catch(e) {
				conmes("Error at setgame: " + e);
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
					if(user.game) {
						sendMes(msg, user.name + " \"" + user.game.name + "\" oynuyor.");
					} else {
						sendMes(msg, user.name + " oyun oynamıyor.");
					}
				}
			} catch(e) {
				conmes("Error at getgame: " + e);
			}
		}
	},
	"logout": {
		hidden:"1",
		process: function(bot,msg,suffix) {
			if(checkPermission(msg.sender.id, "nonfic")){
				sndMes(msg, "Güle güle!", 1000, false, function() {
					console.log("\r\nExiting by the command of " + msg.sender.name);
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
						deleteMes(msg);
					} else if(suffix.startsWith("sil")) {
						var args = suffix.split(' ');
						if(args.length < 2) {
							return;
						}
						var cmd = args.shift();
						var songName = args.join(' ');
						delete songs[songName];
						updateSongs();
						deleteMes(msg);
					} else {
						if(songs.hasOwnProperty(suffix)) {
							deleteMes(msg);
							bot.sendMessage(msg.channel, ".çal " + songs[suffix]);
						}
					}
				}
			} catch(e) {
				conmes("Error at s: " + e);
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
	//load_plugins();
});
bot.on("disconnected", function () {
	console.log("Disconnected!");
	process.exit(1); //exit node.js with an error

});
bot.on("message", function (msg) {
	if(msg.content.indexOf("%info") == 0) {
        var name = bot.user.name;
		sendMes(msg, name + " tarafından yapılmış bir Discord botuyum, " + name + "'in hesabına bağlıyım ve sadece " + name + "'in komutlarına cevap veriyorum.");
	}
	if(checkPermission(msg.sender.id, "nonfic") || checkPermission(msg.sender.id,"bot") || Config.pub) {
	} else {
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
			if(msg.content.indexOf('Eren') > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf('Eren') > -1) {
					if(mes.indexOf('Erene') > -1) {
						mes = mes.replace('Erene', "<@111476801762537472>'a");
					}
					mes = mes.replace('Eren', '<@111476801762537472>');
					if(!edited) edited = true;
				}
				conmes("fixing eren...");
			}
			if(msg.content.indexOf('yiğit') > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf('yiğit') > -1) {
					if(mes.indexOf('yiğite') > -1) {
						mes = mes.replace('yiğite', "<@90076279646212096>'e");
					}
					mes = mes.replace('yiğit', '<@90076279646212096>');
					if(!edited) edited = true;
				}
				conmes("fixing yiğit...");
			}
			if(msg.content.indexOf('storm') > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf('storm') > -1) {
					mes = mes.replace('storm', '<@142672240494772224>');
					if(!edited) edited = true;
				}
				conmes("fixing storm...");
			}
			if(msg.content.indexOf('yücel') > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf('yücel') > -1) {
					mes = mes.replace('yücel', '<@89563416406020096>');
					if(!edited) edited = true;
				}
				conmes("fixing yücel...");
			}
			if(msg.content.indexOf('shululu') > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf('shululu') > -1) {
					mes = mes.replace('shululu', '<@135123411792953344>');
					if(!edited) edited = true;
				}
				conmes("fixing shululu...");
			}
			if(msg.content.indexOf('apollon') > -1 && msg.content[0] != '!') {
				if(!mes) mes = msg.content;
				while(mes.indexOf('apollon') > -1) {
					mes = mes.replace('apollon', '<@134672885435334656>');
					if(!edited) edited = true;
				}
				conmes("fixing apollon...");
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
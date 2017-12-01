var record = require('node-record-lpcm16');
var Speaker = require('speaker');
var GoogleAssistant = require('google-assistant');
var path = '/home/joe/scripts/assistant/';

var config = {
	auth: {
		keyFilePath: path + 'client_secret.json',
		savedTokensPath: path + 'tokens.js'
	},
	audio: {
		encodingIn: 'LINEAR16',
		sampleRateOut: 24000
	}
};

function startConversation(conversation) {
	console.log('Say something!');

	var spokenResponseLength = 0;
	var speakerOpenTime, speakerTimer;
	var play_response = false;

	conversation.on('audio-data', (data) => {
		var now = new Date().getTime();
		if (play_response) speaker.write(data);
	
		spokenResponseLength += data.length;
		var audioTime = spokenResponseLength / (config.audio.sampleRateOut * 16 / 8) * 1000;
		clearTimeout(speakerTimer);
		speakerTimer = setTimeout(() => {
			speaker.end();
		}, audioTime - Math.max(0, now - speakerOpenTime));
	});
	conversation.on('end-of-utterance', () => {
		record.stop();
	});
	conversation.on('transcription', (text) => {
		console.log('Transcription:', text);
		if (check_trans(text, 'ssh to')) {
			play_response = false;
			console.log('ssh to running');
		} else if (check_trans(text, 'command test')) {
			play_response = false;
			console.log('custom command test');	
		} else {
			play_response = true;
		}
	});
	conversation.on('ended', (error, continueConversation) => {
		if (error) console.log('Conversation Ended Error:', error);
		else if (continueConversation) assistant.start();
		else console.log('Conversation Complete');
	});
	conversation.on('error', error => console.log('Error:', error));

	var mic = record.start({ threshold: 0 });
	mic.on('data', data => conversation.write(data));

	var speaker = new Speaker({
		channels: 1,
		sampleRate: config.audio.sampleRateOut
	});
	speaker.on('open', () => {
		console.log('Assistant speaking');
		speakerOpenTime = new Date().getTime();
	});
	speaker.on('close', () => {
		console.log('Assistant Finished Speaking');
		conversation.end();
	});
}

function check_trans(trans, what) {
	return (trans.toLowerCase().replace(/[^0-9a-z\s]/g, '').indexOf(what) !== -1);
}

var assistant;
function run_assistant() {
	assistant = new GoogleAssistant(config);
	assistant.on('ready', () => assistant.start());
	assistant.on('started', startConversation);
	assistant.on('error', (error) => {
		console.log('Assistant Error:', error);
	});
}

var growl = require('growl');
var iohook = require('iohook');
iohook.on('keydown', (e) => {
	if (e.keycode == 62) {
		console.log('Caught <F4>');
		growl('How can I help?', { image: path + 'logo.png' });
		run_assistant();
	}
});
iohook.start();

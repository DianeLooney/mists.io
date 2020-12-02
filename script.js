var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

const c1 = ['flower', 'leaf'];
const c2 = ['yes', 'no'];
const c3 = ['color', 'outline'];

const validWords = [...c1, ...c2, ...c3];
const grammar = `#JSGF V1.0; grammar colors; public <color> = (${c1.join('|')}) (${c2.join('|')}) (${c3.join('|')});`;

var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.continuous = false;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 20;

var diagnostic = document.querySelector('.output');
var bg = document.querySelector('html');
var hints = document.querySelector('.hints');

document.body.onclick = function () {
    recognition.start();
}

recognition.onresult = function (event) {
    let alternatives = event.results[0];
    alternatives = Array.from(alternatives)
    parseAlternatives(alternatives);

    diagnostic.innerHtml = clues.join('<br />');

    setTimeout(() => recognition.start(), 300);
}

recognition.onspeechend = function () {
    recognition.stop();
}

recognition.onnomatch = function (event) {
    console.log('no match');
}

recognition.onerror = function (event) {
    diagnostic.textContent = 'Error occurred in recognition: ' + event.error;
}

var synth = window.speechSynthesis;
function parseAlternatives(alternatives) {
    console.log(alternatives);
    const eligible = alternatives.filter(alternative => eligibleAlternative(alternative.transcript.toLowerCase()));

    if (!eligible.length) {
        synth.speak(new SpeechSynthesisUtterance('repeat'));
        return;
    }
    
    const clue = eligible[0];
    clues.push(clue.transcript.toLowerCase().split(' '))
    console.log(`Confidence: ${clue.confidence}`);
    console.log(clue.transcript.toLowerCase().split(' '));

    if (clues.length != 4) {
        synth.speak(new SpeechSynthesisUtterance('next'));
        return;
    }
    let theseClues = clues;
    clues = [];
    
    console.log({theseClues});
    console.log(theseClues.flat(1));
    const tallied = theseClues.flat(1).reduce((acc, word) => ({ ...acc, [word]: (acc[word] || 0) + 1}), {});
    console.log(tallied);
    let match
    for(let [key, val] of Object.entries(tallied)) {
        if (key === 'entrance') continue;
        if (val === 1) {
            if (match !== undefined) {
                synth.speak(new SpeechSynthesisUtterance('error, multiple matches'));
                console.log(match, key)
                return;
            }
            match = key;
        }
        console.log(key, val);
    }
    if (match === undefined) {
        synth.speak(new SpeechSynthesisUtterance('error, no match'));
        return;
    }
    const correct = theseClues.find(x => x.includes(match))
    synth.speak(new SpeechSynthesisUtterance(`${match}, ${correct}`));
}

function eligibleAlternative(text) {
    const words = text.split(' ');
    const allValidWords = words.every(word => validWords.includes(word));
    const c1Match = words.some(word => c1.includes(word));
    const c2Match = words.some(word => c2.includes(word));
    const c3Match = words.some(word => c3.includes(word));
    const correctLength = words.length === 3;// || words.length === 4 && words.includes('entrance');

    return allValidWords && c1Match && c2Match && c3Match && correctLength;
}

let clues = [];


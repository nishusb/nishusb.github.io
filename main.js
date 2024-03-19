import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

const notes = ["C", "D", "E", "F", "G", "A", "B"];

const scales = {
    major: [2, 2, 1, 2, 2, 2, 1],
    dorian: [2, 1, 2, 2, 2, 1, 2],
    phrygian: [1, 2, 2, 2, 1, 2, 2],
    lydian: [2, 2, 2, 1, 2, 2, 1],
    mixolydian: [2, 2, 1, 2, 2, 1, 2],
    aeolian: [2, 1, 2, 2, 1, 2, 2],
    minor: [2, 1, 2, 2, 1, 2, 2],
    locrian: [1, 2, 2, 1, 2, 2, 2],
}

const chordTypes = [
    {
        name: 'major', changes: []
    },
    {
        name: 'minor', changes: [
            { interval: 3, mod: -1 },
            { interval: 7, mod: -1 },
        ]
    },
    {
        name: 'augmented',
        changes: [
            { interval: 5, mod: 1 }
        ],
        compatibleIntervals: ['3']
    },
    {
        name: 'diminished', changes: [
            { interval: 3, mod: -1 },
            { interval: 5, mod: -1 },
        ],
        compatibleIntervals: ['3']
    },
    {
        name: 'minor ♭6', changes: [
            { interval: 3, mod: -1 },
            { interval: 6, mod: -1 },
        ],
        compatibleIntervals: ['6']
    },
    {
        name: 'dominant', changes: [
            { interval: 7, mod: -1 },
        ],
        compatibleIntervals: ['7', '9']
    },
];

class Note {
    constructor(name) {
        this.name = name;
        this.mod = 0;
        this.interval = 0;
        return this;
    }

    setInterval(i) {
        this.interval = i;
        return this;
    }

    modifier(mod) {
        this.mod = mod;
        return this;
    }

    modify(mod) {
        this.mod += mod;
        return this;
    }

    sharp() {
        this.mod = 1;
        return this;
    }

    flat() {
        this.mod = -1;
        return this;
    }

    getFullName() {
        const accidentalSymbols = {
            '-2': '𝄫',
            '-1': '♭',
            '0': '',
            '1': '♯',
            '2': '𝄪'
        };

        const accidentalSymbol = accidentalSymbols[this.mod] || '';

        return this.name + accidentalSymbol;
    }
}

function generateScaleFromNote(note, musicalMode = 'major') {
    const startIndex = notes.indexOf(note.name);
    const totalNotes = notes.length;
    const scale = [];

    scale.push(note.setInterval(1));

    let scaleToUse = scales[musicalMode];

    for (let i = 1; i < totalNotes; i++) {
        let currentNote = new Note(notes[(startIndex + i) % totalNotes]).setInterval(i + 1);

        if (scale.length > 0) {
            let expectedJump = scaleToUse[(totalNotes + i - 1) % totalNotes];
            let pureJump = scales.major[(totalNotes + i + startIndex - 1) % totalNotes] - scale[i - 1].mod;

            currentNote.modify(expectedJump - pureJump);
        }

        currentNote
        scale.push(currentNote);
    }

    return scale;
}

createApp({
    data() {
        return {
            notes,
            chordTypes,
            accidentals: [
                {
                    name: "flat",
                    mod: -1
                }, {
                    name: "natural",
                    mod: 0
                }, {
                    name: "sharp",
                    mod: 1
                }],
            extraNotes: [
                { name: '3', intervals: [1, 3, 5] },
                { name: '6', intervals: [1, 3, 5, 6] },
                { name: '7', intervals: [1, 3, 5, 7] },
                { name: '9', intervals: [1, 3, 5, 7, 9] },
            ],
            displayedIntervals: [],
            modes: ['chords', 'scales'],
            musicalModes: ['major', 'minor', 'dorian', 'phrygian', 'lydian', 'mixolydian', 'locrian'],
            selectedMusicalMode: 'major',
            selectedExtraNotes: '3',
            selectedAccidental: 0,
            selectedNote: "C",
            selectedChordType: 'major',
            selectedMode: 'scales',
        }
    },
    methods: {
        selectNote(note) {
            this.selectedNote = note;
            this.selectedAccidental = 0;
        },
        selectAccidental(accidental) {
            this.selectedAccidental = accidental;
        },
        selectChordType(chordType) {
            this.selectedChordType = chordType;
        },
        selectChordIntervals(intervals) {
            this.selectedExtraNotes = intervals;

            let selectedChordType = chordTypes.find((chordType) => (chordType.name === this.selectedChordType));

            if (selectedChordType.compatibleIntervals && !selectedChordType.compatibleIntervals.includes(intervals)) {
                this.selectedChordType = 'major';
            }
        },
        getColorForIndex(index) {
            const hue = (index / this.notes.length) * 360;
            const color = `hsl(${hue}, 20%, 30%)`;
            return color;
        },
        getHoverColorForIndex(index) {
            const hue = (index / this.notes.length) * 360;
            const color = `hsl(${hue}, 60%, 50%)`;
            return color;
        }
    },
    computed: {
        compatibleChordTypes() {
            return this.chordTypes.filter(chordType => chordType.compatibleIntervals === undefined || chordType.compatibleIntervals.includes(this.selectedExtraNotes));
        },
        scale() {
            const scale = generateScaleFromNote(new Note(this.selectedNote).modifier(this.selectedAccidental), this.selectedMode === 'scales' ? this.selectedMusicalMode : undefined);
            return scale;
        },
        displayIntervals() {
            let scaleCopy = this.scale.map(note => new Note(note.name).modify(note.mod).setInterval(note.interval));

            if (this.selectedMode === 'scales') {
                return scaleCopy;
            }

            const chordIntervals = this.extraNotes.find(extra => extra.name === this.selectedExtraNotes)?.intervals;
            const chordType = this.chordTypes.find(type => type.name === this.selectedChordType);

            const chordNotes = chordIntervals.map(interval => {
                let change = chordType.changes.find(change => change.interval === interval)?.mod;
                return scaleCopy[(interval - 1 + 7) % 7].modify(change ?? 0).setInterval(interval);
            });

            return chordNotes;
        },
    }
}).mount('#app');
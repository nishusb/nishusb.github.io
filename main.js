import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js'

const notes = ["C", "D", "E", "F", "G", "A", "B"];

const scales = {
    major: [2, 2, 1, 2, 2, 2, 1],
    minor: [2, 1, 2, 2, 1, 2, 2],
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

function generateScaleFromNote(note) {
    const startIndex = notes.indexOf(note.name);
    const totalNotes = notes.length;
    const scale = [];

    scale.push(note);

    for (let i = 1; i < totalNotes; i++) {
        let currentNote = new Note(notes[(startIndex + i) % totalNotes]);

        if (scale.length > 0) {
            let expectedJump = scales.major[(totalNotes + i - 1) % totalNotes];
            let pureJump = scales.major[(totalNotes + i + startIndex - 1) % totalNotes] - scale[i - 1].mod;

            currentNote.mod = expectedJump - pureJump;
        }

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
            scale: "",
            chord: "",
            selectedExtraNotes: '3',
            selectedAccidental: 0,
            selectedNote: "C",
            selectedChordType: 'major',
        }
    },
    methods: {
        selectNote(note) {
            this.selectedNote = note;
            this.selectedAccidental = 0;
            this.updateInfo();
        },
        updateInfo() {
            const scale = generateScaleFromNote(new Note(this.selectedNote).modifier(this.selectedAccidental));

            // const chordIntervals = [1, 3, 5];
            const chordIntervals = this.extraNotes.find((extra) => (extra.name === this.selectedExtraNotes))?.intervals;
            const chordType = chordTypes.find((chordType) => chordType.name === this.selectedChordType);
            const chordNotes = chordIntervals.map((interval) => {
                let change = chordType.changes.find((change) => (change.interval === interval))?.mod;
                return scale[(interval - 1 + 7) % 7].modify(change ?? 0);
            });

            this.chord = chordNotes.map(note => ` ${note.getFullName()}`).join('');
            this.scale = scale.map(note => ` ${note.getFullName()}`).join('');
        },
        selectAccidental(accidental) {
            this.selectedAccidental = accidental;
            this.updateInfo();
        },
        selectChordType(chordType) {
            this.selectedChordType = chordType;
            this.updateInfo();
        },
        selectChordIntervals(intervals) {
            this.selectedExtraNotes = intervals;

            let selectedChordType = chordTypes.find((chordType) => (chordType.name === this.selectedChordType));

            if (selectedChordType.compatibleIntervals && !selectedChordType.compatibleIntervals.includes(intervals)) {
                this.selectedChordType = 'major';
            }

            this.updateInfo();
        },
        getColorForIndex(index) {
            const hue = (index / this.notes.length) * 360;
            const color = `hsl(${hue}, 30%, 20%)`;
            console.log(color); 
            return color;
        },
        getHoverColorForIndex(index) {
            const hue = (index / this.notes.length) * 360;
            const color = `hsl(${hue}, 60%, 50%)`;
            console.log(color); 
            return color;
        }
    },
    computed: {
        compatibleChordTypes() {
            return this.chordTypes.filter(chordType => chordType.compatibleIntervals === undefined || chordType.compatibleIntervals.includes(this.selectedExtraNotes));
        }
    },
    mounted() {
        this.updateInfo();
    }
}).mount('#app');
//Author: Corentin Guichaoua

// Vue.config.devtools = true
// Vue.config.performance = true


// ============================================================================

// Reload the screen after 2 minutes of inactivity.
let timeout = null;
function restartTimeout() {
  clearTimeout(timeout);
//   timeout = setTimeout(() => window.location.reload(), 1000 * 120); // 2 mins
}
document.addEventListener('touchdown', restartTimeout);
document.addEventListener('mousemove', restartTimeout);
//An additional listener is added upon connecting a Midi Input

// ============================================================================
// Geometry constants and coordinate conversions

const xstep=Math.sqrt(3)/2 //Ratio of horizontal to vertical spacing = height of an equilateral triangle
const baseSize=50 //Base scale: height of a vartical step (in svg coordinates)

// Conversion between tonnetz coordinates and svg coordinates
const logicalToSvgX = node => node.x * xstep * baseSize;
const logicalToSvgY = node => (node.y + node.x/2) * baseSize;
const logicalToSvg = node => ({x:logicalToSvgX(node), y:logicalToSvgY(node)})


// ============================================================================
// Vue components and mixins

var piano; //Variable to hold the virtual piano (built later once JZZ is loaded)
//var midiBus; //Variable to hold the bus for upgoing midiEvents (built once Vue is loaded)
var proto; //Variable to hold the main app Object (built once everything is loaded)



// Global object to store recording and its state
var record = {
    startTime:undefined,
    SMF:undefined,
    recording:false
}

// Wait for libraries to be loaded
fallback.ready(function(){

// Global mixin to add a static field to hold static data to any component
Vue.mixin({
    beforeCreate() {
        const static = this.$options.static
        if (typeof static === 'object') {
            Object.assign(this, static)
        }
    }
})

    // The App's main object, handling global concerns
proto = new Vue({
    el: '#proto',
    components: {
        clockOctave,songLoader,pianoKeyboard,playRecorder,tonnetzView,
        languageSelector,intervalTable,creditScreen,asciiBindings,chordDisplay
    },
    data: {
        // The type of representation for the main window ('tonnetz' or 'chicken')
        type: 'tonnetz',
        // The list of all notes: their name and their status
        notes: Array.from(Array(12),(_x,index) => ({id:index,count:0})),
        // notes: (strings[language] || strings.en).notes.map( function(note_name_local, index) { 
        //     // use text for display and id for CSS styling
        //     return {text: note_name_local, id: strings.en.notes[index], count: 0};
        // }),
        // Synthetiser engine
        synth: JZZ.synth.Tiny(),
        //synth:JZZ.synth.MIDIjs({ 
            //TODO: Use a soundfont from our own server
            //soundfontUrl: "https://raw.githubusercontent.com/mudcube/MIDI.js/master/examples/soundfont/", 
            //instrument: "acoustic_grand_piano" })
                //.or(function(){ proto.loaded(); alert('Cannot load MIDI.js!\n' + this.err()); })
                //.and(function(){ proto.loaded(); }),
        // Azerty keyboard bindings
        ascii: JZZ.input.ASCII({
                Z:'C5', S:'C#5', X:'D5', D:'D#5', C:'E5', V:'F5',
                G:'F#5', B:'G5', H:'Ab5', N:'A5', J:'Bb5', M:'B5'
                }),
        // Should trajectory drawing be active?
        trace: false,
        // The localisation strings
        strings: strings,
        // The picked locale
        language: language || en,

        // scale
        scale: 0
    },
    computed:{
        complementNotes: function(){
            return this.notes.map(note => ({id:note.id, count:note.count?0:1}));
        },
    },
    created: function(){
        //Delay connection of MIDI devices to let JZZ finish its initialisation
        let deviceUpdate=this.deviceUpdate; // This is required to bring deviceUpdate into the lambda's context
        setTimeout(function(){deviceUpdate({inputs:{added:JZZ().info().inputs}})},1000);
        //Add a watcher to connect (and disconnect) new devices to the app
        JZZ().onChange(this.deviceUpdate);
    },
    methods:{
        //Handler for JZZ device change event
        deviceUpdate: function({inputs:{added,removed}}){
            console.log('Updating MIDI devices');
            if(added){
                for(device of added){
                    JZZ().openMidiIn(device.name)
                      .connect(midiBus.midiThru) // Send the keyboard's events to the midi bus which will relay them
                      .connect(restartTimeout); // Reset the page's timeout upon input
                    console.log('Added device: ',device);
                }
            }
            if(removed){
                for(device of removed){
                    JZZ().openMidiIn(device.name).disconnect(midiBus.midiThru);
                    console.log('Removed device: ',device);
                }
            }
            this.resetNotes(); // Connection/Disconnection can cause unbalanced note events
        },
        
        //Handler for Midi events coming from JZZ
        midiHandler: function (midiEvent){
            if(midiEvent.getChannel() !== 9){ // Ignore drums events
                noteIndex = (midiEvent.getNote()+3) %12
                if(midiEvent.isNoteOn()){
                    this.notes[noteIndex].count++;
                }else if(midiEvent.isNoteOff()){
                    if(this.notes[noteIndex].count > 0){
                        this.notes[noteIndex].count--;
                    }else{
                        console.log('Warning: ignored unbalanced noteOff event', midiEvent);
                    }
                }
            }
        },
        resetNotes: function(){
            for (note of this.notes){
                note.count = 0;
            }
        },
        traceToggle: function(){
            this.trace = !this.trace;
        },
        // Handlers for playback events fired from the app
        noteOn: function(pitches,origin){
            //var notes = this.node2Notes(nodes);
            for (var pitch of pitches){
                let event = JZZ.MIDI.noteOn(0,pitch,100);
                event.origin = origin
                midiBus.midiThru.send(event);
            }
        },
        noteOff: function(pitches){
            //var notes = this.node2Notes(nodes);
            for (var pitch of pitches){
                midiBus.midiThru.noteOff(0,pitch,100);
            }
        },
        // Hard reset for the whole page
        reset(option) {
            if(option){
                window.location.search = '?hl='+option;
                console.log(window.location)
            }
            else{
                window.location.reload();
            }
        }
    },
    mounted(){
        //Handle midiBus events
        midiBus.$on('note-on',this.noteOn);
        midiBus.$on('note-off',this.noteOff);

        //Connect the Midi
        midiBus.midiThru.connect(this.synth);
        midiBus.midiThru.connect(this.midiHandler);   
    }
})

}) // fallback.ready

function scaleChanged(target) {
    let scale = (target.value * 7 + 120) % 12;

    for (let i = 0; i < 12; i++) {
        let degree = (i - scale + 120) % 12;
        let majorTriangles = document.getElementsByName("major_" + i);
        for (let j = 0; j < majorTriangles.length; j++) {
            let label = "";
            if (target.value < -100) {
                label = "";
            } else if (degree == 8) {
                label = "♭SM";
            } else if (degree == 3) {
                label = "♭M";
            } else if (degree == 10) {
                label = "♭MD";
            } else if (degree == 5) {
                label = "SD";
            } else if (degree == 0) {
                label = "T";
            } else if (degree == 7) {
                label = "D";
            } else if (degree == 2) {
                label = "S/T";
            } else if (degree == 9) {
                label = "SM";
            } else if (degree == 4) {
                label = "M";
            } else if (degree == 1) {
                label = "Np";
            }
            majorTriangles[j].innerHTML = label;
            if (degree == 0) {
                majorTriangles[j].setAttribute("class", "triangle major_" + i + " bold");
            } else {
                majorTriangles[j].setAttribute("class", "triangle major_" + i);
            }
        }

        let minorTriangles = document.getElementsByName("minor_" + i);
        for (let j = 0; j < minorTriangles.length; j++) {
            let label = "";
            if (target.value < -100) {
                label = "";
            } else if (degree == 8) {
                label = "♭sm";
            } else if (degree == 3) {
                label = "♭m";
            } else if (degree == 10) {
                label = "♭mv";
            } else if (degree == 5) {
                label = "sd";
            } else if (degree == 0) {
                label = "t";
            } else if (degree == 7) {
                label = "v";
            } else if (degree == 2) {
                label = "dor";
            } else if (degree == 9) {
                label = "sm";
            } else if (degree == 4) {
                label = "m";
            }
            minorTriangles[j].innerHTML = label;
            if (degree == 0) {
                minorTriangles[j].setAttribute("class", "triangle minor_" + i + " bold");
            } else {
                minorTriangles[j].setAttribute("class", "triangle minor_" + i);
            }
        }
    }
}


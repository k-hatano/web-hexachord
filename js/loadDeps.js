/* Loads libraries required by the application using fallback
First attempt to retrieve them online, otherwise load local copies */

// Find the script's directory to use paths relative to it and not the html
let scripts= document.getElementsByTagName('script');
let path= scripts[scripts.length-1].src.split('?')[0];      // remove any ?query
let mydir= path.split('/').slice(0, -1).join('/')+'/';  // remove last filename part of path
fallback.config({
    "base": mydir
})

fallback.load({
    //Vue: Main framework for reactive elements
    Vue: [
        'https://cdn.jsdelivr.net/npm/vue/dist/vue.js',
        '../lib/Vue/vue.min.js'
    ],
    //JZZ: Midi library
    JZZ: [
        'https://cdn.jsdelivr.net/npm/jzz',
        '../lib/JZZ/jzz.js'
    ],
    //JZZ.Tiny: Basic Synthetizer
    'JZZ.synth.Tiny': [
        'https://cdn.jsdelivr.net/npm/jzz-synth-tiny',
        '../lib/JZZ/JZZ.synth.Tiny.min.js'
    ],
    //JZZ.Kbd: Keyboard bindings and virtual piano keyboard
    'JZZ.input.Kbd': [
        'https://cdn.jsdelivr.net/npm/jzz-input-kbd',
        '../lib/JZZ/jzz-input-kbd.js'
    ],
    //JZZ.SMF: Standard Midi File support
    'JZZ.MIDI.SMF': [
        'https://cdn.jsdelivr.net/npm/jzz-midi-smf',
        '../lib/JZZ/jzz-midi-smf.js'
    ],
    TweenLite: [
        'https://cdnjs.cloudflare.com/ajax/libs/gsap/1.18.0/TweenLite.min.js',
        '../lib/GSAP'
    ],
    //TODO: Use proper submodule structure
    // Tonnetz submodules
    // Small hack: these variables are defined to let fallback know that the module loaded
    'Tonnetz_utils':[
        'utils.js'
    ],
    'Tonnetz_l12n':[
        'l12n.js'
    ],
    'Tonnetz_mixins':[
        'mixins/clickMixins.js'
    ],
    'Tonnetz_trajectory':[
        'mixins/trajectory.js'
    ],
    'Tonnetz_dragZoom':[
        'decorators/dragZoom.js'
    ],
    'Tonnetz_piano':[
        'components/pianoKeyboard.js'
    ],
    'Tonnetz_loader':[
        'components/songLoader.js'
    ],
    'Tonnetz_tonnetzLike':[
        'components/tonnetzLike.js'
    ],
    'Tonnetz_clockOctave':[
        'components/clockOctave.js'
    ],
    'Tonnetz_playRecorder':[
        'components/playRecorder.js'
    ],
    'Tonnetz_midiBus':[
        'midiBus.js'
    ],
    'Tonnetz_tonnetzView':[
        'components/tonnetzView.js'
    ]
},{
    shim:{
        // Wait for JZZ to be loaded before loading its submodules
        'JZZ.synth.Tiny': ['JZZ'],
        'JZZ.input.Kbd': ['JZZ'],
        'JZZ.MIDI.SMF': ['JZZ'],
        'Tonnetz_tonnetzLike': ['Tonnetz_mixins'],
        'Tonnetz_clockOctave': ['Tonnetz_mixins'],
        'Tonnetz_playRecorder': ['Tonnetz_midiBus', 'Tonnetz_loader','Tonnetz_utils'],
        'Tonnetz_midiBus': ['Vue','JZZ'],
        'Tonnetz_tonnetzView': ['Tonnetz_tonnetzLike']
    }
}
)
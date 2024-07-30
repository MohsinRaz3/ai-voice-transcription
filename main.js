const mic_btn = document.querySelector('#mic');
const mic_Icon = document.querySelector('#mIcon');
const playback = document.querySelector('.playback');
mic_Icon.innerHTML ="mic"

mic_btn.addEventListener('click', ToggleMic);

let can_record = false;
let is_recording = false;
let recorder = null;
let chunks = [];


function SetupAudio(){
    console.log("setup audioo");

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia){
        navigator.mediaDevices
        .getUserMedia({
            audio: true
        })
        .then(SetupStream)
        .catch(err => {
            console.log(err)
        });
}}
SetupAudio();

function SetupStream(stream){
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => {
        chunks.push(e.data);
    }
    recorder.onstop= async e=> {
        const blob = new Blob(chunks, { type : "audio/ogg; codecs=opus"});
        console.log("audio dataa",blob);
        chunks = [];
        const audioURL = window.URL.createObjectURL(blob);
        playback.src = audioURL;
          // Convert the blob to mp3
          const mp3Blob = await convertToMp3(blob);
          console.log("converted to mp333",mp3Blob);
        // uploadAudio(mp3Blob)
    }
    can_record = true;
}
async function convertToMp3(blob) {
    const { createFFmpeg, fetchFile } = ffmpeg;
    const ffmpeg = createFFmpeg({ log: true });

    await ffmpeg.load();
    ffmpeg.FS('writeFile', 'input.ogg', await fetchFile(blob));
    await ffmpeg.run('-i', 'input.ogg', 'output.mp3');

    const data = ffmpeg.FS('readFile', 'output.mp3');
    const mp3Blob = new Blob([data.buffer], { type: 'audio/mp3' });
    return mp3Blob;
}
function ToggleMic(){
    console.log("is_recording",is_recording)
    console.log("can_record",can_record)
    if (!can_record) return;

    is_recording = !is_recording;

    if(is_recording){
        recorder.start();
        mic_btn.classList.add("is-recording");
        mic_Icon.innerHTML = "pause"
    }else {
        recorder.stop();
        mic_btn.classList.remove("is-recording");
        mic_Icon.innerHTML ="mic"
}
 

}
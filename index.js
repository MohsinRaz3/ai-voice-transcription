
    
    const organization_name = "rockettools";
    const url = `https://api.salad.com/api/public/organizations/${organization_name}/inference-endpoints/transcribe/jobs`;
    const salad_key = "3ab1102d-e4a4-42d8-ab93-5b2b97d3a259";
    const language_code = "en";
    
    // Add your audio links here 
    const list_of_audio_files = "https://github.com/MohsinRaz3/Books/raw/master/mohsin.mp3"
    
    // Placeholder for job_ids
    const list_of_job_ids = [];
    
    const headers = {
        "Salad-Api-Key": salad_key,
        "Content-Type": "application/json",
        "accept": "application/json",
        "Access-Control-Allow-Headers": "*" 
    };
// Function to submit audio files for transcription
async function submitAudioFiles() {
   
    const data = {
        input: {
            url:  list_of_audio_files,
            language_code: language_code,
            word_level_timestamps: true,
            diarization: true,
            srt: true
        }
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
                mode: 'no-cors',
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        const job_id = responseData.id;
        list_of_job_ids.push(job_id);

        // Save job_ids to a file if needed (uncomment the code below)
        const job_id_str = `"${job_id}",`;
        console.log("joooob id", job_id_str);
        // Open a file and write the job_id to it
        //  fs.appendFileSync('queue_test.txt', job_id_str + '\n');
    } catch (error) {
        console.error('Error:', error);
    }
}


// // Execute the function
submitAudioFiles();


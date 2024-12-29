let currentSong = new Audio();
let songs;
let currFolder;

function formatSeconds(seconds) {
    // Ensure the input is a non-negative integer
    seconds = Math.max(0, Math.floor(seconds));

    // Calculate minutes and seconds
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    // Format as MM:SS with leading zeros if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder;
    //ftch of all songs
    let a = await fetch(`/${currFolder}/`);

    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    songs = []


    //get songs name
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${currFolder}/`)[1]);
        }
    }

    //add songs into the playlist
    let songUl = document.querySelector(".songlist").getElementsByTagName("ul")[0];
    songUl.innerHTML = ""
    for (const song of songs) {
        songUl.innerHTML = songUl.innerHTML + `<li>
                            <i class="ri-music-2-line"></i>
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Aaliyan Ustad</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <i class="ri-play-circle-fill" style="color: #3BE377;scale: 2;"></i>
                            </div>
                        </li>`;
    }
    //attach and event listner to each song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())
        })
    });
    return songs

}

//play music funtion

const playMusic = (track, pause = false) => {

    currentSong.src = `/${currFolder}/` + track;
    if (!pause) {
        currentSong.play();
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 // 00:00"
}

async function displayAlbums() {
        // Fetch the main songs page and parse the response
        let pageResponse = await fetch(`/songs/`);
        let pageHTML = await pageResponse.text();

        // Create a virtual DOM element to parse the HTML
        let div = document.createElement("div");
        div.innerHTML = pageHTML;

        // Extract anchor tags
        let anchors = Array.from(div.getElementsByTagName("a"));
        let cardContainer = document.querySelector(".cardContainer");

        // Loop through anchors and create cards
        for (const anchor of anchors) {
            if (anchor.href.includes("/songs/")) {
                let folder = anchor.href.split("/").slice(-1)[0];

                // Fetch metadata for the folder
                let metaResponse = await fetch(`/songs/${folder}/info.json`);
                let metadata = await metaResponse.json();

                // Create the card element
                let card = document.createElement("div");
                card.className = "card";
                card.setAttribute("data-folder", folder);

                card.innerHTML = `
                    <div class="play">
                        <i class="ri-play-circle-fill" style="color: #3BE377;"></i>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="Cover">
                    <h2>${metadata.title}</h2>
                    <p>${metadata.description}</p>
                `;

                // Add click event listener for dynamic loading
                card.addEventListener("click", async () => {
                    let songs = await getSongs(`songs/${folder}`);
                    playMusic(songs[0])
                });

                // Append card to the container
                cardContainer.appendChild(card);
            }
            
        }
    
}


async function main() {

    //get list of all songs
    await getSongs("songs/Hindi");
    playMusic(songs[0], true)

    //display Albums
    displayAlbums();


    let play = document.getElementById("play");
    //attach and event listner to play next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            play.classList.remove("ri-play-circle-fill")
            currentSong.play();
            play.classList.add("ri-pause-circle-line")
        } else {
            play.classList.remove("ri-pause-circle-line")
            currentSong.pause();
            play.classList.add("ri-play-circle-fill")
        }
    })

    //time update event
    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatSeconds(currentSong.currentTime)}/${formatSeconds(currentSong.duration)}`;
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //add an event listner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;

        document.querySelector(".circle").style.left = percent + "%"
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })

    //event listner for hamburgur
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    //event listner for close
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%"
    })

    //add an event listner to previous and next
    document.querySelector("#next").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index + 1) <= songs.length - 1) {
            playMusic(songs[index + 1])
        }
    })
    document.querySelector("#previous").addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })

    //volume button

    function updateVolume(volume) {
        currentSong.volume = volume;
        volbtn.value = volume; // Keep slider in sync
        if (volume == 0) {
            audioPlayer.classList.add("ri-volume-mute-line");
            audioPlayer.classList.remove('ri-volume-up-line');
        } else {
            if (volume > 0.01 && volume < 0.49) {
                audioPlayer.classList.remove('ri-volume-mute-line');
                audioPlayer.classList.remove("ri-volume-up-line");
                audioPlayer.classList.add("ri-volume-down-line");
            }
            else {
                audioPlayer.classList.remove('ri-volume-mute-line');
                audioPlayer.classList.add("ri-volume-up-line");
            }
        }
    }

    // Event listener for the volume slider
    volbtn.addEventListener('input', (event) => {
        const volume = event.target.value;

        // Automatically unmute if muted
        if (currentSong.muted && volume > 0) {
            currentSong.muted = false;
            audioPlayer.classList.add("ri-volume-mute-line");
            audioPlayer.classList.remove('ri-volume-up-line');
        }

        updateVolume(volume);
    });

    // Event listener for the mute button
    audioPlayer.addEventListener('click', () => {
        if (currentSong.muted) {
            // Unmute the audio
            currentSong.muted = false;
            audioPlayer.classList.add("ri-volume-mute-line");
            audioPlayer.classList.remove('ri-volume-up-line');
            updateVolume(volbtn.value);
        } else {
            // Mute the audio
            currentSong.muted = true;
            audioPlayer.classList.remove('ri-volume-mute-line');
            audioPlayer.classList.add("ri-volume-up-line");
            updateVolume(0); // Set volume to 0 for visual consistency
        }
    });



}
main();
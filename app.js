const form = document.querySelector('#form');
const searchInput = document.querySelector('#search');
const songsContainer = document.querySelector('#songs-container');
const prevAndNextContainer = document.querySelector('#prev-and-next-container');

const apiURL = `https://api.lyrics.ovh/`;

const FetchData = async url => {
    const response = await fetch(url);
    return await response.json();
}

const getMoreSongs = async url => {
    const data = await FetchData(`https://cors-anywhere.herokuapp.com/${url}`)
    insertSongsIntoPage(data);
}

const insertSongsIntoPage = ({ data, prev, next }) => {
    songsContainer.innerHTML = data.map(({ artist: { name }, title }) => `
    <li class="song">
    <span class="song-artist"><strong>${name}</strong> - ${title} </span>
    <button class="btn" data-artist="${name}" data-song-title="${title}">Ver letra</button>
    </li>.
    `).join(' ');

    insertNextAndPrevButtons({ prev, next });
}

const insertNextAndPrevButtons = ({ prev, next }) => {
    if (prev || next) {
        prevAndNextContainer.innerHTML = `
            ${prev ? `<button class="btn" onClick="getMoreSongs('${prev}')"> Anteriores </button>` : ''}
            ${next ? `<button class="btn" onClick="getMoreSongs('${next}')"> Próximas </button>` : ''}
        `
        return;
    }
    prevAndNextContainer.innerHTML = '';
}

const fetchSongs = async term => {
    const data = await FetchData(`${apiURL}/suggest/${term}`);
    insertSongsIntoPage(data);
}

const handleFormSubmit = event => {
    event.preventDefault();
    const seachTerm = searchInput.value.trim();
    searchInput.value = '';
    searchInput.focus();

    if (!seachTerm) {
        songsContainer.innerHTML = `<li class="warning-message">Digite um termo válido.</li>`;
        return;
    }
    fetchSongs(seachTerm)
}

form.addEventListener('submit', handleFormSubmit);

const insertLyricsIntoPage = ({ lyrics, artist, songTitle }) => {
    songsContainer.innerHTML = `
    <li class="lyrics-container"> 
        <h2> <strong>${songTitle} - ${artist}</strong> </h2>
        <p class="lyrics">${lyrics} </p>
    </li>
`;
}

const fetchLyrics = async (artist, songTitle) => {
    const data = await FetchData(`${apiURL}/v1/${artist}/${songTitle}`);
    const lyrics = data.lyrics.replace(/(\r\n|\r|\n)/g, '<br>');

    insertLyricsIntoPage({ lyrics, artist, songTitle });
}

const handleSongContainerClick = event => {
    const clickedElement = event.target;
    if (clickedElement.tagName === 'BUTTON') {
        const artist = clickedElement.getAttribute('data-artist');
        const songTitle = clickedElement.getAttribute('data-song-title');

        prevAndNextContainer.innerHTML = '';
        fetchLyrics(artist, songTitle);
    }
}

songsContainer.addEventListener('click', handleSongContainerClick);

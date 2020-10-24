const NASA_API_KEY = 'Owy40anZTbWVb0Hbe3fYEkv6OqG2qdLYyQc9y7Th'
const NASA_API = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`

const WEEK_DAYS = 7
const ONE_HOUR_INS_MS = 1000 * 60
const ONE_DAY_IN_MS = ONE_HOUR_INS_MS * 60 * 24

const page = document.getElementById('page')
const nextButton = document.getElementById('next-button')
const previousButton = document.getElementById('previous-button')
const brand = document.getElementById('brand')

let offsetWeek = 0
let currentDateInMS
const loadCurrentDateInMS = () => {
    const date = new Date()
    const timeInMS = date.getTime()
    const weeksInMS = offsetWeek * WEEK_DAYS * ONE_DAY_IN_MS
    const timeZoneOffset = date.getTimezoneOffset()
    currentDateInMS = timeInMS - (timeZoneOffset * ONE_HOUR_INS_MS) - weeksInMS
}

const fetchNasaData = async (offset = 0) => {
    const dateInMS = currentDateInMS - (ONE_DAY_IN_MS * offset)
    const date = new Date(dateInMS).toISOString().replace(/T.*/, '')
    const url = `${NASA_API}&date=${date}`
    return fetch(url)
      .then(r => r.ok ? r.json() : ({ error: true }))
} 

const addMediaDay = ({ id, data }) => {
    const parentElement = document.getElementById(id)
    const { url, media_type } = data
    const mediaElement = media_type === 'image' ? createImageDayElement(url) : createVideoDayElement(url)
    parentElement.append(mediaElement)
    parentElement.onclick = (e) => {
        e.preventDefault()
        return showPage(data, parentElement.innerHTML)
    }
    mediaElement.onload = () => parentElement.classList.remove('hide')
}

const createImageDayElement = (url) => {
    const img = document.createElement('img')
    img.src = url
    return img
}

const createVideoDayElement = url => {
    const embed = document.createElement('embed')
    const youtubeParams = '?autoplay=1&mute=1&loop=1&controls=0&showinfo=0&rel=0&modestbranding=1&autohide=1'
    embed.src = `${url}${youtubeParams}`
    return embed
}

const hidePage = () => page.classList.add('hide')

const showPage = (data, htmlString) => {
    const template = `
    <div class="content">
        <a onclick="hidePage()">[X] CLOSE</a>
        <h1>${data.title}</h1>
        <small>${data.date}</small>
        <p>${data.explanation}</p>
    </div>
    <div class="media">${htmlString}</div>
    `
    page.innerHTML = template
    page.classList.remove('hide')
}

const loadImages = async (day = 1) => {
    if (day > WEEK_DAYS) return
    return fetchNasaData(day - 1).then(data => {
        addMediaDay({ id: `day${day}`, data })
        return loadImages(day + 1)
    })
}

const clearImages = (day = 1) => {
    if (day > WEEK_DAYS) return
    const dayElement = document.getElementById(`day${day}`)
    dayElement.classList.add('hide')
    dayElement.innerHTML = ''
    clearImages(day + 1)
}

previousButton.onclick = () => {
    ++offsetWeek
    nextButton.classList.remove('hide')
    render()
}
nextButton.onclick = () => {
    --offsetWeek
    if (offsetWeek >= 0) render()
    if (offsetWeek === 0) nextButton.classList.add('hide')
}
brand.onclick = () => {
    if (offsetWeek === 0) return
    offsetWeek = 0
    nextButton.classList.add('hide')
    render()
}

const render = () => {
    hidePage()
    clearImages()
    loadCurrentDateInMS()
    loadImages()
}

render()

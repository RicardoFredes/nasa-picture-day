const NASA_API_KEY = 'Owy40anZTbWVb0Hbe3fYEkv6OqG2qdLYyQc9y7Th'
const NASA_API = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`

const image404 = 'https://cdn.dribbble.com/users/1651691/screenshots/5336666/404.png'

const WEEK_DAYS = 7
const ONE_HOUR_INS_MS = 1000 * 60
const ONE_DAY_IN_MS = ONE_HOUR_INS_MS * 60 * 24

const brand = document.getElementById('brand')
const nextButton = document.getElementById('next-button')
const previousButton = document.getElementById('previous-button')
const modal = document.getElementById('modal')

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
    const { url, media_type, error } = data
    if (error) return addErrorImage(parentElement) 
    const mediaElement = media_type === 'image' ? createImageDayElement(url) : createVideoDayElement(url)
    parentElement.append(mediaElement)
    parentElement.onclick = () => showModal(data, parentElement.innerHTML)
    mediaElement.onload = () => parentElement.classList.remove('hide')
}

const addErrorImage = (parentElement) => {
    const mediaElement = createImageDayElement(image404)
    parentElement.append(mediaElement)
    mediaElement.onload = () => parentElement.classList.remove('hide')
}

const createImageDayElement = (url) => {
    const img = document.createElement('img')
    img.src = url
    return img
}

const createVideoDayElement = url => {
    const embed = document.createElement('embed')
    const youtubeParams = '?autoplay=0&mute=1&controls=1&showinfo=0&rel=0&autohide=1'
    embed.src = `${url}${youtubeParams}`
    return embed
}

const hideModal = () => modal.classList.add('hide')

const showModal = (data, htmlString) => {
    const template = `
    <div class="content">
        <a onclick="history.back()">[X] CLOSE</a>
        <h1>${data.title}</h1>
        <small>${data.date}</small>
        <p>${data.explanation}</p>
    </div>
    <a href="${data.hdurl}" target="_blank" class="media">${htmlString}</a>
    `
    modal.innerHTML = template
    modal.classList.remove('hide')
    pushHistory()
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

previousButton.onclick = () => render(offsetWeek + 1)

nextButton.onclick = () => render(offsetWeek - 1)

brand.onclick = () => offsetWeek && render(0)

const pushHistory = () => {
    const page = offsetWeek
    const status = { page }
    const url = page ? `?page=${page}` : '?'
    history.pushState(status, null, url)
}

const updateNavigation = () => {
    if (offsetWeek === 0) nextButton.classList.add('hide')
    else nextButton.classList.remove('hide')
}

const render = (page, options = {}) => {
    if (typeof page === 'number') offsetWeek = page
    hideModal()
    clearImages()
    loadCurrentDateInMS()
    loadImages()
    updateNavigation()
    if (!options.notUpdateHistory) pushHistory()
}

window.onpopstate = () => {
    const page = getPage()
    if (page !== offsetWeek) render(page, { notUpdateHistory: true })
    else hideModal()
}

const getPage = () => {
    const page = location.search.replace(/.*page=(\d)/, '$1')
    return Number(page) || 0
}

const initialize = () => {
    render(getPage(), { notUpdateHistory: true })
}

initialize()

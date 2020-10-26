document.addEventListener('DOMContentLoaded', () => {
  const NASA_API_KEY = 'Owy40anZTbWVb0Hbe3fYEkv6OqG2qdLYyQc9y7Th'
  const NASA_API = `https://api.nasa.gov/planetary/apod?api_key=${NASA_API_KEY}`
  const WEEK_DAYS = 7
  const ONE_HOUR_IN_MS = 1000 * 60
  const ONE_DAY_IN_MS = ONE_HOUR_IN_MS * 60 * 24
  const WEEK_IN_MS = WEEK_DAYS * ONE_DAY_IN_MS
  const SECURITY_TIMEZONE = 3

  const brand = document.getElementById('brand')
  const nextButton = document.getElementById('next-button')
  const previousButton = document.getElementById('previous-button')
  const modal = document.getElementById('modal')

  let offsetWeek = 0

  const fetchWeekPictures = async () => {
    const url = `${NASA_API}${getDataWeekParams(offsetWeek)}`
    return fetch(url).then(r => (r.ok ? r.json() : []))
  }

  const getDataWeekParams = (offset = 0) => {
    const timezoneInMS = (new Date().getTimezoneOffset() + SECURITY_TIMEZONE) * ONE_HOUR_IN_MS
    const currentDateInMS = new Date().getTime() - timezoneInMS - offset * WEEK_IN_MS
    const lastWeekInMS = currentDateInMS - WEEK_IN_MS + ONE_DAY_IN_MS
    const startDate = getFormatDate(lastWeekInMS)
    const endDate = getFormatDate(currentDateInMS)
    return `&start_date=${startDate}&end_date=${endDate}`
  }

  const getFormatDate = dateInMS => new Date(dateInMS).toISOString().replace(/T.*/, '')

  const addMediaDay = (id, data) => {
    if (!data) return null
    const parentElement = document.getElementById(id)
    const { media_type, url, error } = data || {}
    const mediaElement = media_type === 'image' ? createImageDayElement(url) : createVideoDayElement(url)
    mediaElement.onload = () => parentElement.classList.remove('hide')
    parentElement.append(mediaElement)
    if (!error) parentElement.onclick = () => showModal(data, mediaElement.outerHTML)
  }

  const createImageDayElement = url => {
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

  const hideModal = () => {
    modal.classList.add('hide')
    modal.innerHTML = ''
  }

  const showModal = (data, htmlString) => {
    const template = `
        <div class="content">
            <a onclick="history.back()">[X] CLOSE</a>
            <h1>${data.title}</h1>
            <small>${data.date}</small>
            <p>${data.explanation}</p>
        </div>
        <a href="${data.hdurl}" title="Open large size image" target="_blank" class="media">${htmlString}</a>
        `
    modal.innerHTML = template
    modal.classList.remove('hide')
    pushHistory()
  }

  const loadImages = async () => {
    return fetchWeekPictures().then(result => {
      const max = result.length
      for (let i = 0; i < max; i++) {
        addMediaDay(`day${max - i}`, result[i])
      }
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

  window.onpopstate = () => {
    const page = getPage()
    if (page !== offsetWeek) render(page, { notUpdateHistory: true })
    else hideModal()
  }

  const updateNavigation = () => {
    if (offsetWeek === 0) nextButton.classList.add('hide')
    else nextButton.classList.remove('hide')
  }

  const getPage = () => {
    const page = location.search.replace(/.*page=(\d)/, '$1')
    return Number(page) || 0
  }

  const render = (page, options = {}) => {
    if (typeof page === 'number') offsetWeek = page
    hideModal()
    clearImages()
    loadImages()
    updateNavigation()
    if (!options.notUpdateHistory) pushHistory()
  }

  const initialize = () => {
    render(getPage(), { notUpdateHistory: true })
  }

  initialize()
})

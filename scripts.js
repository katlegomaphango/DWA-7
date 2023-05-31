import { books, authors, genres, BOOKS_PER_PAGE, html } from './data.js'

let page = 1;
let matches = books

const starting = document.createDocumentFragment()

for (const { author, id, image, title } of matches.slice(0, BOOKS_PER_PAGE)) {
    const element = document.createElement('button')
    element.classList = 'preview'
    element.setAttribute('data-preview', id)

    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `

    starting.appendChild(element)
}

html.list.items.appendChild(starting)

html.search.populateDropDown(html.search.genres, 'Genres', genres)
html.search.populateDropDown(html.search.authors, 'Authors', authors)

/**
 * Function that sets the app theme property
 * @param {string} theme - string theme you want to set
 */
const setThemeProperty = (theme) => {
    if(theme === 'night') {
        document.documentElement.style.setProperty('--color-dark', html.theme.night.dark);
        document.documentElement.style.setProperty('--color-light', html.theme.night.light);
    } else {
        document.documentElement.style.setProperty('--color-dark', html.theme.day.dark);
        document.documentElement.style.setProperty('--color-light', html.theme.day.light);
    }
}

if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    html.theme.settings_theme.value = 'night'
    setThemeProperty('night')
} else {
    html.theme.settings_theme.value = 'day'
    setThemeProperty('day')
}

const updateListBtn = (books, matches, page, booksPerPage) => {
    html.list.button.innerText = `Show more (${books.length - booksPerPage})`
    console.log(matches.length - (page * booksPerPage))
    html.list.button.disabled = (matches.length - (page * booksPerPage)) < 0

    html.list.button.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * booksPerPage)) > 0 ? (matches.length - (page * booksPerPage)) : 0})</span>
    `
}

updateListBtn(books, matches, page, BOOKS_PER_PAGE)

html.search.cancel.addEventListener('click', () => {
    html.search.overlay.open = false
})

html.theme.settings_cancel.addEventListener('click', () => {
    html.theme.overlay.open = false
})

html.search.search.addEventListener('click', () => {
    html.search.overlay.open = true 
    html.search.title.focus()
})

html.theme.settings_header.addEventListener('click', () => {
    html.theme.overlay.open = true 
})

html.summary.close.addEventListener('click', () => {
    html.summary.active.open = false
})

html.theme.settings_form.addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const { theme } = Object.fromEntries(formData)

    setThemeProperty(theme)
    
    html.theme.overlay.open = false
})

html.search.form.addEventListener('submit', (event) => {
    event.preventDefault()
    const formData = new FormData(event.target)
    const filters = Object.fromEntries(formData)
    const result = []

    for (const book of books) {
        let genreMatch = filters.genre === 'any'

        for (const singleGenre of book.genres) {
            if (genreMatch) break;
            if (singleGenre === filters.genre) { genreMatch = true }
        }

        if (
            (filters.title.trim() === '' || book.title.toLowerCase().includes(filters.title.toLowerCase())) && 
            (filters.author === 'any' || book.author === filters.author) && 
            genreMatch
        ) {
            result.push(book)
        }
    }

    page = 1;
    matches = result

    if (result.length < 1) {
        html.list.message.classList.add('list__message_show')
    } else {
        html.list.message.classList.remove('list__message_show')
    }

    html.list.items.innerHTML = ''
    const newItems = document.createDocumentFragment()

    for (const { author, id, image, title } of result.slice(0, BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        newItems.appendChild(element)
    }

    html.list.items.appendChild(newItems)
    html.list.button.disabled = (matches.length - (page * BOOKS_PER_PAGE)) < 1

    html.list.button.innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${(matches.length - (page * BOOKS_PER_PAGE)) > 0 ? (matches.length - (page * BOOKS_PER_PAGE)) : 0})</span>
    `

    window.scrollTo({top: 0, behavior: 'smooth'});
    html.search.overlay.open = false
})

html.list.button.addEventListener('click', () => {
    const fragment = document.createDocumentFragment()

    for (const { author, id, image, title } of matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE)) {
        const element = document.createElement('button')
        element.classList = 'preview'
        element.setAttribute('data-preview', id)
    
        element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `

        fragment.appendChild(element)
    }

    html.list.items.appendChild(fragment)
    page += 1
})

html.list.items.addEventListener('click', (event) => {
    const pathArray = Array.from(event.path || event.composedPath())
    let active = null

    for (const node of pathArray) {
        if (active) break

        if (node?.dataset?.preview) {
            let result = null
    
            for (const singleBook of books) {
                if (result) break;
                if (singleBook.id === node?.dataset?.preview) result = singleBook
            } 
        
            active = result
        }
    }
    
    if (active) {
        html.summary.active.open = true
        html.summary.blur.src = active.image
        html.summary.image.src = active.image
        html.summary.title.innerText = active.title
        html.summary.subtitle.innerText = `${authors[active.author]} (${new Date(active.published).getFullYear()})`
        html.summary.description.innerText = active.description
    }
})
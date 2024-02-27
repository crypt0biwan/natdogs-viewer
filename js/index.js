let natdogs = []
let filtered_natdogs = []
let natdogs_result = []
let filter_choices = []

const itemsPerPage = 1000

const filterForm = document.querySelector('#filter-form')
const filterChoices = document.querySelector('#filter-choices')
const filteredAmount = document.querySelector('#filtered-amount')
const result = document.querySelector('#result')

let numberOfPages = 10
let currentPage = 1

const params = new Proxy(new URLSearchParams(window.location.search), {
    get: (searchParams, prop) => searchParams.get(prop),
})

let params_natdogs = params && params.natdogs ? params.natdogs.split(',') : []

const setActivePage = page => {
    // reset all active states first
    document.querySelectorAll('.page-item').forEach(item=>{
        item.classList.remove('active')
    }
    )
    // add active state to current page
    document.querySelectorAll(`.page-link[href="#${page}"]`).forEach(item=>{
        item.parentNode.classList.add('active')
    }
    )
}

const showItems = page => {
    const startIndex = (page - 1) * itemsPerPage
    const itemsToShow = natdogs_result.slice(startIndex, startIndex + itemsPerPage)

    let html = '<ul>'

    itemsToShow.forEach(item => {
        let { id, name, inscription_id } = item

        html += `
            <li title="${name}">
                <div class="natdog">
                    <img class="pixel-image" src="./img/${id}.png" data-bs-toggle="modal" data-bs-target="#modal" data-natdog-id="${id}">
                    <span class="h6"><a href="./img/${id}.png" target="_blank">${id}</a></span>
                    <a href="https://doggy.market/inscription/${inscription_id}" class="buy" target="_blank">buy</a>
                </div>
            </li>`
    })

    html += '</ul>'

    result.innerHTML = html

    setActivePage(page)
}

const setAmount = () => {
    filteredAmount.innerHTML = `Result: ${natdogs_result.length} Natdogs`

    if(params_natdogs.length) {
        filteredAmount.innerHTML += ` <button id="remove_preselected" class="btn btn-danger ms-3">show all natdogs</button>`

        document.querySelector('#remove_preselected').addEventListener('click', e => {
            e.preventDefault()

            params_natdogs = []
            window.history.pushState('', '', `?natdogs=`)

            filtered_natdogs = natdogs
            natdogs_result = natdogs

            makeFilter()
        })
    }

    updatePaginationNav()
}

const selectFilter = (name, value) => {
    if(value === '') {
        delete filter_choices[name]
    } else {
        filter_choices[name] = value
    }

    filtered_natdogs = natdogs

    document.querySelector('#search').value = ''

    // remove them all
    filterChoices.innerHTML = ''

    Object.keys(filter_choices).forEach(key => {
        let value = filter_choices[key]

        filtered_natdogs = filtered_natdogs.filter(n => {
            let match = Object.keys(n.attributes).filter(k => k === key && n.attributes[k] === value)

            return match.length
        })

        filterChoices.innerHTML += 
            `<span class="badge text-bg-light m-1">
                ${key}: ${value}
                <i class="ms-1 remove-filter bi bi-x-square-fill" data-key="${key}" data-value="${value}"></i>
            </span>`
    })

    natdogs_result = filtered_natdogs

    document.querySelectorAll('.remove-filter').forEach(item => item.addEventListener('click', e => {
        const el = e.target

        selectFilter(el.getAttribute('data-key'), '')
    }))

    makeFilter()
}

const updatePaginationNav = () => {
    numberOfPages = Math.ceil(natdogs_result.length / itemsPerPage)

    let html = `<nav aria-label="Page navigation">
                    <ul class="pagination text-center">
                        <li class="page-item disabled">
                            <a class="page-link" href="#prev">Previous</a>
                        </li>`
    
    for(let i=1; i<=numberOfPages; i++) {
        html += `<li class="page-item">
            <a class="page-link" href="#${i}">${i}</a>
        </li>`
    }                    
        
    html += `<li class="page-item ${numberOfPages === 1 ? "disabled" : ""}">
                <a class="page-link" href="#next">Next</a>
            </li>
        </ul>
    </nav>`

    document.querySelectorAll('.pagination-nav').forEach(nav => {
        nav.innerHTML = html
    })

    document.querySelectorAll('.page-link').forEach(item=>{
        item.addEventListener('click', event=>{
            event.preventDefault();
    
            const page = event.target.getAttribute('href').replace('#', '')
    
            if (page === 'prev') {
                currentPage--
            } else if (page === 'next') {
                currentPage++
            } else {
                currentPage = parseInt(page)
            }
    
            document.querySelectorAll('.page-link[href="#prev"]').forEach(item=>{
                item.parentNode.classList[currentPage === 1 ? 'add' : 'remove']('disabled')
            }
            )
            document.querySelectorAll('.page-link[href="#next"]').forEach(item=>{
                item.parentNode.classList[currentPage === numberOfPages ? 'add' : 'remove']('disabled')
            }
            )
    
            showItems(currentPage)
        }
        )
    }
    )    
}

const setupEventHandlers = () => {
    document.querySelector('#search').addEventListener("keyup", (e) => {
        if (e.isComposing || e.keyCode === 229) {
          return;
        }

        natdogs_result = filtered_natdogs.filter(n => n.id.toString().includes(document.querySelector('#search').value))
        setAmount()
        showItems(1)
    })
}

const makeFilter = () => {
    const keys = []
    const options = []

    filterForm.innerHTML = ''
    result.innerHTML = 'Loading data..'
    let filterFormHTML = ''

    Object.keys(natdogs[0].attributes).forEach(key => {
        keys.push(key)

        if(!['inscription_number', 'magic_eden_link'].includes(key)) {
            filterFormHTML += `<div class="row g-3 mb-2 align-items-center">
                <label for="${key}" class="col-sm-4 col-form-label text-start">${key}</label>
                <div class="col-sm-8">
                    <select class="form-select" id="${key}" aria-label="Default select example">
                        <option value="">- all -</option>
                    </select>
                </div>
            </div>`
        }
    })

    filterForm.innerHTML = filterFormHTML

    filtered_natdogs.forEach(cat => {
        Object.keys(cat.attributes).forEach(key => {
            const value = cat.attributes[key]

            let f = options.filter(v => v.key === key)

            if(f.length) {
                let val = f[0].values.filter(v => v.value === value)
                
                if(val.length) {
                    val[0].count = val[0].count + 1
                } else {
                    f[0].values.push({
                        value,
                        count: 1
                    })
                }
            } else {
                options.push({
                    key,
                    values: [{
                        value,
                        count: 1
                    }]
                })
            }
        })
    })

    options.forEach(a => {
        if(!['inscription_number', 'magic_eden_link'].includes(a.key)) {
            a.values.forEach(b => {

                let has_filter_choice = !!Object.keys(filter_choices).filter(key => {
                    let value = filter_choices[key]

                    return key === a.key && value === b.value
                }).length

                document.querySelector(`#${a.key}`).innerHTML += `<option ${has_filter_choice ? 'selected' : ''} value="${b.value}">${b.value} (${b.count})</option>`
            })
        }
    })

    document.querySelectorAll('select').forEach(select => {
        select.addEventListener('change', e => {
            let name = e.target.getAttribute('id')
            let value = e.target.value === "true" ? true : e.target.value === "false" ? false : e.target.value

            if(value !== '') {
                selectFilter(name, value)
            } else {
                filtered_natdogs = natdogs

                selectFilter(name, value)
            }

            setAmount()
            showItems(1)        
        })
    })

    setAmount()
    showItems(1)
}

const setupModal = () => {
    try {
        const modal = document.getElementById('modal')
        if (modal) {
            modal.addEventListener('show.bs.modal', event => {
                const img = event.relatedTarget
                const dogId = parseInt(img.getAttribute('data-natdog-id'), 10)
                const dog = natdogs.find(d => d.id === `${dogId}`)

                if(dog) {
                    const {
                        attributes,
                        name,
                        inscription_id,
                    } = dog

                    const modalTitle = modal.querySelector('.modal-title')
                    const modalBody = modal.querySelector('.modal-body')

                    let html = '<div class="row">'
                    html += '<div class="col-12 col-md-4 mb-4 mb-md-0">'
                    html += `<img src="./img/${dogId}.png" style="width: 100%" />`

                    html += '<div class="d-grid gap-2 pt-3">'
                    html += `<a href="https://doggy.market/inscription/${inscription_id}" target="_blank" class="btn btn-primary">View on Doggy.market</a>`
                    html += '</div>'
                    html += '</div>'

                    html += '<div class="col-12 col-md-8">'
                    html += `<table class="table table-striped"><tbody>`

                    Object.keys(attributes).forEach(key => {
                        const value = attributes[key]

                        if(![false, null].includes(value)) {
                            html += `<tr><td>${key}</td><td>${value}</td><td></td></tr>`
                        }
                    })

                    html += '</tbody></table>'

                    html += '</div>'

                    html += '</div>'
                    modalTitle.textContent = `${name}`
                    modalBody.innerHTML = html
                }
            })
        }                
    } catch(e) {
        console.log(e)
    }
}

const init = async () => {
    try {
        natdogs = await fetch('./traits.json?ts=1708880751776').then(res=>res.json()).catch(e=>console.log(e))

        if(params_natdogs.length) {
            filtered_natdogs = natdogs.filter(n => params_natdogs.includes(n.id.toString()))
        } else {
            filtered_natdogs = natdogs
        }

        natdogs_result = filtered_natdogs


        makeFilter()
        setupEventHandlers()

        // load first page by default
        showItems(currentPage)

        setupModal()
    } catch(e) {
        console.log(e)
    }
}

init()
/* =================================================================
Two contexts for this app:
1. collecting url params from bookmarklet into browser local storage
2. displaying, downloading, or clearing the collection of web clippings
================================================================= */
import './localForage-1.10.0.js'

export async function main(clipsEl, formEl) {
  const store = window.localforage.createInstance({
    name: 'Wiki Clipboard'
  })
  const {a: action, url, title, comment} = {
    a: 'show',
    url: '',
    title: '',
    comment: '',
    ...Object.fromEntries(new URLSearchParams(location.search))
  }

  switch (action) {
  case 'save':
    await save(store, {url, title, comment})
    window.location = url
    break
  case 'show':
  default:
    const clippings = await store.getItem('clippings')
    if (clippings != null && clippings != undefined && clippings.length > 0) {
      formEl.dataset.state=action
    }
    formEl.onsubmit = event => {
      event.preventDefault()
      const {button} = event.submitter.dataset
      let next, fn = ()=>{}

      switch (button) {
      case "show":
        next="show"
        break
      case "clear":
        next="confirm"
        break
      case "no-thanks":
        next="show"
        break
      case "yes-please-clear":
        next="empty"
        fn=()=>clear(store)
        break
      case "download":
        next="show"
        fn=()=>{
          const page = pageFrom(clippings, formEl)
          download(JSON.stringify(page), `${asSlug(page.title)}.json`)
        }
        break
      case "empty":
      default:
        next="empty"
      }

      fn()
      formEl.dataset.state = next
      display(clipsEl, clippings)
    }
    display(clipsEl, clippings)
    break
  }
}

export function bookmarklet(location) {
  // This code is difficult to read.  It returns a javascript bookmarklet.
  //
  // One aspect of the bookmarklet is the display of a simple HTML
  // form which sends it's data back to the page that hosts this
  // javascript. We're taking that extra trouble here specifically to
  // enable others the freedom to host their own copy of this page for
  // themselves. It contributes to making it harder to read.
  return    'javascript:(()=>{const d=document; return `<style>form textarea.hide {display:none;}</style><form method="get" action="' +
    location +
    '"><p>${d.title} <a href="${document.URL}">link</a></p><textarea name="title" class="hide">${d.title}</textarea><textarea name="url" class="hide">${d.URL}</textarea><input name="comment" type="text" style="width: 100%;" placeholder="Why remember this page?"><input type="hidden" name="a" value="save"></form>`})();'
}

async function save(store, {url, title, comment}) {
  const clip = {datetime: new Date(), url, title, comment}
  // TODO validate URL
  let clippings
  try {
    clippings = await store.getItem('clippings')
    if (clippings && url && title && comment) {
      clippings.push(clip)
    } else {
      clippings = [clip]
    }
  } catch(err) {
    console.error(`failed to load clippings from localForage:${store.name}\n${err}`)
  }

  try {
    await store.setItem('clippings', clippings)
  } catch (err) {
    console.error(`failed to save clippings to localForage:${store.name}\n${err}`)
  }
}

async function clear(store) {
  try {
    await store.removeItem('clippings')
  } catch (err) {
    console.error(`failed to remove clippings to localForage:${store.name}\n${err}`)
  }
}

function display(clips, clippings) {
  if (clippings) {
    clips.innerHTML = ""
    clippings.forEach(({datetime, url, title, comment}) => {
      clips.innerHTML += `<p><time>${datetime.toString()}</time></p><p>${comment} — ${title} <a href="${url}">link</a></p>`
    })
  } else {
    clips.innerHTML = `<p>empty</p>`
  }
}

function pageFrom(clippings, form) {
  let story=[], page={}
  let now = new Date()
  let [date,] = now.toJSON().split(/T/)
  page.title = form.title.value || `Wiki Clipboard ${date}`
  if (form.synopsis.value) {
    story.push({
      type: "paragraph",
      id: Math.abs(Math.random()*1e20|0).toString(16),
      text: form.synopsis.value
    })
  }
  clippings.forEach(({datetime, url, title, comment}) => story.push({
    type: "paragraph",
    id: Math.abs(Math.random()*1e20|0).toString(16),
    text: `${comment} — ${title} [${url} link]`
  }))
  page.story = story
  page.journal = [{
    type: "create",
    date: now.valueOf(),
    item: structuredClone(page)
  }]
  return page
}

const asSlug = title => title
      .replace(/\s/g, '-')
      .replace(/[^A-Za-z0-9-]/g, '')
      .toLowerCase()

function download(string, file, mime='text/json') {
  var data = `data:${mime};charset=utf-8,` + encodeURIComponent(string)
  var anchor = document.createElement('a')
  anchor.setAttribute("href", data)
  anchor.setAttribute("download", file)
  document.body.appendChild(anchor) // required for firefox
  anchor.click()
  anchor.remove()
}

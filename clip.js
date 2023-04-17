import '/deps/localForage-1.10.0.js'
export async function main(clips, form) {
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
  form.className = action

  switch (action) {
  case 'save':
    await save(store, {url, title, comment})
    redirect('show')
    break
  case 'clear':
    redirect('confirm')
    break
  case 'no-thanks':
    redirect('show')
    break
  case 'yes-please-clear':
    await clear(store)
    redirect('empty')
    break
  case 'empty':
  case 'show':
  case 'confirm':
  default:
    display(clips, store)
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

async function display(clips, store) {
  let clippings
  try {
    clippings = await store.getItem('clippings')
    if (clippings) {
      clippings.forEach(({datetime, url, title, comment}) => {
        clips.innerHTML += `<p><time>${datetime.toString()}</time></p><p>${comment} -- ${title} <a href="${url}">link</a></p>`
      })
    } else {
      clips.innerHTML = `<p>empty</p>`
    }
  } catch(err) {
    console.error(`failed to load clippings from localForage:${store.name}\n${err}`)
  }
}

function redirect(state) {
  const next = new URL(window.location)
  next.search = `a=${state}`
  window.location = next
}

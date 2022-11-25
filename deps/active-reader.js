import {LitElement, css, html} from '/deps/lit-core-2.min.js'
import '/deps/localForage-1.10.0.js'

const UNCONFIRMED = 'unconfirmed'
const LISTEN = 'listen'
const BROWSE = 'browse'
const UNKNOWN = 'unknown'

export class ActiveReader extends LitElement {
  #listener

  static properties = {
    state: {state: true},
    store: {state: true},
    _sites: {state: true}
  }
  static styles = css`
`

  constructor() {
    super()
    this.state = UNKNOWN
    this._sites = {}
  }

  connectedCallback() {
    super.connectedCallback()
    if (this.#isFramed()) {
      this.#confirm()
    } else {
      this.#browse()
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback()
    window.removeEventListener('message', this.#listener)
  }

  render() {
    switch(this.state) {
    case UNCONFIRMED:
      return html`<a href="#" @click="${this.#requestStorageAccess}">&#11093;</a>`
    case LISTEN:
      return html`<span>&#11044;</span>`
    case BROWSE:
      return html`<section>${Object.entries(this._sites).map(([origin, data]) => html`
        <details><summary>${origin}</summary><pre>${JSON.stringify(data, null, 2)}</pre>
        </details>
        `)}</section>`
    default:
      return html`<span>?</span>`
    }
  }

  #isFramed() {
    console.log('#isFramed()', window.parent !== window)
    return window.parent !== window
  }

  async #confirm() {
    this.state = UNKNOWN
    if (await document.hasStorageAccess()) {
      this.#listen()
    } else {
      this.state = UNCONFIRMED
    }
  }

  #requestStorageAccess() {
    document.requestStorageAccess().then(
      () => this.#listen(),
      () => this.state = UNCONFIRMED
    )
  }

  #listen() {
    this.state = LISTEN
    this.#initStorage()
    this.#listener = this.#onMessage.bind(this)
    window.addEventListener('message', this.#listener)
    window.parent.postMessage({
      action: 'registerCapabilities',
      capabilities: ['activate', 'store']
    }, '*')
  }

  #browse() {
    this.#initStorage()
    this.store.getItem('sites').then(sites => {
      if (sites) {
        console.log({sites})
        this._sites  = sites
        this.state = BROWSE
      }
    })
  }

  #initStorage() {
    this.store = window.localforage.createInstance({
      name: 'Notebook Storage'
    })
  }

  async #onMessage(event) {
    const {origin, data} = event
    const date = new Date().toJSON().split(/T/)[0]
    switch (data.activeReading) {
    case 'activate':
      console.log('active readers are welcome here')
      break
    case 'store':
      console.log('store', {origin, data})
      const page = data.details
      const {title=`untitled ${date}`} = page
      const sites = {...(await this.store.getItem('sites')) || {}}
      if (!sites[origin]) {
        sites[origin] = {}
      }
      sites[origin][title] = page
      await this.store.setItem('sites', sites)
      console.log('store', {sites})
      break
    default:
      // ignore unrecognized messages
    }
  }
}
customElements.define('active-reader', ActiveReader);

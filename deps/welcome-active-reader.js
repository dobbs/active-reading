import {LitElement, css, html} from '/deps/lit-core-2.min.js'
import '/deps/localForage-1.10.0.js'

export class WelcomeActiveReader extends LitElement {
  static properties = {
    state: {state: true},
    url: {state: true}
  }
  static styles = css`
  form {display: flex; flex-direction: row;}
  form > * {display: none; align-self: center;}
  form > button {
    /* 44x44px: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#size */
    min-width: 44px; min-height: 44px;
  }
  form > input {margin-right: 5px;}
  form.forgotten [data-id=connect] {display: inline;}
  form.editing [data-id=field],
  form.editing [data-id=remember] {display: inline;}
  form.remembered [data-id=forget],
  form.remembered [data-id=reader] {display: inline;}
  form > iframe {border: 0; width: 44px; height: 44px; margin-right: 5px;}`

  constructor() {
    super()
    this.state = 'forgotten'
    this.store = window.localforage.createInstance({
      name: 'Notebook Connector'
    })
    this.store.getItem('url').then(url => {
      if (url) {
        this.state = 'remembered'
        this.url = 'url'
      } else {
        this.state = 'forgotten'
      }
    })
  }

  render() {return html`
  <form class="${this.state}" action="#" @submit="${this._submit}">
    <input  data-id="field" name="url" type="url" placeholder="URL">
    <button data-id="remember" type="submit">Remember</button>
    <button data-id="connect" type="submit">Connect</button>
    <iframe data-id="reader"
      name="reader" src="${this.url}"
      sandbox="allow-same-origin allow-scripts allow-storage-access-by-user-activation">
    </iframe>
    <button data-id="forget" type="submit">Forget</button>
  </form>`}

  _submit(e) {
    e.preventDefault()
    const button = e.submitter.dataset.id
    let next, fn

    switch (button) {

    case 'connect':
      next = 'editing'
      fn = () => null
      break

    case 'remember':
      next = 'remembered'
      fn = e => this.store.setItem('url', e.target.url.value)
      break

    case 'forget':
      next = 'forgotten'
      fn = () => this.store.removeItem('url')
      break
    }

    fn(e)
    this.state = next
  }
}
customElements.define('welcome-active-reader', WelcomeActiveReader);

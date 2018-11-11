import {
  adopt,
  nodeOrNew,
  register,
  wrapWithAttrCheck
} from '../utils/adopter.js'
import { ns, svgjs, xlink, xmlns } from '../modules/core/namespaces.js'
import { registerMethods } from '../utils/methods.js'
import Container from './Container.js'
import Defs from './Defs.js'
import globals from '../utils/window.js'

const { window } = globals

export default class Doc extends Container {
  constructor (node) {
    super(nodeOrNew('svg', node), node)
    this.namespace()
  }

  isRoot () {
    return !this.node.parentNode ||
      !(this.node.parentNode instanceof window.SVGElement) ||
      this.node.parentNode.nodeName === '#document'
  }

  // Check if this is a root svg
  // If not, call docs from this element
  doc () {
    if (this.isRoot()) return this
    return super.doc()
  }

  // Add namespaces
  namespace () {
    if (!this.isRoot()) return this.doc().namespace()
    return this
      .attr({ xmlns: ns, version: '1.1' })
      .attr('xmlns:xlink', xlink, xmlns)
      .attr('xmlns:svgjs', svgjs, xmlns)
  }

  // Creates and returns defs element
  defs () {
    if (!this.isRoot()) return this.doc().defs()

    return adopt(this.node.getElementsByTagName('defs')[0]) ||
      this.put(new Defs())
  }

  // custom parent method
  parent (type) {
    if (this.isRoot()) {
      return this.node.parentNode.nodeName === '#document'
        ? null
        : adopt(this.node.parentNode)
    }

    return super.parent(type)
  }

  clear () {
    // remove children
    while (this.node.hasChildNodes()) {
      this.node.removeChild(this.node.lastChild)
    }
    return this
  }
}

registerMethods({
  Container: {
    // Create nested svg document
    nested: wrapWithAttrCheck(function () {
      return this.put(new Doc())
    })
  }
})

register(Doc, 'Doc', true)

import parent from '../render/dom/parent'
import append from '../render/dom/create/append'

const appendStatic = append.static
const appendState = append.state
const injectable = {}

export default injectable

// little bit harder with overtake since you need to check if there is a text value
// if resolve true

injectable.types = {
  text: {
    define: { isText: true },
    subscriptionType: 'shallow',
    render: {
      static (t, pnode) {
        appendStatic(t, pnode, document.createTextNode(t.compute()))
      },
      state  (t, s, type, subs, tree, id, pid, order) {
        const val = t.compute(s, s)
        var node = tree._[id]
        var pnode
        if (!node) {
          if (typeof val !== 'object' && val !== void 0) {
            pnode = parent(tree, pid)
            if (t.resolve) {
              let i = pnode.childNodes.length
              while (i--) {
                if (pnode.childNodes[i].nodeType === 3) { //eslint-disable-line
                  node = tree._[id] = pnode.childNodes[i]
                  const rVal = pnode.childNodes[i].nodeValue
                  if (rVal != val) {
                    if (!~rVal.indexOf(val)) {
                      pnode.childNodes[i].nodeValue = val
                    }
                  }
                  break
                }
              }
            }
            if (!node) {
              node = tree._[id] = document.createTextNode(val)
              appendState(t, pnode, node, subs, tree, id, order)
            }
          }
        } else {
          // remove is overhead here (extra compute)
          if (type && type === 'remove' || typeof val === 'object' || val === void 0) {
            pnode = parent(tree, pid) || node.parentNode
            if (pnode) { pnode.removeChild(node) }
          } else {
            if (val && typeof val !== 'object' || val === 0) {
              node.nodeValue = val
            }
          }
        }
      }
    }
  }
}

injectable.props = { text: { type: 'text' } }

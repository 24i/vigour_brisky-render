'use strict'
const render = require('../../render')
const test = require('tape')
const parse = require('parse-element')
const strip = require('strip-formatting')
const s = require('brisky-struct')

test('any - merge', t => {
  const app = {
    holder: {
      tag: 'holder',
      $: 'collection.$any',
      props: {
        default: {
          tag: 'span',
          title: { text: { $: 'title' } }
        }
      }
    },
    text: {
      $: 'collection',
      $transform: val => {
        return val.keys().length
      }
    }
  }

  const state = s({
    collection: [
      { title: 'a' },
      { title: 'b' }
    ]
  })

  const elem = render(app, state)

  t.equal(
    parse(elem),
    strip(`
      <div>
        <holder>
          <span><div>a</div></span>
          <span><div>b</div></span>
        </holder>
        2
      </div>
    `)
  )

  if (document.body) {
    document.body.appendChild(elem)
  }

  t.end()
})

// test('any - merge - multiple collections', t => {
//   const simple = {
//     types: {
//       collection: {
//         tag: 'fragment',
//         $: 'collection.$any',
//         props: {
//           default: {
//             tag: 'b', title: { tag: 'fragment', text: { $: 'title' } }
//           }
//         }
//       }
//     },
//     holder1: { type: 'collection' },
//     holder2: { type: 'collection' }
//   }
//   const app = render(simple, { collection: [ { title: 1 }, { title: 2 } ] })
//   t.equal(
//     parse(app),
//     '<div><b>1</b><b>2</b><b>1</b><b>2</b></div>',
//     'intial subscription'
//   )
//   t.end()
// })

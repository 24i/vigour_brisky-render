const { render } = require('../')
const test = require('tape')
const { create: s } = require('brisky-struct')
const p = require('parse-element')

test('subscribe - merge', t => {
  const state = s({
    field: 'its text'
  })
  const app = render(
    {
      text: { $: 'field' },
      a: { tag: 'a', $: 'field' }
    },
    state
  )
  t.equal(p(app), '<div>its text<a></a></div>', 'initial')
  state.field.set('update')
  t.equal(p(app), '<div>update<a></a></div>', 'fires update')
  t.end()
})

test('subscribe - object subscription', t => {
  const state = s({
    a: 'its a ',
    b: 'its b ',
    val: 'bla',
    fields: {
      a: {
        title: 'its fields.a '
      }
    }
  })
  const app = render({
    text: {
      $: {
        a: { val: true },
        b: { val: true }
      },
      $transform: (val, state) => {
        return state.get('a').compute() + ':' + state.get('b').compute()
      }
    }
  }, state)
  t.equal(p(app), '<div>its a :its b </div>', 'initial subs')
  state.a.set('haha a ')
  t.equal(p(app), '<div>haha a :its b </div>', 'update a')
  t.end()
})

test('subscribe - object subscription element', t => {
  const state = s({
    blirf: {
      a: 'its a ',
      b: 'its b ',
      val: 'bla',
      fields: {
        a: {
          title: 'its fields.a '
        }
      }
    }
  })
  const app = render({
    dirt: {
      tag: 'fragment',
      $: 'blirf',
      elem: {
        $: {
          val: 'property',
          a: { val: true },
          b: { val: true }
        },
        text: { $: 'a' }
      }
    }
  }, state)
  t.equal(p(app), '<div><div>its a </div></div>', 'initial subs')
  state.blirf.a.set('haha a ')
  t.equal(p(app), '<div><div>haha a </div></div>', 'update a')
  t.end()
})

test('subscribe - object subscription + context', t => {
  const state = s({
    fields: {
      a: {
        a: 'its fields a',
        b: {
          val: 'BBBBBBB',
          c: {
            val: ' YO ',
            d: { val: 'd!', color: 'red', 'w': '10px' }
          }
        },
        c: 'c on a'
      }
    },
    page: {
      current: [ '@', 'root', 'fields', 'a' ]
    }
  })

  // and property ofc
  const app = render({
    bla: {
      $: 'page.current.$switch',
      $switch: (state) => 'bla',
      props: {
        bla: {
          tag: 'bla',
          $: {
            // val: 1,
            b: { c: { d: true, val: true }, val: true }, // branches need to be taken into account :/
            x: { val: 'switch' },
            a: true,
            c: true
          },
          text: '?',
          bla: {
            text: 'BLA',
            style: {
              border: {
                $: {
                  w: true,
                  color: true
                },
                $transform: (val, state) => `${
                  state.w.compute()
                } solid ${
                  state.color.compute()
                }`
              }
            }
          },
          more: {
            tag: 'more',
            // text is hard need to know if it does not exist...
            text: { $: true }
          }
        }
      }
    }
  }, state)

  state.fields.a.b.c.d.color.set('purple')

  t.equal(p(app), '<div><bla>?<div style="border: 10px solid purple;">BLA</div><more>d!</more></bla></div>')

  if (global.document && global.document.body) {
    global.document.body.appendChild(app)
  }
  t.end()
})

test('subscribe - object sub - shallow', t => {
  const state = s({
    item: {
      one: 'bla'
    }
  })
  const app = render(
    {
      $: 'item',
      text: {
        $: { one: 'shallow' },
        $transform: val => val.get('one').compute()
      }
    },
    state
  )

  t.equal(p(app), '<div>bla</div>', 'initial')

  state.set({
    item: {
      one: 'foo'
    }
  })

  t.equal(p(app), '<div>foo</div>', 'updates')
  t.end()
})

import Vue from 'vue'

import './styles/quasar.sass'
import iconSet from 'quasar/icon-set/fontawesome-v5.js'
import lang from 'quasar/lang/en-us.js'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'

import { Quasar, Notify} from 'quasar'

Vue.use(Quasar, {
  config: {
    notify: { }
  },
  components: { },
  directives: {
  },
  plugins: [
    Notify
  ],
  lang: lang,
  iconSet: iconSet
})

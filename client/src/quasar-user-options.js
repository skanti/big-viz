import './styles/quasar.sass'
import iconSet from 'quasar/icon-set/fontawesome-v6.js'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import { Notify } from 'quasar';

// To be used on app.use(Quasar, { ... })
export default {
  config: {
    notify: {}
  },
  plugins: {
    Notify
  },
  iconSet: iconSet
}


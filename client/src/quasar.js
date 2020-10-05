import Vue from 'vue'

import './styles/quasar.sass'
import iconSet from 'quasar/icon-set/fontawesome-v5.js'
import lang from 'quasar/lang/en-us.js'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import {
  Quasar, 
  QBadge,
  QBreadcrumbs,
  QBreadcrumbsEl,
  QBtnGroup,
  QCard,
  QCardSection,
  QChip,
  QLayout,
  QHeader,
  QDrawer,
  QPageContainer,
  QPage,
  QToolbar,
  QToolbarTitle,
  QBtn,
  QIcon,
  QList,
  QImg,
  QInput,
  QItem,
  QItemSection,
  QItemLabel,
  QSpace,
  QSpinnerGrid,
  QTable,
  QTooltip,
  QTd,
  QTh,
  QTr,
} from 'quasar'

Vue.use(Quasar, {
  config: {},
  components: {
    QLayout,
    QBadge,
    QBreadcrumbs,
    QBreadcrumbsEl,
    QBtnGroup,
  QCard,
  QCardSection,
    QChip,
    QHeader,
    QDrawer,
    QPageContainer,
    QPage,
    QToolbar,
    QToolbarTitle,
    QBtn,
    QIcon,
    QList,
    QImg,
    QInput,
    QItem,
    QItemSection,
    QItemLabel,
    QSpace,
    QSpinnerGrid,
    QTable,
    QTooltip,
    QTd,
    QTh,
    QTr,
  },
  directives: {
  },
  plugins: {
  },
  lang: lang,
  iconSet: iconSet
})
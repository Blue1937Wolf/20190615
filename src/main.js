// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import VueLazyload from 'vue-lazyload'
import infiniteScroll from  'vue-infinite-scroll'
import {currency} from './util/currency'
import Vuex from  'vuex';
import { stat } from 'fs';


Vue.config.productionTip = false;

Vue.use(VueLazyload, {
  loading: 'static/loading-svg/loading-bars.svg',
  try: 3 // default 1
});

Vue.use(infiniteScroll);
Vue.use(Vuex);

Vue.filter('currency', currency);

const store = new Vuex.Store({
  state:{
    nickName:'',
    cartCount:0
  },
  mutations:{
    updateNickName(state, nickName){
      state.nickName = nickName;
    },
    updateCartCount(state, cartCount){
      state.cartCount += cartCount;
    },
    initCartCount(state, cartCount){
      state.cartCount = cartCount;
    }
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})

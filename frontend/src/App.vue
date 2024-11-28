<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <HelloWorld msg="Welcome to Vue.js App with Docker 1"/>
  <div class="nav-main">
      <router-link to="/">Home</router-link> | 
      <router-link to="/about-us">About Us</router-link> | 
      <router-link to="/contact-us">Contact Us</router-link>
  </div>
  <router-view></router-view>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'

export default {
  name: 'App',
  components: {
    HelloWorld
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

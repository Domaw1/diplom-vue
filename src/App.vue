<template>
  <nav-bar></nav-bar>
  <router-view/>
</template>

<style>
* {
  padding: 0;
  margin: 0;
}
</style>
<script setup>
import NavBar from "@/components/NavBar.vue";
</script>
<template>
  <div class="mx-auto w-20 text-center spinner">
    <div
      class="bounce1"
      :style="sizeClass"
    />
    <div
      class="bounce2"
      :style="sizeClass"
    />
    <div
      class="bounce3"
      :style="sizeClass"
    />
  </div>
</template>

<script>
export default {

  props: {
    size: {
      type: Number,
      default: 12
    },
    color: {
      type: String,
      default: '#fff'
    }
  },
  computed: {
    sizeClass () {
      return {
        width: this.size + 'px',
        height: this.size + 'px',
        'background-color': this.color
      }
    }
  }
}
</script>

<style scoped>

.spinner > div {
  margin: 0 1px;
  border-radius: 100%;
  display: inline-block;
  -webkit-animation: sk-bouncedelay 1.4s infinite ease-in-out both;
  animation: sk-bouncedelay 1.4s infinite ease-in-out both;
}

.spinner .bounce1 {
  -webkit-animation-delay: -0.32s;
  animation-delay: -0.32s;
}

.spinner .bounce2 {
  -webkit-animation-delay: -0.16s;
  animation-delay: -0.16s;
}

@-webkit-keyframes sk-bouncedelay {
  0%, 80%, 100% { -webkit-transform: scale(0) }
  40% { -webkit-transform: scale(1.0) }
}

@keyframes sk-bouncedelay {
  0%, 80%, 100% {
    -webkit-transform: scale(0);
    transform: scale(0);
  } 40% {
    -webkit-transform: scale(1.0);
    transform: scale(1.0);
  }
}
</style>

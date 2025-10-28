<template>
  <div>
    <h4>行程结果</h4>
    <pre style="background:#f7f7f7;padding:10px;border-radius:6px;max-height:400px;overflow:auto">
{{ formatted }}
    </pre>
  </div>
</template>

<script>
export default {
  props: ['data'],
  computed: {
    formatted() {
      return JSON.stringify(this.data, null, 2);
    }
  }
}
</script>

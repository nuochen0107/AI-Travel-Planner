<template>
  <div>
    <h4>行程结果</h4>
    <pre style="background:#eee; color:#000; padding:10px; border-radius:6px; max-height:400px; overflow:auto; white-space: pre-wrap; text-align: left;">
{{ formatted }}
    </pre>
  </div>
</template>

<script>
export default {
  props: ['data'],
  computed: {
    formatted() {
      // 你的 JSON 格式化逻辑是完全正确的
      return JSON.stringify(this.data, null, 2);
    }
  }
}
</script>
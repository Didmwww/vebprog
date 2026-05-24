<template>
  <div class="login-container">
    <h2>Вхід у систему</h2>
    <form @submit.prevent="handleLogin" class="login-form">
      <div class="form-group">
        <label>Логін:</label>
        <input v-model="login" placeholder="admin" required />
      </div>
      <div class="form-group">
        <label>Пароль:</label>
        <input type="password" v-model="password" placeholder="1234" required />
      </div>
      <button type="submit">Увійти</button>
      <p v-if="error" class="error">{{ error }}</p>
    </form>
    <p class="hint">Підказка: логін - <b>admin</b>, пароль - <b>1234</b></p>
  </div>
</template>

<script>
export default {
  data() {
    return { login: '', password: '', error: '' }
  },
  methods: {
    handleLogin() {
      // Імітація перевірки з БД
      if (this.login === 'admin' && this.password === '1234') {
        this.$emit('login-success'); // Сигнал батьківському компоненту
      } else {
        this.error = 'Невірні дані!';
      }
    }
  }
}
</script>

<style scoped>
.login-form { max-width: 300px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
.form-group { margin-bottom: 15px; text-align: left; }
input { width: 100%; padding: 8px; box-sizing: border-box; }
button { width: 100%; padding: 10px; background: #42b983; color: white; border: none; cursor: pointer; }
.error { color: red; margin-top: 10px; }
</style>
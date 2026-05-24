<template>
  <div>
    <h2>📚 Керування Студентами</h2>
    
    <form @submit.prevent="save" class="crud-form">
      <input v-model="form.name" placeholder="Ім'я" required />
      <input v-model="form.surname" placeholder="Прізвище" required />
      <input v-model="form.group" placeholder="Група (ID)" required />
      <button type="submit">{{ editId ? 'Зберегти зміни' : 'Додати' }}</button>
      <button type="button" v-if="editId" @click="reset" class="cancel-btn">Скасувати</button>
    </form>

    <table>
      <thead>
        <tr><th>ID</th><th>Ім'я</th><th>Прізвище</th><th>Група</th><th>Дії</th></tr>
      </thead>
      <tbody>
        <tr v-for="s in students" :key="s.id">
          <td>{{ s.id }}</td>
          <td>{{ s.name }}</td>
          <td>{{ s.surname }}</td>
          <td>{{ s.group }}</td>
          <td>
            <button @click="edit(s)">Ред.</button>
            <button @click="remove(s.id)" class="del-btn">Вид.</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      students: [
        { id: 1, name: 'Андрій', surname: 'Бондар', group: 'KB-41' },
        { id: 2, name: 'Олена', surname: 'Шевченко', group: 'KB-41' }
      ],
      form: { name: '', surname: '', group: '' },
      editId: null
    }
  },
  methods: {
    save() {
      if (this.editId) {
        const idx = this.students.findIndex(s => s.id === this.editId);
        this.students[idx] = { ...this.form, id: this.editId };
      } else {
        this.students.push({ ...this.form, id: Date.now() });
      }
      this.reset();
    },
    edit(item) {
      this.form = { ...item };
      this.editId = item.id;
    },
    remove(id) {
      this.students = this.students.filter(s => s.id !== id);
    },
    reset() {
      this.form = { name: '', surname: '', group: '' };
      this.editId = null;
    }
  }
}
</script>

<style scoped>
.crud-form { background: #eef; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
input { margin: 5px; padding: 8px; }
button { padding: 8px 15px; margin: 5px; cursor: pointer; }
.del-btn { background: #ff4d4d; color: white; border: none; }
.cancel-btn { background: #999; color: white; border: none; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 10px; }
</style>
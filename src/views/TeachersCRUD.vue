<template>
  <div>
    <h2>🎓 Керування Викладачами</h2>
    
    <form @submit.prevent="save" class="crud-form">
      <input v-model="form.name" placeholder="Ім'я" required />
      <input v-model="form.surname" placeholder="Прізвище" required />
      <input v-model="form.department" placeholder="Кафедра (ID)" required />
      <button type="submit">{{ editId ? 'Зберегти зміни' : 'Додати' }}</button>
      <button type="button" v-if="editId" @click="reset" class="cancel-btn">Скасувати</button>
    </form>

    <table>
      <thead>
        <tr><th>ID</th><th>Ім'я</th><th>Прізвище</th><th>Кафедра</th><th>Дії</th></tr>
      </thead>
      <tbody>
        <tr v-for="t in teachers" :key="t.id">
          <td>{{ t.id }}</td>
          <td>{{ t.name }}</td>
          <td>{{ t.surname }}</td>
          <td>{{ t.department }}</td>
          <td>
            <button @click="edit(t)">Ред.</button>
            <button @click="remove(t.id)" class="del-btn">Вид.</button>
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
      teachers: [
        { id: 1, name: 'Олександр', surname: 'Коваль', department: '101' },
        { id: 2, name: 'Ірина', surname: 'Мельник', department: '102' }
      ],
      form: { name: '', surname: '', department: '' },
      editId: null
    }
  },
  methods: {
    save() {
      if (this.editId) {
        // Update
        const idx = this.teachers.findIndex(t => t.id === this.editId);
        this.teachers[idx] = { ...this.form, id: this.editId };
      } else {
        // Create
        this.teachers.push({ ...this.form, id: Date.now() });
      }
      this.reset();
    },
    edit(item) {
      this.form = { ...item };
      this.editId = item.id;
    },
    remove(id) {
      // Delete
      this.teachers = this.teachers.filter(t => t.id !== id);
    },
    reset() {
      this.form = { name: '', surname: '', department: '' };
      this.editId = null;
    }
  }
}
</script>

<style scoped>
.crud-form { background: #f9f9f9; padding: 15px; margin-bottom: 20px; border-radius: 8px; }
input { margin: 5px; padding: 8px; }
button { padding: 8px 15px; margin: 5px; cursor: pointer; }
.del-btn { background: #ff4d4d; color: white; border: none; }
.cancel-btn { background: #999; color: white; border: none; }
table { width: 100%; border-collapse: collapse; }
th, td { border: 1px solid #ddd; padding: 10px; }
</style>
<template>
  <div id="app">
    <header>
      <h1>Система Розкладу (Lab 10: Vue + Node.js + MySQL)</h1>
      <div v-if="currentUser" class="user-menu">
        <span>Ви увійшли як: <b>{{ currentUser.full_name || currentUser.login }}</b> ({{ getRoleName(currentUser.role) }})</span>
        <button @click="logout" class="logout-btn">Вийти</button>
      </div>
    </header>

    <div v-if="!currentUser" class="auth-container">
      <div class="card">
        <div class="auth-tabs">
          <button @click="authMode = 'login'" :class="{active: authMode === 'login'}">Вхід</button>
          <button @click="authMode = 'register'" :class="{active: authMode === 'register'}">Реєстрація</button>
        </div>

        <form v-if="authMode === 'login'" @submit.prevent="doLogin">
          <input v-model="loginInput" placeholder="Логін" class="input-field" required>
          <input v-model="passInput" type="password" placeholder="Пароль" class="input-field" required>
          <button type="submit" class="action-btn">Увійти</button>
        </form>

        <form v-else @submit.prevent="doRegister">
          <input v-model="regForm.login" placeholder="Придумайте логін" class="input-field" required>
          <input v-model="regForm.password" type="password" placeholder="Придумайте пароль" class="input-field" required>
          <input v-model="regForm.name" placeholder="Ваше ПІБ" class="input-field" required>
          
          <label>Хто ви?</label>
          <select v-model="regForm.role" class="input-field select-input">
            <option value="student">Студент</option>
            <option value="teacher">Викладач</option>
          </select>

          <div v-if="regForm.role === 'student'">
            <label>Оберіть вашу групу:</label>
            <select v-model="regForm.groupId" class="input-field select-input" required>
              <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
          </div>

          <div v-if="regForm.role === 'teacher'">
            <label>Оберіть кафедру:</label>
            <select v-model="regForm.deptId" class="input-field select-input" required>
              <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
          </div>

          <button type="submit" class="action-btn">Зареєструватися</button>
        </form>

        <p v-if="error" class="error-text">{{ error }}</p>
      </div>
    </div>

    <div v-else class="main-content">
      
      <div v-if="currentUser.role === 'admin'">
        <div class="tabs">
          <button @click="currentTab = 'teachers'" :class="{active: currentTab === 'teachers'}">Викладачі</button>
          <button @click="currentTab = 'students'" :class="{active: currentTab === 'students'}">Студенти</button>
          <button @click="currentTab = 'schedule'" :class="{active: currentTab === 'schedule'}">📅 Розклад</button>
        </div>

        <div v-if="currentTab === 'teachers'">
          <div class="toolbar">
            <h3>Список Викладачів (з БД)</h3>
            <button @click="openCreateForm" class="add-btn">+ Додати</button>
          </div>
          
          <table v-if="viewMode === 'table'">
            <thead><tr><th>Ім'я</th><th>Кафедра</th><th>Дії</th></tr></thead>
            <tbody>
              <tr v-for="t in teachers" :key="t.id">
                <td>{{ t.name }}</td>
                <td>{{ getDepartmentName(t.department_id) }}</td>
                <td><button @click="deleteItem('teachers', t.id)" class="del-btn">Видалити</button></td>
              </tr>
            </tbody>
          </table>

          <div v-else class="form-page">
            <h4>Додавання викладача</h4>
            <input v-model="form.name" placeholder="ПІБ" class="input-field">
            <select v-model="form.department_id" class="input-field select-input">
               <option v-for="d in departments" :key="d.id" :value="d.id">{{ d.name }}</option>
            </select>
            <button @click="saveItem('teacher')" class="save-btn">Зберегти в БД</button>
            <button @click="viewMode = 'table'" class="cancel-btn">Назад</button>
          </div>
        </div>

        <div v-if="currentTab === 'students'">
           <div class="toolbar">
            <h3>Список Студентів (з БД)</h3>
            <button @click="openCreateForm" class="add-btn">+ Додати</button>
          </div>
          <table v-if="viewMode === 'table'">
            <thead><tr><th>Ім'я</th><th>Група</th><th>Дії</th></tr></thead>
            <tbody>
              <tr v-for="s in students" :key="s.id">
                <td>{{ s.name }}</td>
                <td>{{ getGroupName(s.group_id) }}</td>
                <td><button @click="deleteItem('students', s.id)" class="del-btn">Видалити</button></td>
              </tr>
            </tbody>
          </table>

          <div v-else class="form-page">
            <h4>Додавання студента</h4>
            <input v-model="form.name" placeholder="ПІБ" class="input-field">
            <select v-model="form.group_id" class="input-field select-input">
               <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
            </select>
            <button @click="saveItem('student')" class="save-btn">Зберегти в БД</button>
            <button @click="viewMode = 'table'" class="cancel-btn">Назад</button>
          </div>
        </div>

        <div v-if="currentTab === 'schedule'">
          <h3>Створення Розкладу</h3>
          <div class="schedule-creator">
            <div class="form-row">
              <select v-model="scheduleForm.group_id" class="input-field">
                <option value="" disabled>Оберіть групу</option>
                <option v-for="g in groups" :key="g.id" :value="g.id">{{ g.name }}</option>
              </select>
              <select v-model="scheduleForm.day_of_week" class="input-field">
                <option>Понеділок</option><option>Вівторок</option><option>Середа</option><option>Четвер</option><option>П'ятниця</option>
              </select>
               <select v-model="scheduleForm.lesson_number" class="input-field">
                <option value="1">1 пара</option><option value="2">2 пара</option><option value="3">3 пара</option><option value="4">4 пара</option>
              </select>
            </div>
            <div class="form-row">
              <input v-model="scheduleForm.subject" placeholder="Назва предмету" class="input-field">
              <select v-model="scheduleForm.teacher_id" class="input-field">
                <option value="" disabled>Оберіть викладача</option>
                <option v-for="t in teachers" :key="t.id" :value="t.id">{{ t.name }}</option>
              </select>
              <button @click="addSchedule" class="add-btn">Додати в БД</button>
            </div>
          </div>

          <h4>Повний список пар (з БД)</h4>
           <table>
              <thead><tr><th>Група</th><th>День</th><th>Пара</th><th>Предмет</th><th>Викладач</th><th>Дії</th></tr></thead>
              <tbody>
                <tr v-for="sch in schedule" :key="sch.id">
                  <td><b>{{ getGroupName(sch.group_id) }}</b></td>
                  <td>{{ sch.day_of_week }}</td>
                  <td>{{ sch.lesson_number }}</td>
                  <td>{{ sch.subject }}</td>
                  <td>{{ getTeacherName(sch.teacher_id) }}</td>
                  <td><button @click="deleteItem('schedule', sch.id)" class="del-btn">X</button></td>
                </tr>
              </tbody>
            </table>
        </div>
      </div>

      <div v-if="currentUser.role === 'student'">
        <h2 class="welcome-title">Привіт, {{ currentUser.full_name }}!</h2>
        <p>Ваша група: <b>{{ getStudentGroupName(currentUser.id) }}</b></p>
        
        <div class="info-block">
          <h3>📅 Мій Розклад</h3>
          <table>
            <thead><tr><th>День</th><th>Пара</th><th>Предмет</th><th>Викладач</th></tr></thead>
            <tbody>
              <tr v-for="sch in getMyStudentSchedule()" :key="sch.id">
                <td><b>{{ sch.day_of_week }}</b></td>
                <td>{{ sch.lesson_number }}</td>
                <td>{{ sch.subject }}</td>
                <td>{{ getTeacherName(sch.teacher_id) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="currentUser.role === 'teacher'">
        <h2 class="welcome-title">Кабінет Викладача: {{ currentUser.full_name }}</h2>

        <div class="info-block">
           <h3>📅 Мій Розклад</h3>
            <table>
            <thead><tr><th>День</th><th>Пара</th><th>Група</th><th>Предмет</th></tr></thead>
            <tbody>
              <tr v-for="sch in getMyTeacherSchedule()" :key="sch.id">
                <td><b>{{ sch.day_of_week }}</b></td>
                <td>{{ sch.lesson_number }}</td>
                <td>{{ getGroupName(sch.group_id) }}</td>
                <td>{{ sch.subject }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
import axios from 'axios';

// Адреса нашого сервера (Backend)
const API_URL = 'http://localhost:3000';

export default {
  data() {
    return {
      authMode: 'login',
      currentUser: null,
      
      loginInput: '', passInput: '', error: '',
      
      regForm: { login: '', password: '', name: '', role: 'student', groupId: '', deptId: '' },

      currentTab: 'schedule',
      viewMode: 'table',
      form: {}, 
      
      scheduleForm: { group_id: '', day_of_week: 'Понеділок', lesson_number: '1', subject: '', teacher_id: '' },

      // Дані, які ми будемо завантажувати з БД
      teachers: [],
      students: [],
      schedule: [],

      // Довідники (статичні) - для спрощення залишаємо хардкод, щоб не писати зайві API
      departments: [
        { id: 1, name: 'Кафедра КН' },
        { id: 2, name: 'Кафедра Математики' }
      ],
      groups: [
        { id: 1, name: 'КН-11' },
        { id: 2, name: 'КН-12' },
        { id: 3, name: 'Мат-21' }
      ],
    }
  },
  methods: {
    // === АВТОРИЗАЦІЯ ЧЕРЕЗ СЕРВЕР ===
    async doLogin() {
      try {
        const res = await axios.post(`${API_URL}/login`, {
          login: this.loginInput,
          password: this.passInput
        });
        
        this.currentUser = res.data; // Зберігаємо користувача з БД
        this.error = '';
        
        // Після успішного входу завантажуємо дані
        await this.loadData();
      } catch (err) {
        this.error = err.response?.data?.error || 'Помилка входу (сервер)';
        console.error(err);
      }
    },

    async doRegister() {
      try {
        await axios.post(`${API_URL}/register`, this.regForm);
        alert("Реєстрація успішна! Тепер увійдіть.");
        this.authMode = 'login';
        this.error = '';
      } catch (err) {
        this.error = 'Помилка реєстрації. Можливо, логін зайнятий.';
        console.error(err);
      }
    },

    logout() {
      this.currentUser = null;
      this.teachers = [];
      this.students = [];
      this.schedule = [];
      this.loginInput = '';
      this.passInput = '';
    },

    // === ЗАВАНТАЖЕННЯ ДАНИХ З БД ===
    async loadData() {
      try {
        // Завантажуємо все паралельно
        const [tRes, sRes, schRes] = await Promise.all([
          axios.get(`${API_URL}/teachers`),
          axios.get(`${API_URL}/students`),
          axios.get(`${API_URL}/schedule`)
        ]);

        this.teachers = tRes.data;
        this.students = sRes.data;
        this.schedule = schRes.data;
      } catch (err) {
        console.error("Помилка завантаження даних:", err);
      }
    },

    // === CRUD ОПЕРАЦІЇ ===
    openCreateForm() {
      this.form = {};
      this.viewMode = 'form';
    },

    async saveItem(type) {
      try {
        if (type === 'teacher') {
          await axios.post(`${API_URL}/teachers`, this.form);
        } else {
          await axios.post(`${API_URL}/students`, this.form);
        }
        await this.loadData(); // Оновлюємо таблицю
        this.viewMode = 'table';
      } catch (err) {
        alert("Помилка збереження");
        console.error(err);
      }
    },

    async deleteItem(type, id) {
      if(!confirm("Видалити запис?")) return;
      try {
        await axios.delete(`${API_URL}/${type}/${id}`);
        await this.loadData(); // Оновлюємо таблицю
      } catch (err) {
        alert("Помилка видалення");
        console.error(err);
      }
    },

    async addSchedule() {
      try {
        await axios.post(`${API_URL}/schedule`, this.scheduleForm);
        await this.loadData();
        alert("Пару додано!");
      } catch (err) {
        alert("Помилка додавання розкладу");
        console.error(err);
      }
    },

    // === ДОПОМІЖНІ ФУНКЦІЇ ===
    getRoleName(role) {
      const map = { admin: 'Адмін', student: 'Студент', teacher: 'Викладач' };
      return map[role] || role;
    },
    getGroupName(id) {
      const g = this.groups.find(x => x.id == id);
      return g ? g.name : '---';
    },
    getDepartmentName(id) {
      const d = this.departments.find(x => x.id == id);
      return d ? d.name : '---';
    },
    getTeacherName(id) {
      const t = this.teachers.find(x => x.id == id);
      return t ? t.name : '---';
    },

    // === ФІЛЬТРИ ДЛЯ СТУДЕНТА І ВИКЛАДАЧА ===
    // Знаходимо групу поточного студента
    getStudentGroupName(userId) {
      const s = this.students.find(st => st.user_id == userId);
      return s ? this.getGroupName(s.group_id) : 'Не визначено';
    },
    
    getMyStudentSchedule() {
      // 1. Знаходимо запис студента по user_id
      const student = this.students.find(s => s.user_id == this.currentUser.id);
      if (!student) return [];
      // 2. Фільтруємо розклад по group_id студента
      return this.schedule.filter(sch => sch.group_id == student.group_id);
    },

    getMyTeacherSchedule() {
      // 1. Знаходимо запис викладача по user_id
      const teacher = this.teachers.find(t => t.user_id == this.currentUser.id);
      if (!teacher) return [];
      // 2. Фільтруємо розклад по teacher_id
      return this.schedule.filter(sch => sch.teacher_id == teacher.id);
    }
  }
}
</script>

<style>
/* Стилі залишаємо ті самі, вони гарні */
body { font-family: 'Segoe UI', sans-serif; background: #f0f2f5; margin: 0; }
header { background: #2c3e50; color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; }
.auth-container { display: flex; justify-content: center; padding-top: 50px; }
.card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.1); width: 350px; }
.auth-tabs { display: flex; margin-bottom: 20px; border-bottom: 1px solid #eee; }
.auth-tabs button { flex: 1; padding: 10px; border: none; background: none; cursor: pointer; color: #777; font-weight: bold; }
.auth-tabs button.active { border-bottom: 2px solid #2c3e50; color: #2c3e50; }
.input-field { width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; }
.select-input { background: white; }
.action-btn { width: 100%; padding: 10px; background: #42b983; color: white; border: none; border-radius: 4px; cursor: pointer; margin-top: 10px; }
.error-text { color: red; text-align: center; margin-top: 10px; }
.main-content { max-width: 1000px; margin: 20px auto; padding: 20px; background: white; border-radius: 8px; }
.tabs { margin-bottom: 20px; display: flex; gap: 10px; }
.tabs button { padding: 8px 15px; border: 1px solid #ddd; background: #f9f9f9; cursor: pointer; border-radius: 4px; }
.tabs button.active { background: #42b983; color: white; border-color: #42b983; }
.add-btn { background: #28a745; color: white; border: none; padding: 8px 12px; border-radius: 4px; cursor: pointer; float: right; }
.del-btn { background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer; }
.logout-btn { background: rgba(255,255,255,0.2); color: white; border: none; padding: 5px 15px; border-radius: 4px; cursor: pointer; }
table { width: 100%; border-collapse: collapse; margin-top: 10px; }
th, td { border: 1px solid #eee; padding: 10px; text-align: left; }
th { background: #f1f1f1; }
.schedule-creator { background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 20px; border: 1px solid #eee; }
.form-row { display: flex; gap: 10px; margin-bottom: 10px; }
.info-block { margin-bottom: 30px; border: 1px solid #eee; padding: 15px; border-radius: 6px; }
.form-page { max-width: 400px; margin: 0 auto; }
.save-btn { background: #28a745; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; margin-right: 10px; }
.cancel-btn { background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; }
</style>
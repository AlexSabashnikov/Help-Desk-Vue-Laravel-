<template>
  <div v-if="visible" class="profile-modal-backdrop">
    <UIIcons ref="uiIcons" />
    <DeleteNotification ref="deleteUserModal" />
    <SuccessNotification ref="successUserModal" />
    <div class="profile-modal" aria-modal="true" :aria-label="modalTitle" ref="modalRoot">
      <header class="modal-header">
        <h2 class="modal-title">{{ modalTitle + ' - ' + modalMainUser }}</h2>
        <div class="header-right">
          <template v-if="isEditing && mode !== 'create'">
            <button class="save-btn" @click="onSave" title="Сохранить изменения">
              <Icon :icon="uiIcons?.icons.save" width="20" height="20" /> Сохранить изменения
            </button>
          </template>
          <template v-else-if="isEditing && mode === 'create'">
            <button class="save-btn" @click="onSave" title="Применить">
              <Icon :icon="uiIcons?.icons.save" width="20" height="20" /> Применить
            </button>
          </template>
          <template v-else>
            <button type="button" class="btn" @click="enterEdit" v-if="canEdit && mode !== 'create' && mode !== 'view'">Редактировать</button>
          </template>
          <button class="close-btn" @click="close" title="Закрыть">
            <Icon :icon="uiIcons?.icons.close" class="close-btn-icon" width="36" height="36" />
          </button>
        </div>
      </header>

      <div class="modal-body">
          <!-- Режим просмотра - используем UILabel -->
          <template v-if="!isEditing">
            <div class="user-section">
              <h3 class="subheading">Основная информация</h3>
              <div class="form-grid">
            <UILabel v-model="form.lastName" label="Фамилия" :show-empty-indicator="true" />      
            <UILabel :modelValue= getPhoneLabel(form.phone) label="Телефон" :show-empty-indicator="true" />            
            <UILabel :modelValue="organizationDisplay" label="Организация" :show-empty-indicator="true" />            
            <UILabel v-model="form.firstName" label="Имя" :show-empty-indicator="true" />
            <UILabel v-model="form.email" label="Email" :show-empty-indicator="true" />
            <UILabel v-model="form.roleName" label="Роль" :show-empty-indicator="true" />
            <UILabel v-model="form.middleName" label="Отчество" :show-empty-indicator="true" />
            <UILabel v-model="form.login" label="Логин" :show-empty-indicator="true" />
            <UILabel v-model="form.object" label="Объект" :show-empty-indicator="true" />
            </div>
          </div>
          </template>

          <!-- Режим редактирования/создания - используем UIInput, UISelect, UIComboBox -->
          <template v-else>
            <!-- Фамилия -->
            <div class="user-section">
              <h3 v-if="mode==='create'" class="subheading">Укажите данные пользователя</h3>
              <h3 v-else-if="mode==='user'" class="subheading">Основная информация</h3>
              <div class="form-grid">
            <div class="form-row">
              <UIInput
                ref="lastNameInput"
                v-model="form.lastName"
                label="Фамилия"
                :show-char-count="false"
                :max-length="30"
                placeholder="Введите фамилию"
                :required="true"
              />
            </div>

            <!-- Телефон -->
            <div class="form-row">
              <UIInput
                ref="phoneInput"
                v-model="form.phone"
                label="Телефон"
                type="tel"
                placeholder="Введите телефон"
                :max-length="20"
                :required="false"
              />
            </div>

            <!-- Организация (ComboBox для выбора из существующих) -->
            <div class="form-row">
              <UIComboBox
                ref="organizationInput"
                v-model="form.organization"
                :return-object="true"
                :options="[]"
                label="Организация"
                option-label="name"
                option-value="id"
                placeholder="Введите или выберите организацию"
                :search-debounce= 1000
                :max-length="30"
                :required="true"
                :load-options="getOrgOptions"
                :disabled="canEditAdmin"
              />
            </div>
            
            <!-- Имя -->
            <div class="form-row">
              <UIInput
                ref="firstNameInput"
                v-model="form.firstName"
                label="Имя"
                :max-length="30"
                placeholder="Введите имя"
                :required="true"
              />
            </div>

            <!-- Email -->
            <div class="form-row">
              <UIInput
                ref="emailInput"
                v-model="form.email"
                label="Email"
                type="email"
                :max-length="80"
                placeholder="Введите email"
                :required="true"
              />
            </div>
            
            <!-- Роль (в режиме редактирования может быть недоступна) -->
            <div class="form-row">
              <UISelect
                ref="roleInput"
                v-model="form.roleId"
                :options="roleOptions"
                label="Роль"
                :placeholder="rolePlaceholder"
                :required="true"
                :disabled="canEditRole"
              />
            </div>

            <!-- Отчество -->
            <div class="form-row">
              <UIInput
                ref="middleNameInput"
                v-model="form.middleName"
                label="Отчество"
                placeholder="Введите отчество"
                :max-length="30"
                :required="false"
              />
            </div>
            
            <!-- Login -->
            <div class="form-row">
              <UIInput
                ref="loginInput"
                v-model="form.login"
                label="Логин"
                :show-char-count="false"
                :max-length="30"
                :min-length="4"
                placeholder="Введите логин"
                :required="true"
              />
            </div>
            
            <!-- Объект (ComboBox для выбора из существующих) -->
            <div class="form-row">
              <UIComboBox
                ref="objectInput"
                v-model="form.object"
                :return-object="true"
                :options="[]"
                label="Объект"
                option-label="name"
                option-value="id"
                :placeholder="objectPlaceholder"
                :max-length="30"
                :search-debounce= 1000
                :disabled="canEditObject"
                :load-options="getObjectOptions"
              />
            </div>
            </div>
            </div>
          </template>
        </div>

        <div class="modal-actions">
          <template v-if="!isEditing">
            <button type="button" class="btn danger" v-if="mode === 'self'" @click="onLogout">Выйти из системы</button>
          </template>
          <template v-else-if="mode !== 'create'">
            <button type="button" class="btn primary" @click="passwordEdit">
              <Icon :icon="uiIcons?.icons.editPassword" width="20" height="20" /> Изменить пароль
            </button>
            <button type="button" class="btn" @click="cancelEdit" :disabled="saving">Отменить изменения</button>
            <button type="button" class="btn danger" v-if="mode !== 'self' && !canEditAdmin" @click.stop="deleteUser" title="Удалить пользователя">
              <Icon :icon="uiIcons?.icons.deleteOutline" width="20" height="20" /> Удалить
            </button>
          </template>
          <template v-else>
            <button type="button" class="btn" @click="resetForm">
              <Icon :icon="uiIcons?.icons.reload" width="20" height="20" />Сбросить
            </button>
          </template>
        </div>
        <PasswordModal
          v-model="showPasswordModal"
          :title="passwordModalTitle"
          :mode="passwordModalMode"
          :user-data="pendingUserData"
          @userCreated="handleUserCreated"
          @passwordChanged="handlePasswordChanged"
          @cancel="handlePasswordModalCancel"
        />
      </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import PasswordModal from './PasswordModal.vue'
import { useUsersStore } from '@/stores/users.store'
import { getUserRole, getUserId } from '@/utils/auth.utils'
import { useAuthStore } from '@/stores/auth.store'
import { getOrgOptions, getObjectOptions, getRolesOptions } from '@/utils/select.options.utils'
import UIInput from '../common/UI/UIInput.vue'
import UISelect from '../common/UI/UISelect.vue'
import UILabel from '../common/UI/UILabel.vue'
import UIComboBox from '../common/UI/UIComboBox.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'
import DeleteNotification from '@/components/notifications/DeleteNotification.vue'
import SuccessNotification from '@/components/notifications/SuccessNotification.vue'

const uiIcons = ref()

const deleteUserModal = ref()
const successUserModal = ref()

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'self' }, // 'self', 'user', 'create', 'view'
  userId: { type: [Number, String, null], default: null },
  user: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'saved', 'created'])

// Refs для полей ввода
const lastNameInput = ref(null)
const firstNameInput = ref(null)
const middleNameInput = ref(null)
const phoneInput = ref(null)
const emailInput = ref(null)
const loginInput = ref(null)
const roleInput = ref(null)
const organizationInput = ref(null)
let oldOrg = null
const objectInput = ref(null)

// Модальное окно пароля
const showPasswordModal = ref(false)
const pendingUserData = ref(null)
const passwordModalMode = ref('create')
const passwordModalTitle = computed(() => {
  return passwordModalMode.value === 'create' ? 'Создание пароля' : 'Изменение пароля'
})

// Метод для открытия модального окна изменения пароля
function passwordEdit() {
  const payload = payloadCreate(form)
  payload.user_id = form.id
  pendingUserData.value = payload
  console.log("User Data: ", pendingUserData)
  passwordModalMode.value = 'edit'
  showPasswordModal.value = true
}

const authStore = useAuthStore()
const usersStore = useUsersStore()

const visible = ref(props.modelValue)
watch(() => props.modelValue, (v) => {
  visible.value = v
  if (v) loadData()
  else resetState()
})
watch(visible, (v) => emit('update:modelValue', v))


const isEditing = ref(props.mode === 'create')
const saving = ref(false)
const serverError = ref(null)

const form = reactive({
  id: null,
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  login: '',
  phone: '',
  organization: null,
  object: null,
  roleId: null, 
  roleName: '',
})
const formClone = {
  id: null,
  firstName: '',
  lastName: '',
  middleName: '',
  email: '',
  login: '',
  phone: '',
  organization: null,
  object: null,
  roleId: null, 
  roleName: '',
}



// Функция для загрузки ролей организации
const loadOrganizationRoles = async (organization) => {
  if (!organization) {
    // Если организация не выбрана, показываем все возможные роли
    roleOptions.value = getRolesOptions()
    return
  }
  
  // Если у организации есть свои роли, используем их
  if (organization.user_roles && organization.user_roles.length > 0) {
    roleOptions.value = organization.user_roles.map(role => ({
      value: role.id,
      label: role.name
    }))
  } else {
    // Иначе показываем стандартные роли
    roleOptions.value = getRolesOptions()
  }
}

// Следим за изменением организации
watch(() => form.organization, async (newOrg) => {
  if (!newOrg) {
    form.object = null
    form.roleId = null
    roleOptions.value = getRolesOptions()
  } else {
    // Загружаем роли для выбранной организации
    await loadOrganizationRoles(newOrg)
    // Сбрасываем выбранную роль при смене организации
    if(oldOrg !== newOrg){
      form.roleId = null
    }
  }
}, { deep: true })

// Опции для выпадающих списков
const roleOptions = ref([])

const modalTitle = computed(() => {
  let title
  if (props.mode === 'self') 
    title = 'Мой профиль '
  else if (props.mode === 'create') 
    title = 'Создание пользователя'
  else
    title = 'Профиль пользователя '
  return title
})

const modalMainUser = computed(() => {
  if(props?.user?.user_id === 1){
    return 'Основной пользователь'
  }
  return ''
})

const organizationDisplay = computed(() => {
  oldOrg = form.organization
  return form.organization?.name || ''
})

const getPhoneLabel = (phone) => {
  if(phone){
    let phoneLabel = phone.slice(0, 2) + " " + phone.slice(2, 5) + " " + 
      phone.slice(5, 8) + "-" + phone.slice(8, 10) + "-" + phone.slice(10, 12)
    return phoneLabel
  }
  return "Не указан"
}
const canEditSuperAdmin = computed(() => {
  if(props?.user?.user_id === 1){
    if(getUserId() === 1){
      return true
    }
    else{
      return false
    }
  }
  return false
})

const canEditAdmin = computed(() => {
  if(props?.user?.user_id === 1){
    return true
  }
  else if(props.mode !== 'create' && getUserRole() !== 'admin'){
    return true
  }
  return false
})

const canEditRole = computed(() => {
  if(getUserRole() !== 'admin' || props?.user?.user_id === 1 || !form.organization){
    return true
  }
  return false
})

const canEditObject = computed(() => {
  if(!form.organization || form.roleId !== 4){
    return true
  }
  return false
})

const objectPlaceholder = computed(() => {
  if(!form.organization){
    return 'Сначала выберите организацию' 
  }
  else if(form.roleId !== 4){
    return 'Доступно только для роли "Клиент"'
  }
  else{
    return 'Введите или выберите объект'
  }
})

const rolePlaceholder = computed(() => {
  return !form.organization 
    ? 'Сначала выберите организацию' 
    : 'Выберите роль'
})

const canEdit = computed(() => {
  if(canEditSuperAdmin.value){
    return true
  }
  else {
    if(props?.user?.user_id === 1){
      return false
    }
    else {
      return props.mode === 'self' || props.mode === 'create' || getUserRole() === 'admin'
    }
  }
})

async function loadData() {
  serverError.value = null

  // Если режим создания, просто сбрасываем форму
  if (props.mode === 'create') {
    resetForm()
    isEditing.value = true
    return
  }

  isEditing.value = false
  try {
    if (props.mode === 'self') {
      if (authStore.user) {
        fillForm(authStore.user)
        return
      }
      const res = await usersStore.getProfile()
      const payload = (res && (res.user || res)) || null
      if (!payload) throw new Error('Не удалось получить профиль')
      fillForm(payload)
    } else {
      if (props.user) {
        fillForm(props.user)
      } else {
        serverError.value = 'Не указан пользователь'
        return
      }
    }
    await nextTick()
  } catch (err) {
    serverError.value = (err && err.message) || 'Ошибка загрузки'
  }
}

function fillForm(userData) {

  if (!userData) return
  console.log("Заполнение профиля ", userData)
  form.id = userData?.user_id ?? null
  form.firstName = userData?.first_name
  form.lastName = userData?.last_name
  form.middleName = userData?.middle_name
  form.email = userData?.email || ''
  form.login = userData?.login || ''
  form.phone = userData?.phone_number?.phone_number || null

  if (userData?.organization) {
    // Создаем объект организации с ID и названием
    form.organization = {
      id: userData.organization.id,
      name: userData.organization.name,
      user_roles: userData.organization.user_roles || []
    }
    form.organization_id = userData.organization.id
    
    // Загружаем роли для этой организации
    loadOrganizationRoles(form.organization)
  } else {
    form.organization = null
    form.organization_id = null
  }
  
  form.object = null
  form.object_id = null

  form.roleId = userData?.role_id || userData?.role?.id || null
  
  // Для отображения в UILabel
  if (form.roleId) {
    form.roleName = getRoleNameFromId(form.roleId)
  }
  cloneForm()
}

function cloneForm(){
  formClone.id = form.id
  formClone.firstName = form.firstName
  formClone.middleName = form.middleName
  formClone.lastName = form.lastName
  formClone.email = form.email
  formClone.login = form.login
  formClone.phone = form.phone
  formClone.organization = form.organization
  formClone.object_id = null
  formClone.roleId = form.roleId
}

function validatePayload(payload, clone){
  if(payload.id === clone.id &&
  payload.first_name === clone.first_name &&
  payload.middle_name === clone.middle_name &&
  payload.last_name === clone.last_name &&
  payload.email === clone.email &&
  payload.login === clone.login &&
  payload.phone_number === clone.phone_number &&
  payload.organization === clone.organization &&
  payload.object === clone.object &&
  payload.roleId === clone.roleId){
    return true
  }
  return false
}

function getRoleNameFromId(roleId) {
  if (!roleId) return null
  switch (Number(roleId)) {
    case 1: return 'Администратор'
    case 2: return 'Диспетчер'
    case 3: return 'Инженер'
    case 4: return 'Клиент'
    default: return null
  }
}

function enterEdit() {
  if (!canEdit.value) return
  isEditing.value = true
  
  // Сбрасываем ошибки при входе в режим редактирования
  nextTick(() => {
    clearAllErrors()
  })
}

function cancelEdit() {
  isEditing.value = false
  if (props.mode === 'create') {
    close()
  } else {
    loadData()
  }
}

// Сброс всех ошибок
function clearAllErrors() {
  const inputs = [
    lastNameInput,
    firstNameInput,
    middleNameInput,
    phoneInput,
    emailInput,
    loginInput,
    organizationInput
  ]
  
  if (canEditRole.value) {
    inputs.push(roleInput)
  }
  
  inputs.forEach(input => {
    if (input.value && typeof input.value.clearError === 'function') {
      input.value.clearError()
    }
  })
}

function validateAll() {
  const inputs = [
    lastNameInput,
    firstNameInput,
    middleNameInput,
    phoneInput,
    emailInput,
    loginInput,
    organizationInput
  ]
  
  if (canEditRole.value) {
    inputs.push(roleInput)
  }
  
  let isValid = true
  const errors = []
  
  for (const input of inputs) {
    if (input.value && typeof input.value.validate === 'function') {
      const fieldValid = input.value.validate()
      
      if (!fieldValid) {
        isValid = false
        // Можно собрать информацию об ошибках для логирования
        if (input.value.errorMessage) {
          errors.push({
            field: input.value.label || 'Поле',
            error: input.value.errorMessage
          })
        }
      }
    }
  }
  
  if (!isValid && errors.length > 0) {
    console.debug('Ошибки валидации:', errors)
  }
  
  return isValid
}

function payloadCreate(form){
  const payload = {
      first_name: form.firstName,
      middle_name: form.middleName,
      last_name: form.lastName,
      email: form.email,
      login: form.login,
      organization: form.organization?.id || form.organization_id,
      object: form.object?.id || form.object_id || null
    }

    if(form.phone){
      payload.phone_number = "+" + form.phone.replace(/\D/g, '')
    }
    else{
      payload.phone_number = ''
    }
    
    if (form.roleId) {
      payload.role = form.roleId  // Число 1,2,3,4
    } else {
      payload.role = null
    }
    return payload
}

async function onSave() {
  if (!validateAll()) {
    return
  }
  
  saving.value = true
  serverError.value = null
  
  try {
    const payload = payloadCreate(form)
    const payloadClone = payloadCreate(formClone)
    console.log("Payload: ", payload, "  clone: ", payloadClone)
    if(validatePayload(payload, payloadClone)){
      close()
      return
    }

    let res
    let confirmed
    
    if (props.mode === 'create') {
      console.log("Данные пользователя для создания: ", payload)
      
      // Сохраняем данные пользователя для последующего создания
      pendingUserData.value = payload
      passwordModalMode.value = 'create'
      
      // Закрываем режим сохранения
      saving.value = false
      console.log("Открываем окно паролей")
      // Открываем модальное окно для ввода пароля
      showPasswordModal.value = true
    } else if (props.mode === 'self') {
      payload.user_id = form.id
      console.log("Отправка на сервер при изменении профиля: ", payload)
      res = await usersStore.updateProfile(payload)
      const updatedUser = (res && (res.user || res)) || null
      if (updatedUser) {
        authStore.user = updatedUser
        localStorage.setItem('user', JSON.stringify(updatedUser))
        confirmed = await successUserModal.value.open({
        title: '',
        mainMessage: 'Профиль успешно изменен',
        type: 'success',
        })
      }
      if(confirmed){
        isEditing.value = false
        await loadData()
        close()
      }
    } else {
      payload.user_id = form.id
      console.log("Отправка на сервер при редактировании пользователя: ", payload)
      res = await usersStore.updateUserById(payload)
      if(!res.validator_fails){
        confirmed = await successUserModal.value.open({
        title: '',
        mainMessage: 'Пользователь успешно изменен',
        type: 'success',
        })
      }
      else{
        await successUserModal.value.open({
        title: '',
        mainMessage: 'Ошибка при изменении пользователя. Пользователь не изменен',
        type: 'notSuccess',
        })
      }
      if(confirmed){
        isEditing.value = false
        await loadData()
        close()
        emit('saved', res)
      }
    }
  } catch (err) {
    serverError.value = (err && err.message) || 'Ошибка сохранения'
    let confirmed
    console.log("Ошибка: ", err)
    confirmed = await successUserModal.value.open({
      title: '',
      mainMessage: 'Ошибка при изменении пользователя. Пользователь не изменен',
      type: 'notSuccess',
    })
    if(confirmed){
      saving.value = false
    }
    
    
    // Обработка ошибок с сервера
    if (err?.response?.status === 422) {
      const d = err.response.data
      const fieldErrors = d?.errors || d?.validator_fails || {}
      
      // Устанавливаем ошибки в соответствующие поля
      if (fieldErrors.first_name && firstNameInput.value) {
        firstNameInput.value.setError?.(fieldErrors.first_name[0])
      }
      if (fieldErrors.last_name && lastNameInput.value) {
        lastNameInput.value.setError?.(fieldErrors.last_name[0])
      }
      if (fieldErrors.middle_name && middleNameInput.value) {
        middleNameInput.value.setError?.(fieldErrors.middle_name[0])
      }
      if (fieldErrors.email && emailInput.value) {
        emailInput.value.setError?.(fieldErrors.email[0])
      }
      if (fieldErrors.login && loginInput.value) {
        loginInput.value.setError?.(fieldErrors.login[0])
      }
      if (fieldErrors.organization && organizationInput.value) {
        organizationInput.value.setError?.(fieldErrors.organization[0])
      }
      if (fieldErrors.phone && phoneInput.value) {
        phoneInput.value.setError?.(fieldErrors.phone[0])
      }
    }
  } finally {
    saving.value = false
  }
}

async function handleUserCreated(res) {
  let confirmed
  if(!res.validator_fails){
    confirmed = await successUserModal.value.open({
      title: '',
      mainMessage: 'Пользователь успешно создан',
      type: 'success',
    })
  }
  if(confirmed){
    await loadData()
    emit('created', res)
    showPasswordModal.value = false
    close()
  }
  if(res.validator_fails){
    confirmed = await successUserModal.value.open({
      title: '',
      mainMessage: 'Ошибка при создании пользователя. Пользователь не создан',
      type: 'notSuccess',
    })
  }
  if(confirmed){
    showPasswordModal.value = false
  }
}

// Обработчик успешного изменения пароля
async function handlePasswordChanged(res) {
  let confirmed
  if(!res.validator_fails){
    confirmed = await successUserModal.value.open({
      title: '',
      mainMessage: 'Пароль успешно изменен',
      type: 'success',
    })
  }
  if(confirmed){
    showPasswordModal.value = false
  }
  if(res.validator_fails){
    confirmed = await successUserModal.value.open({
      title: '',
      mainMessage: 'Ошибка при изменении пароля. Пароль не изменен',
      type: 'notSuccess',
    })
  }
  if(confirmed){
    showPasswordModal.value = false
  }
}

// Обработчик отмены
function handlePasswordModalCancel() {
  showPasswordModal.value = false
}

function resetForm() {
  form.id = null
  form.firstName = ''
  form.lastName = ''
  form.middleName = ''
  form.email = ''
  form.login = ''
  form.phone = ''
  form.organization = null 
  form.object = null
  form.roleId = null
  form.roleName = ''
  form.createdAt = null
}

function resetState() {
  isEditing.value = props.mode === 'create'
  saving.value = false
  serverError.value = null
  resetForm()
  clearAllErrors()
}

function close() {
  visible.value = false
}

async function onLogout() {
  try {
    await authStore.clearAuthData()
    close()
  } catch (e) {
    console.error('logout error', e)
  }
}

const deleteUser = async () => {
  let confirmed
  if(form.first_name && form.last_name){
    confirmed = await deleteUserModal.value.open({
      title: 'Удаление пользователя',
      mainMessage: 'Вы действительно хотите удалить пользователя ',
      secondaryMessage: form.first_name + " " + form.last_name + "?"
    })
  }
  else{
    confirmed = await deleteUserModal.value.open({
      title: 'Удаление пользователя',
      mainMessage: 'Вы действительно хотите удалить пользователя?',
      secondaryMessage: ''
    })
  }
  if (confirmed) {
    console.log("Отправка на сервер при удалении пользователя: ", form.id)
    const payload = {}
    payload.user_id = form.id
    await usersStore.deleteUser(payload)
    isEditing.value = false
    await loadData()
    close()
  }
}
</script>

<style scoped>
.profile-modal-backdrop {
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.45); 
  display:flex; 
  align-items:center; 
  justify-content:center; 
  z-index:1500;
}
.profile-modal { 
  width: 65%; 
  max-height: 650px; 
  min-height: 350px; 
  background: #fff; 
  border-radius:8px; 
  padding: 10px 16px 16px 16px;
  overflow:none; 
  box-shadow:0 20px 50px rgba(0,0,0,.2); 
}
.modal-header { 
  display:flex; 
  justify-content:space-between; 
  align-items:center; 
  margin-bottom:14px; 
}
.modal-title { 
  font-size:18px; 
  margin:0; 
}

.header-right {
  display: flex;
  align-items: center;
  gap: 10px;
}

.save-btn {
  background: #3cc93a;
  color: white;
  border: none;
  padding: 4px 12px;
  border-radius: 16px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s;
}

.save-btn:hover {
  background: #34bb32;
  transform: scale(1.03);
}

.close-btn {
  background: rgba(255, 255, 255, 0.1);
  color: rgb(46, 46, 46);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border:none;
  cursor: pointer;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  margin-left: 6px;
}

.close-btn:hover {
  transform: scale(1.1);
}

.close-btn-icon:hover {
  color: rgb(255, 19, 19);
}

.user-section{
  border: 1px solid rgb(218, 218, 218);
  border-radius: 6px;
  background-color: #fafafa;
  padding: 8px;
}

.subheading {
  margin: 2px 0 6px;
  font-size: 14px;
  color: #374151;
}

.form-grid { 
  display:grid; 
  grid-template-columns: 1fr 1fr 1fr; 
  gap: 18px;
}
.form-row { 
  display:flex; 
  flex-direction:column; 
}

.form-row :deep(.ui-input),
.form-row :deep(.ui-select-custom),
.form-row :deep(.ui-combobox-input) {
  width: 100%;
}

.form-row.has-error :deep(.ui-input),
.form-row.has-error :deep(.ui-select-custom),
.form-row.has-error :deep(.ui-combobox-input) {
  border-color: #b00020;
}

.form-row :deep(.ui-select-wrapper),
.form-row :deep(.ui-combobox-wrapper),
.form-row :deep(.ui-input-wrapper) {
  display: flex;
  flex-direction: column;
}

/* Фиксируем высоту поля ввода */
.form-row :deep(.ui-select-custom),
.form-row :deep(.ui-combobox-input),
.form-row :deep(.ui-input-field) {
  height: 30px !important;
  min-height: 30px !important;
  box-sizing: border-box;
}

.modal-actions { 
  margin-top: 34px; 
  display:flex; 
  gap:18px; 
  justify-content:flex-end; 
}
.field-error { 
  color:#b00020; 
  font-size:12px; 
  margin-top:4px; 
}
.server-error { 
  color:#b00020; 
  margin-top:10px; 
}
.btn { 
  padding:4px 10px; 
  border-radius:6px; 
  cursor:pointer; 
  border:1px solid rgba(0,0,0,0.08);
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.btn:hover{
  transform: scale(1.03);
}
.btn.primary { 
  background:#178aee; 
  color:#fff; 
  border:none; 
}
.btn.danger { 
  background:#ef4444; 
  color:#fff; 
  border:none; 
}

/* Стили для UILabel в режиме просмотра */
:deep(.ui-label-content) {
  min-height: 30px;
}

.field-warning {
  color: #2563eb;
  font-size: 12px;
  margin-top: 4px;
}
</style>
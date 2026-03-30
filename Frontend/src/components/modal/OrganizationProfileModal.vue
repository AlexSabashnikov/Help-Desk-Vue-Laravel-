<template>
  <UIIcons ref="uiIcons" />
  <div v-if="visible" class="org-modal-backdrop" @keydown.esc="close" tabindex="-1" role="dialog" aria-modal="true">
    <div class="org-modal" ref="modalRoot" role="document" :aria-label="modalTitle">
      <header class="modal-header">
        <h2 class="modal-title">{{ modalTitle }}</h2>
        <div class="header-right">
          <template v-if="isEditing">
            
            <button class="save-btn" @click="onSave" title="Сохранить изменения">
              <Icon :icon="uiIcons?.icons.save" width="24" height="24" /> Сохранить изменения
            </button>
          </template>
          <template v-else>
            <button type="button" class="btn" @click="enterEdit" v-if="canEdit">Редактировать</button>
          </template>
          <button class="close-btn" @click="close" title="Закрыть">
            <Icon :icon="uiIcons?.icons.close" class="close-btn-icon" width="36" height="36" />
          </button>
        </div>
      </header>

      <div class="org-modal__body">
        <!-- Режим просмотра -->
        <template v-if="!isEditing">
          <div class="org-grid">
            <!-- Левая колонка: Офисы в режиме просмотра -->
            <aside class="org-offices">
              <OrganizationsOfficesTable
                :objects="localOrg.objects"
                :mode="'view'"
                @editOffice="onEditOfficeEvent"
              />
            </aside>
            <!-- Правый блок - информация об организации в режиме просмотра -->
            <section class="org-main">
              <div class="org-section">
              <h3 class="subheading">Реквизиты организации</h3>
              <UILabel v-model="localOrg.name" label="Название организации" :show-empty-indicator="true" />
              
              <div class="two-columns">
                <UILabel :modelValue="getOrgTypeLabel(localOrg.type_org)" label="Тип организации" :show-empty-indicator="true" />
                <UILabel :modelValue="getAgentTypeLabel(localOrg.type_agent)" label="Тип агента" :show-empty-indicator="true" />
              </div>

              <div class="three-columns">
                <UILabel v-model="localOrg.inn" label="ИНН" :show-empty-indicator="true" />
                <UILabel v-model="localOrg.kpp" label="КПП" :show-empty-indicator="true" />
                <UILabel v-model="localOrg.ogrn" label="ОГРН" :show-empty-indicator="true" />
              </div>

              <UILabel v-model="localOrg.legal_address" label="Юридический адрес" :show-empty-indicator="true" />
              </div>
              <div class="bank-section">
                <h3 class="subheading">Банковские реквизиты</h3>
                <UILabel v-model="localOrg.bank_details.bank_name" label="Банк" :show-empty-indicator="true" />
                <div class="two-columns">
                  <UILabel v-model="localOrg.bank_details.bik" label="БИК" :show-empty-indicator="true" />
                  <UILabel v-model="localOrg.bank_details.account" label="Расчетный счет" :show-empty-indicator="true" />
                </div>
                <UILabel v-model="localOrg.bank_details.corr_account" label="Корр. счет" :show-empty-indicator="true" />
              
            </div>
            </section>

            
          </div>
        </template>

        <!-- Режим редактирования -->
        <template v-else>
          <div class="org-grid">
            <!-- Левая колонка: Офисы в режиме редактирования -->
            <aside class="org-offices">
              <OrganizationsOfficesTable
                :objects="localOrg.objects"
                :mode="'edit'"
                @update:objects="onOfficesUpdate"
                @editOffice="onEditOfficeEvent"
                @addOffice="onAddOfficeEvent"
                @setMain="onSetMainEvent"
              />
            </aside>
            <!-- Правый блок - информация об организации в режиме редактирования -->
            <section class="org-main">
              <div class="org-section">
              <h3 class="subheading">Реквизиты организации</h3>
              <UIInput
                v-model="localOrg.name"
                label="Название организации"
                required
                :maxLength="150"
                :customClass="'mb-8'"
                ref="nameField"
              />

              <div class="two-columns">
                <UISelect
                  v-model="localOrg.type_org"
                  :options="orgTypeOptions"
                  label="Тип организации"
                  placeholder="Выберите тип"
                />
                <UISelect
                  v-model="localOrg.type_agent"
                  :options="agentTypeOptions"
                  label="Тип агента"
                  placeholder="Юр/Физ"
                />
              </div>

              <div class="three-columns">
                <UIInput v-model="localOrg.inn" label="ИНН" />
                <UIInput v-model="localOrg.kpp" label="КПП" />
                <UIInput v-model="localOrg.ogrn" label="ОГРН" />
              </div>

              <UITextarea
                v-model="localOrg.legal_address"
                label="Юридический адрес"
                :rows="2"
                :max-length="80"
                :minHeight="'52px'"
                :maxHeight="'52px'"
              />
            </div>

              <div class="bank-section">
                <h3 class="subheading">Банковские реквизиты</h3>
                <UIInput v-model="localOrg.bank_details.bank_name" label="Банк" />
                <div class="two-columns">
                  <UIInput v-model="localOrg.bank_details.bik" label="БИК" />
                  <UIInput v-model="localOrg.bank_details.account" label="Расчетный счет" />
                </div>
                <UIInput v-model="localOrg.bank_details.corr_account" label="Корр. счет" />
              </div>
              <div class="org-modal__footer">
                <div class="left-actions"></div>
                <div class="right-actions">
                  <template v-if="isEditing">
                    <button type="button" class="btn" @click="cancelEdit" :disabled="saving">Отменить изменения</button>
                    <button type="button" class="btn danger" v-if="mode === 'edit'" @click="onDelete" :disabled="saving">Удалить</button>
                  </template>
                </div>
              </div>
            </section>
           

            
          </div>
        </template>

        <div v-if="serverError" class="server-error">{{ serverError }}</div>

        
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, nextTick } from 'vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import UISelect from '@/components/common/UI/UISelect.vue'
import UILabel from '@/components/common/UI/UILabel.vue'
import UITextarea from '@/components/common/UI/UITextarea.vue'
import { Icon } from '@iconify/vue'
import UIIcons from '@/components/common/UI/UIIcons.vue'
import OrganizationsOfficesTable from '@/components/tables/OrganizationsOfficesTable.vue'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  mode: { type: String, default: 'view' }, // 'view', 'edit', 'create'
  organization: { type: Object, default: null },
})
const emit = defineEmits(['update:modelValue', 'saved', 'deleted'])

const uiIcons = ref()
const visible = ref(Boolean(props.modelValue))
const isEditing = ref(props.mode === 'create' || props.mode === 'edit')
const saving = ref(false)
const serverError = ref(null)
const nameField = ref(null)

watch(() => props.modelValue, (v) => {
  visible.value = v
  if (v) openAndLoad()
  else resetState()
})
watch(visible, (v) => emit('update:modelValue', v))

const localOrg = reactive({
  id: null, 
  name: '', 
  type_agent: null, 
  type_org: null, 
  inn: '', 
  kpp: '', 
  ogrn: '',
  legal_address: '', 
  bank_details: { bank_name: '', bik: '', account: '', corr_account: '' },
  notes: '', 
  objects: []
})

// Опции для выпадающих списков
const orgTypeOptions = [
  { value: 1, label: 'Заказчик' },
  { value: 2, label: 'Подрядчик' },
  { value: 3, label: 'Наша компания' },
]

const agentTypeOptions = [
  { value: 1, label: 'Юридическое лицо' },
  { value: 2, label: 'Физическое лицо' },
]

// Вспомогательные функции для получения меток
const getOrgTypeLabel = (value) => {
  const option = orgTypeOptions.find(opt => opt.value === value)
  return option ? option.label : ''
}

const getAgentTypeLabel = (value) => {
  const option = agentTypeOptions.find(opt => opt.value === value)
  return option ? option.label : ''
}

const modalTitle = computed(() => {
  if (props.mode === 'create') return 'Создание организации'
  if (isEditing.value) return `Редактирование организации`
  return `Профиль организации — ${localOrg.name || ''}`
})

const canEdit = computed(() => {
  return props.mode === 'create' || props.mode === 'edit'
})

function openAndLoad() {
  serverError.value = null
  saving.value = false

  const src = props.organization || null
  if (!src || props.mode === 'create') {
    resetForm()
    isEditing.value = props.mode === 'create'
    nextTick(() => nameField?.value?.focus?.())
    return
  }

  const cloned = JSON.parse(JSON.stringify(src))
  cloned.bank_details = cloned.bank_details || { bank_name: '', bik: '', account: '', corr_account: '' }
  cloned.objects = Array.isArray(cloned.objects) ? cloned.objects.map(o => ({
    id: o.id ?? null,
    name: o.name ?? '',
    address: o.address ?? '',
    is_main: Boolean(o.is_main),
    contacts: Array.isArray(o.contacts) ? o.contacts.map(c => ({ 
      id: c.id ?? null, 
      full_name: c.full_name ?? '', 
      phone: c.phone ?? '', 
      email: c.email ?? '', 
      is_main: Boolean(c.is_main) 
    })) : []
  })) : []
  
  Object.assign(localOrg, cloned)
  isEditing.value = false
  nextTick(() => nameField?.value?.focus?.())
}

function resetForm() {
  Object.assign(localOrg, {
    id: null, name: '', type_agent: null, type_org: null, inn: '', kpp: '', ogrn: '',
    legal_address: '', bank_details: { bank_name: '', bik: '', account: '', corr_account: '' },
    notes: '', objects: []
  })
}

function resetState() {
  isEditing.value = props.mode === 'create'
  saving.value = false
  serverError.value = null
  resetForm()
}

function enterEdit() {
  if (!canEdit.value) return
  isEditing.value = true
}

function cancelEdit() {
  isEditing.value = false
  if (props.mode === 'create') {
    close()
  } else {
    openAndLoad()
  }
}

// Обработчики для таблицы офисов
const onOfficesUpdate = (newObjects) => {
  localOrg.objects = JSON.parse(JSON.stringify(newObjects || []))
}

const onEditOfficeEvent = (office, index) => {
  // В режиме просмотра просто открываем информацию о контактах
  // В режиме редактирования открываем редактор офиса
  emit('editOffice', office, index)
}

const onAddOfficeEvent = () => {
  // Обработка добавления офиса
}

const onSetMainEvent = (office) => {
  if (office) {
    localOrg.objects.forEach(o => {
      o.is_main = (o.id === office.id)
    })
  }
}

const onSave = async () => {
  serverError.value = null
  
  if (isEditing.value) {
    if (!localOrg.name || !localOrg.name.trim()) {
      serverError.value = 'Название организации обязательно'
      return
    }
  }
  
  saving.value = true
  try {
    const payload = JSON.parse(JSON.stringify(localOrg))
    emit('saved', payload)
    isEditing.value = false
    if (props.mode === 'create') {
      close()
    }
  } catch(err) {
    console.error(err)
    serverError.value = (err && err.message) || 'Ошибка сохранения'
  } finally {
    saving.value = false
  }
}

const onDelete = async () => {
  if (!props.organization) return
  if (!confirm('Удалить организацию? Это действие необратимо.')) return
  emit('deleted', props.organization.id || null)
  close()
}

const close = () => {
  visible.value = false
}
</script>

<style scoped>
.org-modal-backdrop {
  position: fixed; 
  inset: 0; 
  z-index: 2200; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  background: rgba(0,0,0,0.45);
}

.org-modal {
  width: calc(min(90vw, 1200px));
  max-width: 1600px;
  max-height: 84vh;
  overflow-y: auto;
  overflow-x: none;
  scrollbar-width: thin;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 30px 80px rgba(3,20,50,0.35);
  display: flex;
  flex-direction: column;
}

.modal-header {
  background: #ffffff;
  position: sticky;
  top: 0;
  z-index: 15;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 20px;
  border-bottom: 2px solid #969696;
  border-radius: 12px 12px 0 0;
}

.modal-title {
  font-size: 18px;
  margin: 0;
  color: #0b1630;
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
  border: none;
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

.org-modal__body {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.org-grid {
  display: grid;
  grid-template-columns: 6fr 4fr;
  gap: 12px;
  align-items: start;
}

.org-main {
  min-width: 0;
  max-width: 500px;
}

.org-section{
  border: 1px solid rgb(218, 218, 218);
  border-radius: 6px;
  background-color: #f7f7f7;
  padding: 8px;
}

.org-offices {
  border: 1px solid rgb(218, 218, 218);
  border-radius: 6px;
  background-color: #f7f7f7;
  padding: 8px;
}

.two-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 6px;
}

.three-columns {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 10px;
  margin-bottom: 6px;
}

.bank-section {
  margin: 12px 0;
  border: 1px solid rgb(218, 218, 218);
  border-radius: 6px;
  background-color: #f7f7f7;
  padding: 8px;
}

.subheading {
  margin: 2px 0 6px;
  font-size: 14px;
  color: #374151;
}

.server-error {
  color: #b00020;
  margin: 8px 0;
  font-weight: 600;
}

.org-modal__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0 4px;
  gap: 8px;
}

.right-actions {
  margin-top: 10px;
  display: flex;
  gap: 16px;
  align-items: center;
}

.left-actions .muted {
  color: #6b7280;
  font-size: 13px;
}

.btn {
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid rgba(0,0,0,0.08);
  transition: all 0.2s;
  font-size: 14px;
}

.btn:hover {
  transform: scale(1.05);
}

.btn.primary {
  background: #2563eb;
  color: #fff;
  border: none;
}

.btn.danger {
  background: #ef4444;
  color: #fff;
  border: none;
}

@media (max-width: 1200px) {
  .org-grid {
    grid-template-columns: 1fr;
  }
  .org-modal {
    width: calc(100% - 24px);
  }
}
</style>
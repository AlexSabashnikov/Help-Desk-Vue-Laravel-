<template>
  <div class="ticket-section">
    <div class="ticket-section-header">
      <h3>Блок дополнительной информации</h3>
    </div>

    <div class="additional-block-content">
        <!-- Левая колонка: Материалы, адрес, расстояние, время -->
      <div class="column column-left">
        <!-- Компонент таблицы материалов -->
        <MaterialsTable 
          :ticket="ticket"
          :mode="mode"
          :userRole="userRole"
          @materialChange="handleMaterialChange"
        />
        <template v-if="ticket.type === 'onsite'">
            <div class="info-block-create">
                <UILabel 
                    :modelValue="ticket.address"
                    label="Адрес объекта"
                    emptyText="Не указан"
                />
            </div>
            <div class="horizontal-row">
                <div class="info-block-create horizontal-item">
                    <UILabel 
                        :modelValue="ticket.distance"
                        label="Расстояние до объекта"
                        emptyText="Не указано"
                    />
                </div>
            <div class="info-block-create horizontal-item">
                <UILabel 
                    :modelValue="ticket.estimatedTravelTime"
                    label="Примерное время в пути"
                    emptyText="Не рассчитано"
                />
            </div>
        </div>

            <div class="map-placeholder">
                <span>Карта будет отображаться в данном режиме</span>
            </div>
        </template>
      </div>


      <!-- Правая колонка: Исполнитель, даты, стоимость -->
      <div class="column column-right">
        <div class="info-block-create">
          <UIComboBox 
            :modelValue="ticket.executor.name"
            @update:modelValue="value => onFieldChange('executor', value)"
            :options="executorOptions"
            optionLabel="name"
            optionValue="id"
            placeholder="Выберите исполнителя..."
            label="Исполнитель"
          />
        </div>

        <div class="info-block-create">
          <UIInput 
            :modelValue="formatDateTimeLocal(ticket.workStart)"
            @update:modelValue="value => onFieldChange('workStart', value)"
            label="Начало работы"
            type="datetime-local"
          />
        </div>

        <div class="info-block-create">
          <UIInput 
            :modelValue="formatDateTimeLocal(ticket.workEnd)"
            @update:modelValue="value => onFieldChange('workEnd', value)"
            label="Окончание работы"
            type="datetime-local"
          />
        </div>

        <div class="info-block-create">
          <UIInput 
            :modelValue="ticket.workCost"
            @update:modelValue="value => onFieldChange('workCost', value)"
            label="Стоимость работ"
            type="number"
            placeholder="Введите стоимость..."
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import MaterialsTable from '@/components/tables/MaterialsTable.vue'
import UIComboBox from '@/components/common/UI/UIComboBox.vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import UILabel from '@/components/common/UI/UILabel.vue'

// Импорт утилит
import { formatDateTimeLocal } from '@/utils/date.utils'
import { getExecutorOptions } from '@/utils/select.options.utils'
import { 
  handleFieldChange, 
  handleMaterialChange as handleMaterialChangeUtil,
  createTicketValidators 
} from '@/utils/form.utils'

const props = defineProps({
  ticket: {
    type: Object,
    required: true,
  },
  mode: {
    type: String,
    default: 'view',
  },
  userRole: {
    type: String,
    default: 'guest',
  },
})

const emit = defineEmits(['fieldChange', 'materialChange'])
// Используем функции для получения опций
const executorOptions = getExecutorOptions()

const validators = createTicketValidators(props.ticket)

// Обработчик изменения полей
const onFieldChange = (field, value) => {
  handleFieldChange(emit, field, value, validators)
}

// Обработчик изменения материалов
const handleMaterialChange = (updatedMaterials) => {
  handleMaterialChangeUtil(emit, updatedMaterials)
}
</script>

<style scoped>
.ticket-section {
  background: #fcfcfc;
  border: 1px solid #031432;
  border-radius: 12px;
  overflow: hidden;
  box-sizing: border-box;
  padding-bottom: 10px;
}

/* Заголовок секции */
.ticket-section-header {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 15px;
  color: white;
  border-radius: 10px 10px 0 0;
  background: #031432;
  box-sizing: border-box;
}

.ticket-section-header h3 {
  margin: 0;
  color: #ffffff;
  font-size: 16px;
}

/* Контейнер для содержимого */
.additional-block-content {
  display: grid;
  grid-template-columns: 5fr 2fr;
  padding: 15px;
  gap: 40px;
  align-items: start;
}

/* Колонки */
.column {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.column-left {
  grid-column: 1;
}

.column-right {
  grid-column: 2;
}

.horizontal-row {
  display: flex;
  gap: 15px;
  width: 100%;
}

.horizontal-row .horizontal-item {
  flex: 1;
  min-width: 0;
}

/* Блоки информации */
.info-block-create {
  display: flex;
  flex-direction: column;
  width: 100%;
  flex: 0;
  min-height: 45px;
}

/* Placeholder для карты */
.map-placeholder {
  margin-top: 20px;
  padding: 20px;
  background-color: #f8f9fa;
  border: 1px dashed #dee2e6;
  border-radius: 8px;
  text-align: center;
  color: #6c757d;
  font-style: italic;
}

/* Блок материалов */
.materials-block {
  background: #fcfcfc;
  box-sizing: border-box;
}

.materials-header {
  color: rgb(126, 126, 126);
  font-size: 12px;
}

.block-label {
  color: #8c8c8c;
  font-size: 12px;
  font-weight: 500;
}

/* Таблица материалов */
.materials-table {
  border: 1px solid rgb(152, 152, 152);
  border-radius: 10px;
  overflow: hidden;
  background: white;
  box-sizing: border-box;
  overflow: auto;
  scrollbar-width: none;
  scrollbar-color: rgb(152, 152, 152) rgba(0, 0, 0, 0);
  max-height: 300px;
}

.materials-row {
  display: grid;
  grid-template-columns: 4fr 2fr 1fr 2fr;
  font-size: 14px;
  align-items: center;
  min-height: 36px;
  padding: 6px 0px 6px 6px;
  gap: 5px;
  border-bottom: 1px solid rgb(152, 152, 152);
  box-sizing: border-box;
  position: relative;
}

.materials-row:has(.actions-col) {
  grid-template-columns: 12fr 3fr 2fr 3fr 1fr;
}

.materials-row:last-child {
  border-bottom: none;
}

.header-row {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #031432;
  border-bottom: 1px solid #031432;
  position: sticky;
  z-index: 10;
  top: 0;
}

.material-col {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.name-col {
  color: #212529;
}

.price-one-col {
  color: #212529;
}

.quantity-col {
  color: #212529;
}

.price-col {
  color: #212529;
  font-weight: 500;
}

/* Кнопки действий с материалами (только для Edit) */
.actions-col {
  display: flex;
  justify-content: flex-end;
  padding-right: 6px;
}

.material-action-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.remove-button {
  color: #dc3545;
}

.remove-button:hover {
  background-color: rgba(220, 53, 69, 0.1);
}

/* Кнопка добавления материала (только для Edit) */
.add-material-row {
  background-color: #f8f9fa;
  cursor: pointer;
  border-bottom: none;
  border-bottom: 1px solid rgb(152, 152, 152);
}

.add-button-col {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  padding: 0px 0;
}

.add-material-button {
  background: none;
  border: 1px dashed #6c757d;
  color: #6c757d;
  padding: 2px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.add-material-button:hover {
  background-color: #e9ecef;
  border-color: #007bff;
  color: #007bff;
}

/* Строка итогов */
.total-row {
  background-color: #f8f9fa;
  font-weight: 500;
}

.total-label-col {
  color: #212529;
  font-weight: 500;
}

.total-col {
  color: #2846a7;
  font-weight: 500;
  font-size: 14px;
  text-align: right;
  padding: 0px 6px 0px 0px;
}
</style>
<template>
    <!-- Материалы -->
    <template v-if="mode === 'view'">
    <div v-if="materialStatus(ticket.status, ticket.materials)" class="materials-block">
      <div class="materials-header">
        <span class="block-label">Материалы</span>
      </div>
      
      <div class="materials-table">
        <div class="materials-row header-row">
          <div class="material-col name-col">Наименование</div>
          <div class="material-col price-one-col">Цена шт.</div>
          <div class="material-col quantity-col">Кол-во</div>
          <div class="material-col price-col">Сумма</div>
        </div>

        <div v-for="(material, index) in ticket.materials" :key="index" class="materials-row">
            <div class="material-col name-col">{{ material.name }}</div>
            <div class="material-col price-one-col">{{ material.unitPrice }} р.</div>
            <div class="material-col quantity-col">{{ material.quantity }} шт.</div>
            <div class="material-col price-col">{{ material.total }} р.</div>
        </div>
        
        <div v-if="ticket.materials && ticket.materials.length > 0" class="materials-row total-row">
          <div class="material-col"></div>
          <div class="material-col"></div>
          <div class="material-col total-label-col">Итого:</div>
          <div class="material-col total-col">{{ calculateTotalMaterials() }} р.</div>
        </div>
      </div>
    </div>
    </template>

    <template v-else>
    <div v-if="materialStatus(ticket.status, ticket.materials)" class="materials-block">
      <div class="materials-header">
        <span class="block-label">Материалы</span>
      </div>
      
      <div class="materials-table">
        <div class="materials-row header-row">
          <div class="material-col name-col">Наименование</div>
          <div class="material-col price-one-col">Цена шт.</div>
          <div class="material-col quantity-col">Кол-во</div>
          <div class="material-col price-col">Сумма</div>
          <div class="material-col actions-col"></div>
        </div>

        <!-- Динамические строки материалов -->
        <div v-for="(material, index) in ticket.materials" :key="index" class="materials-row">
          <div class="material-col name-col">
            <UIInput 
              :modelValue="material.name"
              @update:modelValue="value => updateMaterial(index, 'name', value)"
              :showHeader="false"
              type="text"
              customClass="material-input"
              placeholder="Введите материал"
            />
          </div>
          <div class="material-col price-one-col">
            <UIInput 
              :modelValue="material.unitPrice"
              @update:modelValue="value => updateMaterial(index, 'unitPrice', value)"
              @blur="() => calculateMaterialTotal(index)"
              :showHeader="false"
              placeholder="Цена"
              type="number"
              customClass="material-input"
              :min="0"
              :step="0.1"
            />
          </div>
          <div class="material-col quantity-col">
            <UIInput 
              :modelValue="material.quantity"
              @update:modelValue="value => updateMaterial(index, 'quantity', value)"
              @blur="() => calculateMaterialTotal(index)"
              :showHeader="false"
              placeholder="Кол-во"
              type="number"
              customClass="material-input"
              :min="1"
              :step="1"
            />
          </div>
          <div class="material-col price-col">
            <UILabel 
              :modelValue="`${material.total} p.`"
              :showHeader="false"
              customClass="material-total"
            />
          </div>
          <div class="material-col actions-col">
            <button 
              class="material-action-button remove-button"
              @click="removeMaterial(index)"
              title="Удалить материал"
            >
              ×
            </button>
          </div>
        </div>
        
        <!-- Кнопка добавления материала -->
        <div class="materials-row add-material-row">
          <div class="material-col add-button-col">
            <button 
              class="add-material-button"
              @click="addMaterial"
            >
              + Добавить материал
            </button>
          </div>
        </div>
        
        <!-- Строка итогов -->
        <div v-if="ticket.materials && ticket.materials.length > 0" class="materials-row total-row">
            <div class="material-col"></div>
            <div class="material-col"></div>
            <div class="material-col total-label-col">Итого:</div>
            <div class="material-col total-col">{{ calculateTotalMaterials() }} р.</div>
        </div>
      </div>
    </div>
    </template>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'
import UIInput from '@/components/common/UI/UIInput.vue'
import UILabel from '@/components/common/UI/UILabel.vue'

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

// Статусы при которых можно назначить ТМЦ
const materialStatus = (ticketStatus, materials) => {
  if (props.mode === 'edit' || props.mode === 'create') {
    return true
  }
  if (ticketStatus === 'new' || (materials && materials.length === 0)) {
    return false
  }
  return true
}


// Функции для работы с материалами
const addMaterial = () => {
  const newMaterial = {
    name: '',
    unitPrice: 0,
    quantity: 1,
    total: 0
  }
  
  const updatedMaterials = [...(props.ticket.materials || []), newMaterial]
  emit('materialChange', updatedMaterials)
}

const removeMaterial = (index) => {
  const updatedMaterials = [...props.ticket.materials]
  updatedMaterials.splice(index, 1)
  emit('materialChange', updatedMaterials)
}

const updateMaterial = (index, field, value) => {
  const updatedMaterials = [...props.ticket.materials]
  updatedMaterials[index] = {
    ...updatedMaterials[index],
    [field]: field === 'quantity' ? parseInt(value) || 1 : 
             field === 'unitPrice' ? parseFloat(value) || 0 : 
             value
  }
  emit('materialChange', updatedMaterials)
}

const calculateMaterialTotal = (index) => {
  const updatedMaterials = [...props.ticket.materials]
  const material = updatedMaterials[index]
  material.total = (material.unitPrice * material.quantity)
  emit('materialChange', updatedMaterials)
}

const calculateTotalMaterials = () => {
  if (!props.ticket.materials || props.ticket.materials.length === 0) return '0.00'
  
  const total = props.ticket.materials.reduce((sum, material) => {
    return sum + (parseFloat(material.total) || 0)
  }, 0)
  
  return total.toFixed(2)
}

</script>
<style scoped>

/* Блок материалов */
.materials-block {
  background: #fcfcfc;
  box-sizing: border-box;
  margin-top: 5px;
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
  border: 1px solid #b6b6b6;
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
  grid-template-columns: 12fr 3fr 2fr 4fr 1fr; /* Добавлена колонка для кнопки */
}

.materials-row:last-child {
  border-bottom: none;
}

.header-row {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #1f1f1f;
  border-bottom: 1px solid #031432;
  position: sticky;
  z-index: 8;
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
}

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
  background-color: #ffffff;
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
  color: #8e8e8e;
  padding: 2px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.add-material-button:hover {
  background-color: #ffffff;
  border-color: #007bff;
  color: #007bff;
}

/* Строка итогов */
.total-row {
  background-color: #ffffff;
  font-weight: 500;
}

.total-label-col {
  color: #212529;
  align-items: center;
  font-weight: 500;
  text-align: right;
}

.total-col {
  color: #2846a7;
  font-weight: 500;
  font-size: 14px;
  margin-right: 20px;
  text-align: right;
}
</style>
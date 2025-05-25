<template>
    <div v-if="show">
        <h3>{{ title }}</h3>
        <ul>
            <li v-for="item in items" :key="item.id">
                <label>
                    <input
                    type="checkbox"
                    :value="item.id"
                    v-model="selected"
                    />
                    <span>{{ formatName(item) }}</span>
                </label>
            </li>
        </ul>
        <AppButton
        :label="submitLabel"
        icon="✅"
        type="create"
        :disabled="selected.length === 0"
        @clicked="submit"/>
    </div>
</template>

<script>
import AppButton from './AppButton.vue';

export default {
    name:'AddParticipantsForm',
    props:{
        show:{
            type: Boolean,
            required: true
        },
        items:{
            type:Array,
            required:true
        },
        formatName:{
            type:Function,
            required:true
        },
        title:{
            type:String,

            required:true
        },
        submitLabel:{
            type:String,
            required:true
        }
    },
    data(){
        return{
            selected:[]
        }
    },
    methods:{
        submit(){
            this.$emit('submit', this.selected)
            this.selected=[]
        }
    },
    components:{AppButton}
}

</script>
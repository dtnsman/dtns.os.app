<template>
    <div class="attr-list">
        <CommonAttr></CommonAttr>
        <el-form>
            <el-form-item label="请求地址">
                <el-input v-model="curComponent.propValue" type="textarea" :rows="3" />
            </el-form-item>
        </el-form>
    </div>
</template>

<script>
import CommonAttr from '@/custom-component/common/CommonAttr.vue'

export default {
    components: { CommonAttr },
    computed: {
        curComponent() {
            return this.$store.state.curComponent
        },
    },
}
</script>

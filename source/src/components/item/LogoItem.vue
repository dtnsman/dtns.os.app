<template>
    <div style="width: 100%;height: 100%;">
        <img v-if="logo" style="height: 100%;width: 100%;" v-lzlogo="logo"/>
        <img v-if="!logo" style="height: 100%;width: 100%;" :src="nmImg"/>
    </div>
</template>
<script>
import nmImg from "../../assets/images/nm.png";
export default {
    name: 'LogoItem',
    components: {
      },
    props: {
        logo: {
            type: String,
            required: true,
            default: null,
        },
    },
    data() {
        return {
            errMsg:'',
            nmImg:nmImg,
        }
    },
    beforeCreate() {
    },
    async created() {
        // console.log('into LogoItem.created')
        // this.restore()
    },
    async mounted()
    {
    },
}
</script>

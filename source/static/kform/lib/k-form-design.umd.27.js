((typeof self !== 'undefined' ? self : this)["webpackJsonpk_form_design"] = (typeof self !== 'undefined' ? self : this)["webpackJsonpk_form_design"] || []).push([[27],{

/***/ "20f6":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"5d16e32a-vue-loader-template"}!./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./packages/components/KSelectInputList/selectInputList.vue?vue&type=template&id=ce8e3206&
var render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c('a-form-model', {
    ref: "dynamicValidateForm",
    staticClass: "select-input-list-box",
    attrs: {
      "layout": "inline",
      "model": _vm.dynamicValidateForm
    }
  }, _vm._l(_vm.record.columns, function (column, i) {
    return _c('div', {
      key: i,
      staticClass: "list-col"
    }, [_c('a-form-model-item', {
      staticClass: "w-auto"
    }, [_vm.record.options.multiple ? _c('CheckboxItem', {
      attrs: {
        "checked": _vm.dynamicValidateForm.domains[i].checked
      },
      on: {
        "change": function change($event) {
          return _vm.onCheckboxChange($event, i);
        }
      }
    }, [_vm._v(" " + _vm._s(column.label) + " ")]) : _c('RadioItem', {
      attrs: {
        "checked": _vm.dynamicValidateForm.domains[i].checked
      },
      on: {
        "change": function change($event) {
          return _vm.onRadioChange($event, i);
        }
      }
    }, [_vm._v(_vm._s(column.label))])], 1), _vm._l(column.list, function (item) {
      return _c('KFormModelItem', {
        key: item.key + '1',
        attrs: {
          "record": item,
          "config": _vm.config,
          "parentDisabled": _vm.disabled,
          "domains": _vm.dynamicValidateForm.domains[i],
          "dynamicData": _vm.dynamicData
        },
        on: {
          "input": _vm.handleInput
        },
        model: {
          value: _vm.dynamicValidateForm.domains[i][item.model],
          callback: function callback($$v) {
            _vm.$set(_vm.dynamicValidateForm.domains[i], item.model, $$v);
          },
          expression: "dynamicValidateForm.domains[i][item.model]"
        }
      });
    })], 2);
  }), 0);
};
var staticRenderFns = [];

// CONCATENATED MODULE: ./packages/components/KSelectInputList/selectInputList.vue?vue&type=template&id=ce8e3206&

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom.iterable.js
var web_dom_iterable = __webpack_require__("ac6a");

// EXTERNAL MODULE: ./packages/components/KFormModelItem/KFormModelItem.vue + 4 modules
var KFormModelItem = __webpack_require__("44e6");

// EXTERNAL MODULE: ./packages/utils/index.js + 7 modules
var utils = __webpack_require__("e74d");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./packages/components/KSelectInputList/selectInputList.vue?vue&type=script&lang=js&



var CheckboxItem = utils["c" /* pluginManager */].getComponent("checkboxItem").component;
var RadioItem = utils["c" /* pluginManager */].getComponent("radioItem").component;
/* harmony default export */ var selectInputListvue_type_script_lang_js_ = ({
  name: "KSelectInputList",
  props: ["record", "value", "dynamicData", "config", "parentDisabled"],
  components: {
    KFormModelItem: KFormModelItem["a" /* default */],
    CheckboxItem: CheckboxItem,
    RadioItem: RadioItem
  },
  watch: {
    value: {
      // value 需要深度监听及默认先执行handler函数
      handler: function handler(val) {
        var initValue = val || [];
        if (!initValue.length) {
          this.record.columns.forEach(function (item) {
            var itemData = {};
            item.list.forEach(function (e) {
              return e.model && (itemData[e.model] = null);
            });
            itemData.checked = false;
            itemData.value = item.value;
            itemData.label = item.label;
            initValue.push(itemData);
          });
        }
        this.dynamicValidateForm.domains = initValue;
      },
      immediate: true,
      deep: true
    }
  },
  data: function data() {
    return {
      dynamicValidateForm: {
        domains: []
      }
    };
  },
  computed: {
    disabled: function disabled() {
      return this.record.options.disabled || this.parentDisabled;
    }
  },
  methods: {
    validationSubform: function validationSubform() {
      var verification;
      this.$refs.dynamicValidateForm.validate(function (valid) {
        verification = valid;
      });
      return verification;
    },
    resetForm: function resetForm() {
      this.$refs.dynamicValidateForm.resetFields();
    },
    onCheckboxChange: function onCheckboxChange(e, index) {
      this.dynamicValidateForm.domains[index].checked = e.target.checked;
      this.handleInput();
    },
    onRadioChange: function onRadioChange(e, index) {
      this.dynamicValidateForm.domains.forEach(function (item) {
        return item.checked = false;
      });
      this.dynamicValidateForm.domains[index].checked = e.target.checked;
      this.handleInput();
    },
    handleInput: function handleInput() {
      this.$emit("change", this.dynamicValidateForm.domains);
    }
  },
  mounted: function mounted() {
    this.handleInput();
  }
});
// CONCATENATED MODULE: ./packages/components/KSelectInputList/selectInputList.vue?vue&type=script&lang=js&
 /* harmony default export */ var KSelectInputList_selectInputListvue_type_script_lang_js_ = (selectInputListvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./packages/components/KSelectInputList/selectInputList.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  KSelectInputList_selectInputListvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var selectInputList = (component.exports);
// CONCATENATED MODULE: ./packages/components/KSelectInputList/index.js

/* harmony default export */ var KSelectInputList = __webpack_exports__["default"] = (selectInputList);

/***/ }),

/***/ "44e6":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js?{"cacheDirectory":"node_modules/.cache/vue-loader","cacheIdentifier":"5d16e32a-vue-loader-template"}!./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/babel-loader/lib!./node_modules/vue-loader/lib/loaders/templateLoader.js??ref--6!./node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./packages/components/KFormModelItem/KFormModelItem.vue?vue&type=template&id=71c8c476&
var render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _vm.record.options.noFormItem ? _c(_vm.componentItem, _vm._b({
    tag: "component"
  }, 'component', _vm.getComponentProps, false)) : _c('a-form-model-item', {
    attrs: {
      "prop": "domains.".concat(_vm.record.model),
      "rules": _vm.record.rules
    }
  }, [_c(_vm.componentItem, _vm._b({
    ref: "inputItem",
    tag: "component",
    on: {
      "change": _vm.handleChange
    }
  }, 'component', _vm.getComponentProps, false))], 1);
};
var staticRenderFns = [];

// CONCATENATED MODULE: ./packages/components/KFormModelItem/KFormModelItem.vue?vue&type=template&id=71c8c476&

// EXTERNAL MODULE: ./node_modules/core-js/modules/es7.object.get-own-property-descriptors.js
var es7_object_get_own_property_descriptors = __webpack_require__("8e6e");

// EXTERNAL MODULE: ./node_modules/core-js/modules/web.dom.iterable.js
var web_dom_iterable = __webpack_require__("ac6a");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.array.iterator.js
var es6_array_iterator = __webpack_require__("cadf");

// EXTERNAL MODULE: ./node_modules/core-js/modules/es6.object.keys.js
var es6_object_keys = __webpack_require__("456d");

// EXTERNAL MODULE: ./node_modules/@babel/runtime/helpers/esm/defineProperty.js
var defineProperty = __webpack_require__("ade3");

// EXTERNAL MODULE: ./packages/utils/index.js + 7 modules
var utils = __webpack_require__("e74d");

// CONCATENATED MODULE: ./node_modules/cache-loader/dist/cjs.js??ref--13-0!./node_modules/thread-loader/dist/cjs.js!./node_modules/babel-loader/lib!./node_modules/cache-loader/dist/cjs.js??ref--1-0!./node_modules/vue-loader/lib??vue-loader-options!./packages/components/KFormModelItem/KFormModelItem.vue?vue&type=script&lang=js&





function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { Object(defineProperty["a" /* default */])(target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
/*
 * author kcz
 * date 2019-11-20
 */


var _ = __webpack_require__("a6fb");
var ComponentArray = utils["c" /* pluginManager */].getComponents();
/* harmony default export */ var KFormModelItemvue_type_script_lang_js_ = ({
  name: "KFormModelItem",
  props: ["record", "domains", "index", "value", "parentDisabled", "dynamicData", "config"],
  computed: {
    /**
     * 计算组件props
     */
    getComponentProps: function getComponentProps() {
      var record = this.record;
      var componentProps = _objectSpread(_objectSpread({
        record: record
      }, this.componentOption), {}, {
        config: this.config,
        disabled: this.disabled || record.options.disabled,
        parentDisabled: this.disabled || record.options.disabled,
        allowClear: record.options.clearable,
        mode: record.options.multiple ? "multiple" : "",
        value: this.value || record.options.defaultValue,
        style: record.options.width && "width:".concat(record.options.width),
        height: typeof record.options.height !== "undefined" ? record.options.height : "",
        dynamicData: this.dynamicData,
        options: !record.options.dynamic ? record.options.options : this.dynamicData[record.options.dynamicKey] ? this.dynamicData[record.options.dynamicKey] : []
      });
      if (this.record.type === "textarea") {
        componentProps.autoSize = {
          minRows: record.options.minRows,
          maxRows: record.options.maxRows
        };
      }
      if (this.record.type === "alert") {
        componentProps.message = record.label;
      }
      if (this.record.type === "number") {
        componentProps.min = record.options.min || record.options.min === 0 ? record.options.min : -Infinity;
        componentProps.max = record.options.max || record.options.max === 0 ? record.options.max : Infinity;
        componentProps.precision = record.options.precision > 50 || !record.options.precision && record.options.precision !== 0 ? null : record.options.precision;
      }
      if (this.record.type === "select") {
        componentProps.filterOption = record.options.showSearch ? function (inputValue, option) {
          return option.componentOptions.children[0].text.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
        } : false;
      }
      return componentProps;
    },
    componentItem: function componentItem() {
      return ComponentArray[this.record.type].component;
    },
    componentOption: function componentOption() {
      return _.omit(this.record.options, ["defaultValue", "disabled"]);
    }
  },
  methods: {
    handleChange: function handleChange(e) {
      var value = e;
      if (e.target) {
        value = e.target.value;
      }
      this.$emit("input", value);
    }
  }
});
// CONCATENATED MODULE: ./packages/components/KFormModelItem/KFormModelItem.vue?vue&type=script&lang=js&
 /* harmony default export */ var KFormModelItem_KFormModelItemvue_type_script_lang_js_ = (KFormModelItemvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
var componentNormalizer = __webpack_require__("2877");

// CONCATENATED MODULE: ./packages/components/KFormModelItem/KFormModelItem.vue





/* normalize component */

var component = Object(componentNormalizer["a" /* default */])(
  KFormModelItem_KFormModelItemvue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ var KFormModelItem = __webpack_exports__["a"] = (component.exports);

/***/ })

}]);
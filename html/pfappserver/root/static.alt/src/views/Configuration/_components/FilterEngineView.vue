<template>
  <b-card class="h-100" no-body>
    <div class="card-body d-flex flex-column">
      <!-- Loading progress indicator -->
      <b-container class="my-5" v-if="isLoading && !filter">
        <b-row class="justify-content-md-center text-secondary">
          <b-col cols="12" md="auto">
            <icon name="circle-notch" scale="1.5" spin></icon>
          </b-col>
        </b-row>
      </b-container>
      <div class="flex-grow-1 overflow-hidden border-top border-right border-bottom border-left" ref="editorContainer" v-else>
        <ace-editor
          v-model="filter"
          :lang="mode"
          :theme="theme"
          :height="editorHeight"
          :options="editorOptions"
          @init="initEditor"
        ></ace-editor>
      </div>
    </div>
    <b-card-footer>
      <pf-button-save :disabled="invalidForm" :isLoading="isLoading" @click="save()">
        <template>{{ $t('Save') }}</template>
      </pf-button-save>
      <b-button :disabled="isLoading" class="ml-1" variant="outline-secondary" @click="init()">{{ $t('Reset') }}</b-button>
    </b-card-footer>
  </b-card>
</template>

<script>
import aceEditor from 'vue2-ace-editor'
import pfButtonSave from '@/components/pfButtonSave'

export default {
  name: 'filter-engine-view',
  components: {
    pfButtonSave,
    aceEditor
  },
  props: {
    id: {
      type: String,
      default: null
    }
  },
  data () {
    return {
      filter: '',
      editor: null,
      editorHeight: '0px',
      editorOptions: {
        enableLiveAutocompletion: true,
        showPrintMargin: false,
        tabSize: 4
      },
      parentNodes: []
    }
  },
  computed: {
    isLoading () {
      return this.$store.getters['$_filters/isLoading']
    },
    invalidForm () {
      return this.$store.getters['$_filters/isWaiting']
    },
    windowSize () {
      return this.$store.getters['events/windowSize']
    }
  },
  methods: {
    init () {
      this.$store.dispatch('$_filters/getFilter', this.id).then(filter => {
        this.filter = filter
      })
    },
    save () {
      this.$store.dispatch('$_filters/updateFilter', { id: this.id, filter: this.filter }).then(() => {
        this.$store.dispatch('notification/info', { message: this.$i18n.t('{filterName} filter saved', { filterName: this.id.toUpperCase() }) })
      })
    },
    initEditor (instance) {
      // Load ACE editor extensions
      require('brace/ext/language_tools')
      require('brace/ext/searchbox')
      require('brace/mode/ini')
      require('brace/theme/cobalt')
      this.editor = instance
      this.editor.setAutoScrollEditorIntoView(true)
      this.$nextTick(() => {
        this.resizeEditor()
      })
    },
    resizeEditor () {
      this.editorHeight = this.$refs.editorContainer.clientHeight + 'px'
      this.editor.resize()
    }
  },
  created () {
    this.init()
  },
  mounted () {
    if (this.parentNodes.length === 0) {
      // Find all parent DOM nodes
      let parentNode = this.$el.parentNode
      while (parentNode && 'classList' in parentNode) {
        this.parentNodes.push(parentNode)
        parentNode = parentNode.parentNode
      }
    }
    // Force all parent nodes to take 100% of the window height
    this.parentNodes.forEach(node => {
      node.classList.add('h-100')
    })
  },
  beforeDestroy () {
    // Remove height constraint on all parent nodes
    this.parentNodes.forEach(node => {
      node.classList.remove('h-100')
    })
  },
  watch: {
    windowSize: {
      handler: function (a, b) {
        if (a.clientWidth !== b.clientWidth || a.clientHeight !== b.clientHeight) {
          this.resizeEditor()
        }
      },
      deep: true
    }
  }
}
</script>

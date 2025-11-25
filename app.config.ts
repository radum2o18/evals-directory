export default defineAppConfig({
  ui: {
    icons: ['heroicons', 'simple-icons', 'lucide'],
    colors: {
      primary: 'emerald', // Accent color for CTAs and important elements
      secondary: 'neutral',
      neutral: 'neutral'
    },
    button: {
      defaultVariants: {
        color: 'neutral',
        variant: 'ghost'
      }
    },
    card: {
      defaultVariants: {
        color: 'neutral',
        variant: 'soft'
      }
    },
    header: {
      slots: {
        root: 'border-b border-default/30 h-(--ui-header-height) sticky top-0 z-50 bg-default'
      }
    }
  }
})



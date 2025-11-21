import type { ContentNavigationItem } from '@nuxt/content'
import { findPageBreadcrumb } from '@nuxt/content/utils'
import { mapContentNavigation } from '@nuxt/ui/utils/content'

export const useNavigation = () => {
  const navigation = inject<Ref<ContentNavigationItem[] | undefined>>('navigation')

  const breadcrumbFor = (path: Ref<string | undefined>) =>
    computed(() => {
      if (!navigation?.value || !path.value) {
        return []
      }

      const items = findPageBreadcrumb(navigation.value, path.value, { indexAsChild: true })
      return mapContentNavigation(items).map(({ icon, ...link }) => link)
    })

  return {
    navigation,
    breadcrumbFor
  }
}



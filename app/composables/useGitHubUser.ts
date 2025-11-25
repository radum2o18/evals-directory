interface GitHubUser {
  login: string
  avatar_url: string
  html_url: string
}

export const useGitHubUser = (username: MaybeRef<string | undefined>) => {
  const user = ref<GitHubUser | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const fetchUser = async (name: string) => {
    const cacheKey = `github-user-${name}`
    const nuxtApp = useNuxtApp()

    // Check payload cache first
    if (nuxtApp.payload.data[cacheKey]) {
      user.value = nuxtApp.payload.data[cacheKey]
      return
    }

    loading.value = true
    error.value = null

    try {
      const data = await $fetch<GitHubUser>(`https://api.github.com/users/${name}`, {
        headers: { Accept: 'application/vnd.github.v3+json' }
      })

      const userData: GitHubUser = {
        login: data.login,
        avatar_url: data.avatar_url,
        html_url: data.html_url
      }

      nuxtApp.payload.data[cacheKey] = userData
      user.value = userData
    }
    catch (e) {
      error.value = e as Error
      // Fallback if API fails
      const fallback: GitHubUser = {
        login: name,
        avatar_url: `https://github.com/${name}.png`,
        html_url: `https://github.com/${name}`
      }
      user.value = fallback
      nuxtApp.payload.data[cacheKey] = fallback
    }
    finally {
      loading.value = false
    }
  }

  watch(
    () => toValue(username),
    (newUsername) => {
      if (newUsername) {
        fetchUser(newUsername)
      }
      else {
        user.value = null
      }
    },
    { immediate: true }
  )

  return {
    user: readonly(user),
    loading: readonly(loading),
    error: readonly(error)
  }
}

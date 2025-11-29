export const useTagFilter = () => {
  const selectedTags = useState<string[]>('selectedTags', () => [])

  const addTag = (tag: string) => {
    if (!selectedTags.value.includes(tag)) {
      selectedTags.value = [...selectedTags.value, tag]
    }
  }

  const removeTag = (tag: string) => {
    selectedTags.value = selectedTags.value.filter(t => t !== tag)
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.value.includes(tag)) {
      removeTag(tag)
    } else {
      addTag(tag)
    }
  }

  const clearTags = () => {
    selectedTags.value = []
  }

  const hasTag = (tag: string) => selectedTags.value.includes(tag)

  return {
    selectedTags,
    addTag,
    removeTag,
    toggleTag,
    clearTags,
    hasTag
  }
}


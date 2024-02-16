const getAudiosData = () => {
  const allPosts = document.querySelectorAll('[data-tag=post-card]')

  return [...allPosts]
    .map(post => {
      const audio = post.querySelector('audio')

      if (audio) {
        const url = audio.src
        const name = post.querySelector('[data-tag=post-title]')?.textContent

        return { url, name }
      }
    })
    .filter(Boolean)
}

const downloadFromUrl = async (url, name) => {
  try {
    const response = await fetch(url)
    const blob = await response.blob()

    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `${name}.mp3`
    link.click()
  } catch (error) {
    console.error(`Error downloading ${name}: ${error.message}`)
  }
}

const downloadAll = async ({ batchSize, delayBetweenBatches }) => {
  const audios = getAudiosData()
  console.log(`Found ${audios.length} posts with audio files`)

  for (let i = 0; i < audios.length; i += batchSize) {
    const batch = audios.slice(i, i + batchSize)

    console.log(
      `Downloading batch #${i / batchSize + 1} of total ${Math.ceil(
        audios.length / batchSize
      )}`
    )

    await Promise.all(batch.map(({ url, name }) => downloadFromUrl(url, name)))

    if (i + batchSize < audios.length) {
      console.log('Waiting for next batch...')

      await new Promise(resolve => setTimeout(resolve, delayBetweenBatches))
    }
  }

  console.log('Download complete.')
}

// download by small batches with timeout, as browser can prevent doing this all at once
downloadAll({
  batchSize: 10,
  delayBetweenBatches: 1000,
})

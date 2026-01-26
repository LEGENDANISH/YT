const axios = require("axios")
const fs = require("fs")
const { BASE_URL, TOTAL_VIDEOS } = require("../config")

const tokens = Object.values(
  JSON.parse(fs.readFileSync("./data/tokens.json", "utf-8"))
)

const randomToken = () =>
  tokens[Math.floor(Math.random() * tokens.length)]

const run = async () => {
  for (let i = 1; i <= TOTAL_VIDEOS; i++) {
    const token = randomToken()

    try {
      const init = await axios.post(
        `${BASE_URL}/api/videos/upload/init`,
        {
          title: `Auto Video ${i}`,
          fileSize: Math.floor(Math.random() * 50_000_000) + 5_000_000, // 5–50 MB
          mimeType: "video/mp4",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const videoId = init.data.videoId

      await axios.post(
        `${BASE_URL}/api/videos/upload/complete`,
        { videoId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log(`🎬 Uploaded video ${i}`)
    } catch (err) {
      console.log(`❌ Upload failed ${i}`)
      console.log(err.response?.data)
    }
  }

  console.log("🎉 Upload script finished")
}

run()

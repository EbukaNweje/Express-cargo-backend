import express from "express"
import cors from "cors"
import trackingRoutes from "./routes/tracking.routes"

const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/tracking", trackingRoutes)

export default app

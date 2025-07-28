import mongoose from "mongoose";

mongoose.set('strictQuery',false);

const dbToConnect = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log("DB connected successfully")
    } catch (e) {
        console.error("❌ DB connection failed:", e.message);
        process.exit(1);
    }
}
export default dbToConnect
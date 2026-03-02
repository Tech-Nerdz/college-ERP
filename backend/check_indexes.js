import initModels from './models/index.js';
import connectDB from './config/db.js';

async function check() {
    await connectDB();
    const models = initModels();
    try {
        const indexes = await models.TimetableSlot.getIndexes();
        console.log("TimetableSlot Indexes:", indexes);
    } catch (e) { console.error(e) }

    try {
        const indexes2 = await models.Subject.getIndexes();
        console.log("Subject Indexes:", indexes2);
    } catch (e) { console.error(e) }
    process.exit();
}
check();

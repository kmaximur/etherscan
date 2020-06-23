import * as express from 'express';
import "./sequelize/connect";
import {router as apiRoutes} from "./routes/api";
import {runDemon} from './shared/demons/etherscanDemon'

runDemon()

const PORT: number = +process.env.PORT || 4008
const app = express();

app.use('/api', apiRoutes)
app.get('/', (req, res) => {
    res.send(`
        <h1>Hello!</h1>
        <a href="/api/biggest100">Найти кошелек, баланс которого изменился больше всех за последние 100 блоков</a>
        <br><br>
        <a href="/api/biggestdb">Найти кошелек, баланс которого изменился больше всех начиная с 9842805 блока</a>
    `)
})

app.listen(PORT, () => {
    console.log(`Server has been started on port:${PORT}`);
});




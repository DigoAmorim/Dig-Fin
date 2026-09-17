import 'dotenv/config';
import { app } from './src/App';
import { env } from './src/config/Env';

app.listen(env.port, () => {
    console.log(`Servidor rodando em http://localhost:${env.port}`);
});

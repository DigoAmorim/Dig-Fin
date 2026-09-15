// Importamos o Express e os tipos essenciais para criar nossa rota
import express = require('express');
import type { Request, Response } from 'express';

// Inicializamos o nosso aplicativo
const app = express();

// Definimos a porta de comunicação
const PORT = 3000;

// Criamos a nossa rota "Hello World"
// Sempre que alguém acessar a raiz ('/'), o servidor responderá com um texto
app.get('/', (req: Request, res: Response) => {
    res.send('Hello World do Backend em TypeScript!');
});

// Colocamos o servidor no ar e imprimimos um aviso no terminal
app.listen(PORT, () => {
    console.log(`Servidor rodando perfeitamente em http://localhost:${PORT}`);
});
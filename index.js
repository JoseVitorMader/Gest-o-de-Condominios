const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors');


const app = express();

app.use(express.static('public'));
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));



const db = mysql.createConnection({
    host: 'localhost', 
    user: 'root',  
    password: 'root', 
    database: 'GerenciaCondominio', 
    port: 3306 
});

db.connect((err) => {
    if (err) {
        console.error('Erro ao conectar ao banco de dados:', err);
    } else {
        console.log('Conectado ao banco de dados!');
    }
});

app.get("/", function(req, res){
    res.sendFile(__dirname + "/index.html");
}); 

app.get("/block/create", function(req, res){
    res.sendFile(__dirname + "/Pages/Block/Create/index.html");
});




app.get("/block/read", function(req, res) {
    let searchTerm = req.query.search || ""; 
   
    const listar = `SELECT * FROM blocos WHERE nome LIKE ? OR descricao LIKE ?`;

    db.query(listar, [`%${searchTerm}%`, `%${searchTerm}%`], function(err, rows) {
        if (!err) {
            console.log("Consulta de blocos realizada com sucesso!");

            res.send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head> 
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>SysCondomínio - Blocos</title>
                    <link rel="stylesheet" href="/style.css">
                    <link rel="stylesheet" href="/styleBlockCreate.css">
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                </head>
                <body>
                    <div class="app-container">
                        <header class="app-header">
                            <div class="logo">
                                <i class="fas fa-building"></i>
                                <h1>SysCondomínio</h1>
                            </div>
                            <div class="user-area">
                                <span>Síndico</span>
                                <img src="/Public/images/user-avatar.jpg" alt="Usuário">
                            </div>
                        </header>

                        <nav class="sidebar">
                            <ul class="menu">
                                <li><a href="/block/read" class="active"><i class="fas fa-cube"></i> Blocos</a></li>
                                <li><a href="/apartment/read"><i class="fas fa-door-open"></i> Apartamentos</a></li>
                                <li><a href="/resident/read"><i class="fas fa-users"></i> Moradores</a></li>
                            </ul>
                        </nav>

                        <main class="main-content">
                            <div class="page-header">
                                <h2><i class="fas fa-cube"></i> Blocos Cadastrados</h2>
                                <div class="actions">
                                    <a href="/block/create" class="btn-primary">
                                        <i class="fas fa-plus"></i> Novo Bloco
                                    </a>
                                    <a href="/" class="btn-primary">
                                        <i class="fas fa-backward"></i> Voltar
                                    </a>
                                </div>
                            </div>

                            <div class="search-container">
                                <div class="search-bar">
                                    <form method="GET" action="/block/read">
                                        <input type="text" name="search" id="searchInput" placeholder="Pesquisar blocos..." value="${searchTerm}">
                                        <button type="submit" id="searchBtn" class="btn-icon">
                                            <i class="fas fa-search"></i>
                                        </button>
                                    </form>
                                </div>
                            </div>

                            <div class="table-container">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>id</th>
                                            <th>Nome</th>
                                            <th>Descrição</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rows.map(row => `
                                            <tr>
                                                <td>${row.id}</td>
                                                <td>${row.nome}</td>
                                                <td>${row.descricao}</td>
                                                <td class="actions-cell">
                                                    <a href="/block/update?id=${row.id}" class="btn-icon">
                                                        <i class="fas fa-edit"></i>
                                                    </a>
                                                    <a href="/block/delete/${row.id}" class="btn-icon danger" onclick="return confirm('Tem certeza que deseja excluir este bloco?')">
                                                        <i class="fas fa-trash"></i>
                                                    </a>
                                                </td>
                                            </tr>
                                        `).join('')}
                                    </tbody>
                                </table>
                            </div>
                        </main>
                    </div>
                </body>
                </html>
            `);
        } else {
            console.log("Erro ao consultar blocos:", err);
            res.send(`
                <html>
                    <head>
                        <title>Erro</title>
                    </head>
                    <body>
                        <h1>Erro ao carregar blocos</h1>
                        <p>${err.message}</p>
                        <a href="/">Voltar</a>
                    </body>
                </html>
            `);
        }
    });
});


app.get('/block/delete/:id', function(req, res){
    const id = req.params.id;

    db.query('DELETE FROM blocos WHERE id = ?', [id], function(err, result){
        if (err) {
            console.log('Erro ao excluir o produto', err);
            res.status(500).send('Erro ao excluir o produto');
            return;
        }
    })
    console.log('Produto excluído com sucesso!');
    res.redirect('/block/read');
})


app.listen(3000, () => {
    console.log('Servidor rodando na url http://localhost:3000');
});
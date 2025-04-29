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
   
    const listar = `SELECT * FROM blocos WHERE descricao LIKE ? OR qtd_apartamentos LIKE ?`;

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
                                            <th>Descrição</th>
                                            <th>Quantidade de Apartamentos</th>
                                            <th>Ações</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        ${rows.map(row => `
                                            <tr>
                                                <td>${row.id}</td>
                                                <td>${row.descricao}</td>
                                                <td>${row.qtd_apartamentos}</td>
                                                <td class="actions-cell">
                                                    <a href="/block/update/${row.id}" class="btn-icon">
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

app.post('/block/create/block', function(req, res) {
    const descricao = req.body.descricao;
    const quantidadeApto = req.body.qtd_apartamentos;

    const values = [descricao, quantidadeApto];
    const insert = "INSERT INTO blocos (descricao, qtd_apartamentos) VALUES (?, ?)";

    db.query(insert, values, function(err, result) {
        if (!err) {
            console.log("Dados inseridos com sucesso!");
        } else {
            console.log("Erro ao inserir dados!", err);
            res.send("Erro ao inserir dados!");
        }
    })
})

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
});

app.get('/block/update/:id', function(req, res){
    const id = req.params.id;

    db.query('SELECT * FROM blocos WHERE id = ?', [id], function(err, result){
        if (err) {
            console.log('Erro ao editar o bloco', err);
            res.status(500).send('Erro ao editar o bloco');
            return;
        }
        res.send(`
            <html>
                <head> 
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title> SysCondomínio </title>
                    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                    <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }

                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        background-color: #f5f7fa;
                        color: #263238;
                        line-height: 1.6;
                        min-height: 100vh;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        padding: 2rem;
                    }

                    .header {
                        width: 100%;
                        max-width: 1200px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 2rem;
                    }

                    .container {
                        width: 100%;
                        max-width: 1200px;
                        display: flex;
                        flex-direction: column;
                        gap: 2rem;
                    }

                    h1 {
                        color: #1e88e5;
                        font-size: 2.5rem;
                        margin-bottom: 0.5rem;
                    }

                    h2 {
                        color: #1565c0;
                        font-size: 1.8rem;
                        margin-bottom: 1rem;
                    }

                    .card {
                        background-color: #ffffff;
                        border-radius: 8px;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                        padding: 2rem;
                        margin-bottom: 1rem;
                        width: 100%;
                        max-width: 600px;
                    }

                    .form-group {
                        display: flex;
                        flex-direction: column;
                        gap: 1.5rem;
                    }

                    .form-row {
                        display: grid;
                        grid-template-columns: 1fr;
                        gap: 1rem;
                    }

                    .input-group {
                        display: flex;
                        flex-direction: column;
                        gap: 0.5rem;
                    }

                    label {
                        font-weight: 500;
                        color: #1565c0;
                    }

                    input, textarea {
                        padding: 0.75rem;
                        border: 1px solid #e0e0e0;
                        border-radius: 4px;
                        font-size: 1rem;
                        background-color: #ffffff;
                        color: #263238;
                        width: 100%;
                    }

                    input:focus,
                    textarea:focus {
                        outline: none;
                        border-color: #1e88e5;
                        box-shadow: 0 0 0 2px rgba(30, 136, 229, 0.2);
                    }

                    button {
                        padding: 0.75rem 1.5rem;
                        background-color: #1e88e5;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        font-size: 1rem;
                        font-weight: 500;
                        cursor: pointer;
                        transition: all 0.2s ease;
                        margin-top: 1rem;
                    }

                    button:hover {
                        background-color: #1565c0;
                        transform: translateY(-1px);
                    }

                    @media (max-width: 768px) {
                        body {
                            padding: 1rem;
                        }
                        
                        .card {
                            padding: 1rem;
                        }
                    }
                    </style>
                </head>
                <body>
                <header class="header">
                    <div>
                        <h1><i class="fas fa-building"></i> SysCondomínio</h1>
                        <p class="tagline">Gerenciamento de Condomínio</p>
                    </div>
                </header>
                <main class="container">
                    <section class="card">
                    <h2> Editar Bloco </h2>
                    <form action="/block/update/${id}" method="POST">
                        <div class="form-group">
                            <div class="input-group">
                                <label for="descricao">Descrição do Bloco:</label>
                                <input type="text" id="descricao" name="descricao" value="${result[0].descricao}" required>
                            </div>
                            
                            <div class="input-group">
                                <label for="descricao">Quantidade de Apartamentos:</label>
                                <textarea id="qtd_apartamentos" name="qtd_apartamentos">${result[0].qtd_apartamentos || ''}</textarea>
                            </div>
                            
                            <button type="submit">
                                <i class="fas fa-save"></i> Atualizar
                            </button>
                        </div>
                    </form>
                    </section>
                </main>
                </body>
            </html>
        `);
    })
});

app.post('/block/update/:id', function(req, res){
    const id = req.params.id;
    const { descricao, qtd_apartamentos } = req.body;
 
    const update = "UPDATE blocos SET descricao = ?, qtd_apartamentos = ? WHERE id = ?";
 
    db.query(update, [descricao, qtd_apartamentos, id], function(err, result){
        if(!err){
            console.log("Bloco editado com sucesso!");
            res.redirect('/block/read'); 
        }else{
            console.log("Erro ao editar o bloco ", err);
            res.send(`
                <html>
                    <body>
                        <h1>Erro ao editar bloco</h1>
                        <p>${err.message.includes('Duplicate') ? 'Já existe um bloco com este nome' : err.message}</p>
                        <a href="/block/update/${id}">Tentar novamente</a>
                    </body>
                </html>
            `);
        }
    });
});



app.listen(3000, () => {
    console.log('Servidor rodando na url http://localhost:3000');
});
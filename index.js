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

app.get("/apartment/create", function(req, res) {
    const queryBlocos = "SELECT id, descricao FROM blocos ORDER BY descricao";
    
    db.query(queryBlocos, function(err, blocos) {
        if (err) {
            console.log("Erro ao buscar blocos:", err);
            return res.status(500).send("Erro ao carregar formulário");
        }

        res.send(`
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head> 
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>SysCondomínio - Cadastrar Apartamento</title>
                <link rel="stylesheet" href="/style.css">
                <link rel="stylesheet" href="/styleApartmentCreate.css">
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
                            <li><a href="/apartment/read" class="active"><i class="fas fa-door-open"></i> Voltar</a></li>
                        </ul>
                    </nav>

                    <main class="main-content">
                        <div class="page-header">
                            <h2><i class="fas fa-door-open"></i> Cadastrar Apartamento</h2>
                        </div>

                        <div class="form-container">
                            <div class="form-header">
                                <h3><i class="fas fa-plus-circle"></i> Novo Apartamento</h3>
                            </div>
                                <form method="POST" action="/apartment/create/apartment">
                                    <div class="form-group">
                                        <label for="bloco_id">Bloco:</label>
                                        <select id="bloco_id" name="bloco_id" required>
                                            <option value="">Selecione um bloco</option>
                                            ${blocos.map(bloco => `
                                                <option value="${bloco.id}">${bloco.descricao}</option>
                                            `).join('')}
                                        </select>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="numero">Número do Apartamento:</label>
                                        <input type="text" id="numero" name="numero" required>
                                    </div>
                                    
                                    <div class="form-actions">
                                        <button type="submit" class="btn-primary">
                                            <i class="fas fa-save"></i> Cadastrar
                                        </button>

                                    </div>
                                </form>
                        </div>
                    </main>
                </div>
            </body>
            </html>
        `);
    });
});

app.get("/apartment/read", function(req, res) {
    let searchTerm = req.query.search || "";
    let blocoId = req.query.bloco_id || "";
    
    
    let query = `SELECT a.*, b.descricao as bloco_descricao 
                FROM apartamentos a
                JOIN blocos b ON a.bloco_id = b.id
                WHERE 1=1`;
    
    let params = [];
    
    
    if (searchTerm) {
        query += ` AND (a.numero LIKE ? OR b.descricao LIKE ?)`;
        params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }
    
    if (blocoId) {
        query += ` AND a.bloco_id = ?`;
        params.push(blocoId);
    }
    
    query += ` ORDER BY b.descricao, a.numero`;
    
    db.query(query, params, function(err, rows) {
        if (!err) {
            console.log("Consulta de apartamentos realizada com sucesso!");

            res.send(`
                <!DOCTYPE html>
                <html lang="pt-BR">
                <head> 
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>SysCondomínio - Apartamentos</title>
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
                                <li><a href="/block/read"><i class="fas fa-cube"></i> Blocos</a></li>
                                <li><a href="/apartment/read" class="active"><i class="fas fa-door-open"></i> Apartamentos</a></li>
                                <li><a href="/resident/read"><i class="fas fa-users"></i> Moradores</a></li>
                            </ul>
                        </nav>

                        <main class="main-content">
                            <div class="page-header">
                                <h2><i class="fas fa-door-open"></i> Apartamentos Cadastrados</h2>
                                <div class="actions">
                                    <a href="/apartment/create" class="btn-primary">
                                        <i class="fas fa-plus"></i> Novo Apartamento
                                    </a>
                                    <a href="${blocoId ? '/block/read' : '/'}" class="btn-primary">
                                        <i class="fas fa-backward"></i> Voltar
                                    </a>
                                </div>
                            </div>

                            <div class="search-container">
                                <div class="search-bar">
                                    <form method="GET" action="/apartment/read">
                                        ${blocoId ? `<input type="hidden" name="bloco_id" value="${blocoId}">` : ''}
                                        <input type="text" name="search" id="searchInput" placeholder="Pesquisar por número ou bloco..." value="${searchTerm}">
                                        <button type="submit" id="searchBtn" class="btn-icon">
                                            <i class="fas fa-search"></i>
                                        </button>
                                        ${searchTerm || blocoId ? `
                                            <a href="/apartment/read" class="btn-icon danger">
                                                <i class="fas fa-times"></i> Limpar
                                            </a>
                                        ` : ''}
                                    </form>
                                </div>
                            </div>

                            <div class="table-container">
                                ${rows.length > 0 ? `
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>ID</th>
                                                <th>Bloco</th>
                                                <th>Número</th>
                                                <th>Ações</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            ${rows.map(row => `
                                                <tr>
                                                    <td>${row.id}</td>
                                                    <td>${row.bloco_descricao}</td>
                                                    <td>${row.numero}</td>
                                                    <td class="actions-cell">
                                                        <a href="/apartment/update/${row.id}" class="btn-icon" title="Alterar">
                                                            <i class="fas fa-edit"></i>
                                                        </a>
                                                        <a href="/apartment/delete/${row.id}" class="btn-icon danger" onclick="return confirm('Tem certeza que deseja excluir este Apartamento?')">
                                                        <i class="fas fa-trash"></i>
                                                    </a>
                                                    </td>
                                                </tr>
                                            `).join('')}
                                        </tbody>
                                    </table>
                                ` : `
                                    <div class="no-results">
                                        <i class="fas fa-door-closed"></i>
                                        <p>Nenhum apartamento encontrado</p>
                                        ${searchTerm || blocoId ? `
                                            <a href="/apartment/read" class="btn-primary">
                                                <i class="fas fa-list"></i> Ver todos
                                            </a>
                                        ` : ''}
                                    </div>
                                `}
                            </div>
                        </main>
                    </div>
                </body>
                </html>
            `);
        } else {
            console.log("Erro ao consultar apartamentos:", err);
            res.send(`
                <html>
                    <head>
                        <title>Erro</title>
                        <link rel="stylesheet" href="/style.css">
                    </head>
                    <body class="error-page">
                        <div class="error-container">
                            <h1><i class="fas fa-exclamation-triangle"></i> Erro ao carregar apartamentos</h1>
                            <p>${err.message}</p>
                            <a href="/" class="btn-primary">
                                <i class="fas fa-home"></i> Voltar ao início
                            </a>
                        </div>
                    </body>
                </html>
            `);
        }
    });
});

app.post('/apartment/create/apartment', function(req, res) {
    const blocoId = req.body.bloco_id;
    const numero = req.body.numero;

    if (!blocoId || !numero) {
        return res.status(400).send("Todos os campos são obrigatórios");
    }

    const values = [blocoId, numero];
    const insert = "INSERT INTO apartamentos (bloco_id, numero) VALUES (?, ?)";

    db.query(insert, values, function(err, result) {
        if (!err) {
            console.log("Apartamento cadastrado com sucesso!");
            res.redirect("/apartment/read");
        } else {
            console.log("Erro ao cadastrar apartamento:", err);
            
            if (err.code === 'ER_DUP_ENTRY') {
                res.status(400).send(`
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        Já existe um apartamento com este número no bloco selecionado.
                        <a href="/apartment/create" class="btn-primary">Tentar novamente</a>
                    </div>
                `);
            } else {
                res.status(500).send(`
                    <div class="error-message">
                        <i class="fas fa-exclamation-circle"></i>
                        Erro ao cadastrar apartamento. Por favor, tente novamente.
                        <a href="/apartment/create" class="btn-primary">Voltar</a>
                    </div>
                `);
            }
        }
    });
});

app.get('/apartment/delete/:id', function(req, res){
    const id = req.params.id;

    db.query('DELETE FROM apartamentos WHERE id = ?', [id], function(err, result){
        if (err) {
            console.log('Erro ao excluir o produto', err);
            res.status(500).send('Erro ao excluir o produto');
            return;
        }
    })
    console.log('Produto excluído com sucesso!');
    res.redirect('/apartment/read');
});

app.get('/apartment/update/:id', function(req, res){
    const id = req.params.id;

    // Query que busca o apartamento e o nome do bloco relacionado
    const query = `
        SELECT a.*, b.descricao as bloco_descricao 
        FROM apartamentos a
        JOIN blocos b ON a.bloco_id = b.id
        WHERE a.id = ?`;
    
    db.query(query, [id], function(err, result){
        if (err) {
            console.log('Erro ao editar o apartamento', err);
            res.status(500).send('Erro ao editar o apartamento');
            return;
        }
        
  
        db.query('SELECT id, descricao FROM blocos ORDER BY descricao', function(err, blocos){
            if (err) {
                console.log('Erro ao buscar blocos', err);
                res.status(500).send('Erro ao carregar formulário');
                return;
            }
            
            res.send(`
                <html>
                    <head> 
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>SysCondomínio - Editar Apartamento</title>
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

                        input, select, textarea {
                            padding: 0.75rem;
                            border: 1px solid #e0e0e0;
                            border-radius: 4px;
                            font-size: 1rem;
                            background-color: #ffffff;
                            color: #263238;
                            width: 100%;
                        }

                        select {
                            appearance: none;
                            background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
                            background-repeat: no-repeat;
                            background-position: right 0.75rem center;
                            background-size: 1rem;
                        }

                        input:focus,
                        select:focus,
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
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            gap: 0.5rem;
                        }

                        button:hover {
                            background-color: #1565c0;
                            transform: translateY(-1px);
                        }

                        .btn-secondary {
                            background-color: #f5f7fa;
                            padding: 0.75rem 1.5rem;
                            background-color: #263238;
                            color: white;
                            border: none;
                            border-radius: 4px;
                            font-size: 1rem;
                            font-weight: 500;
                            cursor: pointer;
                            transition: all 0.2s ease;
                            margin-top: 1rem;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                            gap: 0.5rem;
                        }

                        .btn-secondary:hover {
                            background-color: #e0e0e0;
                        }

                        .btn-group {
                            display: flex;
                            gap: 1rem;
                            margin-top: 1.5rem;
                        }

                        @media (max-width: 768px) {
                            body {
                                padding: 1rem;
                            }
                            
                            .card {
                                padding: 1rem;
                            }
                            
                            .btn-group {
                                flex-direction: column;
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
                        <h2><i class="fas fa-door-open"></i> Editar Apartamento</h2>
                        <form action="/apartment/update/${id}" method="POST">
                            <div class="form-group">
                                <div class="input-group">
                                    <label for="bloco_id">Bloco:</label>
                                    <select id="bloco_id" name="bloco_id" required>
                                        <option value="">Selecione um bloco</option>
                                        ${blocos.map(bloco => `
                                            <option value="${bloco.id}" ${bloco.id == result[0].bloco_id ? 'selected' : ''}>
                                                ${bloco.descricao}
                                            </option>
                                        `).join('')}
                                    </select>
                                </div>
                                
                                <div class="input-group">
                                    <label for="numero">Número do Apartamento:</label>
                                    <input type="text" id="numero" name="numero" value="${result[0].numero}" required>
                                </div>
                                
                                <div class="btn-group">
                                    <button type="submit">
                                        <i class="fas fa-save"></i> Atualizar
                                    </button>
                                    <a href="/apartment/read" class="btn-secondary" style="text-decoration: none;">
                                        <i class="fas fa-times"></i> Cancelar
                                    </a>
                                </div>
                            </div>
                        </form>
                        </section>
                    </main>
                    </body>
                </html>
            `);
        });
    });
});

app.post('/apartment/update/:id', function(req, res){
    const id = req.params.id;
    const { bloco_id, numero } = req.body;
 
    const update = "UPDATE apartamentos SET bloco_id = ?, numero = ? WHERE id = ?";
 
    db.query(update, [bloco_id, numero, id], function(err, result){
        if(!err){
            console.log("Apartamento editado com sucesso!");
            res.redirect('/apartment/read'); 
        }else{
            console.log("Erro ao editar o apartamento ", err);
            
            const errorMessage = err.code === 'ER_DUP_ENTRY' 
                ? 'Já existe um apartamento com este número no bloco selecionado'
                : err.message;
            
            res.send(`
                <html>
                    <head>
                        <title>Erro ao Editar Apartamento</title>
                        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
                        <style>
                            body {
                                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                                background-color: #f5f7fa;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                margin: 0;
                                padding: 2rem;
                            }
                            .error-container {
                                background-color: #fff;
                                border-radius: 8px;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                padding: 2rem;
                                max-width: 500px;
                                text-align: center;
                            }
                            h1 {
                                color: #e53935;
                                margin-bottom: 1rem;
                            }
                            p {
                                margin-bottom: 2rem;
                                color: #263238;
                            }
                            a {
                                display: inline-flex;
                                align-items: center;
                                gap: 0.5rem;
                                padding: 0.75rem 1.5rem;
                                background-color: #1e88e5;
                                color: white;
                                text-decoration: none;
                                border-radius: 4px;
                                transition: all 0.2s ease;
                            }
                            a:hover {
                                background-color: #1565c0;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="error-container">
                            <h1><i class="fas fa-exclamation-circle"></i> Erro ao Editar Apartamento</h1>
                            <p>${errorMessage}</p>
                            <a href="/apartment/update/${id}">
                                <i class="fas fa-arrow-left"></i> Tentar Novamente
                            </a>
                        </div>
                    </body>
                </html>
            `);
        }
    });
});



app.listen(3000, () => {
    console.log('Servidor rodando na url http://localhost:3000');
});
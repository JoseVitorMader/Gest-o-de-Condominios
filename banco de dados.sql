CREATE DATABASE GerenciaCondominio;

-- Tabela 1 (já existente)
CREATE TABLE blocos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    qtd_apartamentos INT NOT NULL
);

-- Tabela 2: Apartamentos
CREATE TABLE apartamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    bloco_id INT NOT NULL,
    numero VARCHAR(10) NOT NULL,
    FOREIGN KEY (bloco_id) REFERENCES blocos(id),
    UNIQUE KEY (bloco_id, numero) -- Evita apartamentos duplicados no mesmo bloco
);

-- Tabela 3: Moradores
CREATE TABLE moradores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    nome VARCHAR(100) NOT NULL,
    telefone VARCHAR(15),
    apartamento_id INT NOT NULL,
    responsavel BOOLEAN DEFAULT FALSE,
    proprietario BOOLEAN DEFAULT FALSE,
    vagas_garagem INT DEFAULT 0,
    FOREIGN KEY (apartamento_id) REFERENCES apartamentos(id)
);

-- Tabela 3.1: Veículos (relacionada a moradores)
CREATE TABLE veiculos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    morador_id INT NOT NULL,
    placa VARCHAR(10) UNIQUE NOT NULL,
    marca VARCHAR(50),
    modelo VARCHAR(50),
    vaga VARCHAR(10),
    FOREIGN KEY (morador_id) REFERENCES moradores(id)
);

-- Tabela 4: Pagamentos
CREATE TABLE pagamentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    apartamento_id INT NOT NULL,
    morador_id INT NOT NULL,
    referencia DATE NOT NULL, -- Armazena mês/ano como DATE (01/mm/aaaa)
    valor DECIMAL(10,2) NOT NULL,
    vencimento DATE NOT NULL,
    data_pagamento DATE,
    valor_pago DECIMAL(10,2),
    status ENUM('pendente', 'pago', 'atrasado') DEFAULT 'pendente',
    FOREIGN KEY (apartamento_id) REFERENCES apartamentos(id),
    FOREIGN KEY (morador_id) REFERENCES moradores(id)
);

-- Tabela 5: Tipos de Manutenção
CREATE TABLE tipos_manutencao (
    id INT AUTO_INCREMENT PRIMARY KEY,
    descricao VARCHAR(100) NOT NULL,
    frequencia_estimada VARCHAR(50) -- Opcional: para manutenções periódicas
);

-- Tabela 6: Manutenções
CREATE TABLE manutencoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tipo_id INT NOT NULL,
    data DATE NOT NULL,
    data_agendamento DATE,
    local VARCHAR(100) NOT NULL,
    descricao TEXT,
    custo DECIMAL(10,2),
    responsavel VARCHAR(100),
    status ENUM('agendada', 'realizada', 'cancelada') DEFAULT 'agendada',
    FOREIGN KEY (tipo_id) REFERENCES tipos_manutencao(id)
);

-- adicionar quantidade de apt automatica
DELIMITER //
CREATE TRIGGER after_apartamento_insert
AFTER INSERT ON apartamentos
FOR EACH ROW
BEGIN
    UPDATE blocos 
    SET qtd_apartamentos = qtd_apartamentos + 1 
    WHERE id = NEW.bloco_id;
END//
DELIMITER ;
-- remover qtd de apt automatico
DELIMITER //
CREATE TRIGGER after_apartamento_delete
AFTER DELETE ON apartamentos
FOR EACH ROW
BEGIN
    UPDATE blocos 
    SET qtd_apartamentos = qtd_apartamentos - 1 
    WHERE id = OLD.bloco_id;
END//
DELIMITER ;
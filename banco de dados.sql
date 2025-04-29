CREATE DATABASE GerenciaCondominio;

CREATE TABLE blocos (  
  id INT AUTO_INCREMENT PRIMARY KEY,  
  nome VARCHAR(50) NOT NULL UNIQUE,  
  descricao VARCHAR(100)  
);  

INSERT INTO blocos (nome, descricao) VALUES ('Bloco A', 'Torre residencial'), ('Bloco B', 'Torre comercial');  


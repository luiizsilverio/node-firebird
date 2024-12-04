import { Service } from "node-windows"; "node-windows"; "node-windows";
// const Service = require('node-windows').Service;

const svc = new Service({
  name: 'Node-Firebird Server',
  description: 'Servidor Node para banco de dados Firebird como serviço do Windows',
  script: 'D:\\LuizDev\\Node\\node-firebird\\src\\index.js'
});

svc.on('install', () => {
  svc.start();
});

svc.install();
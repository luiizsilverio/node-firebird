import express from "express";
import cors from "cors";
import { firebird, fbQuery, fbExecute, fbQueryTrx, dbOptions } from "./config/database.js";

const app = express();

app.use(express.json());
app.use(cors());

// Rotas
app.get("/produtos", function(req, res){

    let filtro = [];
    //let ssql = 'select id_produto as "id", descricao as "descricao", valor as "valor" ';
    let ssql = 'select id_produto, descricao, valor ';
    ssql += 'from tab_produto where id_produto > 0 ';

    if (req.query.descricao){
        ssql += "and descricao like ?";
        filtro.push("%" + req.query.descricao + "%");
    }

    if (req.query.valor){
        ssql += "and valor >= ?";
        filtro.push(req.query.valor);
    }

    fbQuery(ssql, filtro, function(err, result){
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(200).json(result);
        }
    });    
});

app.post("/produtos", function(req, res){

    let ssql = "INSERT INTO TAB_PRODUTO (descricao, valor) VALUES(?, ?)"; // RETURNING id_produto ";
    
    fbExecute(ssql, [req.body.descricao, req.body.valor], function(err, result){
        if (err) {
            res.status(500).json(err);
        } else {
            res.status(201).json({sucesso: true});
            // res.status(201).json({id_produto: result.ID_PRODUTO});
        }
    });    
});

app.post("/pedidos", function(req, res){

    firebird.attach(dbOptions, function(err, db) {
        if (err) {
            return res.status(500).json(err);
        }

        db.transaction(firebird.ISOLATION_READ_COMMITED, async function(err, transaction){

            if (err)
                return res.status(500).json(err);

            try {
                // pega o id do pedido
                let ssql = 'select gen_id(gen_pedido_id, 1) as id_pedido from rdb$database';
                let ret = await fbQueryTrx(transaction, ssql, []);
                let id_pedido = ret[0].id_pedido;

                ssql = "insert into tab_pedido(id_pedido, id_cliente, valor) values(?, ?, ?)";

                // Grava o pedido...
                ret = await fbQueryTrx(transaction, ssql, [id_pedido, req.body.id_cliente, req.body.valor]);

                // Grava os itens...
                for (var i = 0; i < req.body.itens.length; i++){
                    ssql = "insert into tab_pedido_item(id_pedido, id_produto, qtd, valor_unit, valor_total) values(?, ?, ?, ?, ?)";

                    await fbQueryTrx(
                        transaction, ssql, [
                            id_pedido, 
                            req.body.itens[i].id_produto, 
                            req.body.itens[i].qtd, 
                            req.body.itens[i].valor_unit, 
                            req.body.itens[i].valor_total
                        ]
                    );                 
                }

                // Commit...
                transaction.commit(function(err){
                    if (err){
                        transaction.rollback();
                        res.status(500).json(err);
                    } else {
                        res.status(201).json({id_pedido: id_pedido});                        
                    }
                });

            } catch (error){
                transaction.rollback();
                res.status(500).json(error);
            }

            db.detach();
        });
    });

});


app.listen(3000, function(){
    console.log("Servidor no ar");
});


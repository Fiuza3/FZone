function errorHandler(err, req, res, next) {
    console.error('Erro:', err.message);

    // Erro de ObjectId quebrado
    if (err.name === 'CastError') {
        return res.status(400).json({ error: 'ID inválido ou malformado' });
    }

    // Erro de validação do Mongoose
    if (err.name === 'ValidationError') {
        const mensagens = Object.values(err.errors).map(e => e.message);
        return res.status(400).json({ error: mensagens.join(', ') });
    }

    // Outros
    res.status(400).json({
        error: err.message || 'Erro desconhecido',
    });
}

module.exports = errorHandler;

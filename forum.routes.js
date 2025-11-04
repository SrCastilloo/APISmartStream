// routes/forum.routes.js
const express = require('express');
const Post = require('./post.model')
const Comment = require('./comment.model');
const auth = require('./middlewares/auth.middleware');
const router = express.Router();

// Crear post
router.post('/posts', auth, async (req, res) => {
  try {
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Contenido requerido' });
    const post = await Post.create({
      content: content.trim(),
      author: { id: req.user.id, nickname: req.user.nickname, correo: req.user.correo },
    });
    res.status(201).json(post);
  } catch (e) {
    res.status(500).json({ error: 'Error al crear post' });
  }
});

// Listar posts (paginado)
router.get('/posts', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(30, Math.max(5, parseInt(req.query.limit || '10', 10)));
    const skip = (page - 1) * limit;

    const [items, total, counts] = await Promise.all([
      Post.find().sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      Post.countDocuments(),
      Comment.aggregate([
        { $group: { _id: '$postId', count: { $sum: 1 } } }
      ])
    ]);

    const countMap = counts.reduce((acc, c) => { acc[c._id.toString()] = c.count; return acc; }, {});
    const data = items.map(p => ({ ...p, commentsCount: countMap[p._id.toString()] || 0 }));

    res.json({
      page, limit, total, data
    });
  } catch (e) {
    res.status(500).json({ error: 'Error al listar posts' });
  }
});

// Obtener un post con comentarios anidados
router.get('/posts/:id', async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Post.findById(postId).lean();
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });

    const comments = await Comment.find({ postId }).sort({ createdAt: 1 }).lean();

    // Construir árbol
    const byId = new Map(comments.map(c => [c._id.toString(), { ...c, replies: [] }]));
    const roots = [];
    for (const c of byId.values()) {
      if (c.parentId) {
        const parent = byId.get(c.parentId.toString());
        if (parent) parent.replies.push(c);
        else roots.push(c); // huérfanos (por si borraron el padre)
      } else {
        roots.push(c);
      }
    }

    res.json({ post, comments: roots });
  } catch (e) {
    res.status(500).json({ error: 'Error al obtener post' });
  }
});

// Comentar un post (parentId opcional para responder a otro comentario)
router.post('/posts/:id/comments', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, parentId = null } = req.body;
    if (!content?.trim()) return res.status(400).json({ error: 'Contenido requerido' });

    const exists = await Post.exists({ _id: postId });
    if (!exists) return res.status(404).json({ error: 'Post no encontrado' });

    if (parentId) {
      const parent = await Comment.findById(parentId).lean();
      if (!parent || parent.postId.toString() !== postId) {
        return res.status(400).json({ error: 'parentId inválido' });
      }
    }

    const c = await Comment.create({
      postId,
      parentId,
      content: content.trim(),
      author: { id: req.user.id, nickname: req.user.nickname, correo: req.user.correo },
    });
    res.status(201).json(c);
  } catch (e) {
    res.status(500).json({ error: 'Error al comentar' });
  }
});

// Borrar post (solo autor)
router.delete('/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ error: 'Post no encontrado' });
    if (post.author.correo !== req.user.correo) return res.status(403).json({ error: 'No autorizado' });

    await Promise.all([
      Comment.deleteMany({ postId: post._id }),
      Post.deleteOne({ _id: post._id }),
    ]);
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Error al borrar post' });
  }
});

// Borrar comentario (solo autor)
router.delete('/comments/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: 'Comentario no encontrado' });
    if (comment.author.correo !== req.user.correo) return res.status(403).json({ error: 'No autorizado' });

    // borrar el comentario y todos sus descendientes
    const toDelete = [comment._id.toString()];
    const all = await Comment.find({ postId: comment.postId }).lean();
    const childrenMap = all.reduce((acc, c) => {
      const key = c.parentId ? c.parentId.toString() : '';
      if (!acc[key]) acc[key] = [];
      acc[key].push(c);
      return acc;
    }, {});
    const stack = [comment._id.toString()];
    while (stack.length) {
      const id = stack.pop();
      (childrenMap[id] || []).forEach(child => {
        toDelete.push(child._id.toString());
        stack.push(child._id.toString());
      });
    }

    await Comment.deleteMany({ _id: { $in: toDelete } });
    res.json({ ok: true, deleted: toDelete.length });
  } catch (e) {
    res.status(500).json({ error: 'Error al borrar comentario' });
  }
});

module.exports = router;

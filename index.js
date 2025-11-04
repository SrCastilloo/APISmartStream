require('dotenv').config();
const express = require('express'); 
const bcrypt= require('bcrypt');
const app = express();
const connectDB = require('./db');
const Usuario = require('./user.model');
const forumRoutes = require('./forum.routes');
app.use(express.json());
const jwt = require('jsonwebtoken'); 


//conectar a la base de datos
(async () => {
  try {
    await connectDB(process.env.MONGODB_URI); // Aquí se hace la conexión
    console.log('✅ Base de datos conectada');
  } catch (err) {
    console.error('❌ Error al conectar con MongoDB:', err.message);
    process.exit(1);
  }
})();



app.get('/', (req,res) => {

    res.send('Hola');

});

app.get('/usuarios',async(req,res,next) => {

    try{
        const usuarios = await Usuario.find().select('-contrasena').lean();
        res.json(usuarios);
    }catch(err)
    {
        res.status(500).send(err);
    }
});


app.get('/usuarios/:correo',  async(req,res) => {

    try
    {
        const correo= req.params.correo.toLowerCase();
        const usuario = await Usuario.findOne({correo}).lean(); //lean acelera el proceso devolviendo un objeto plano JSON


        if(!usuario) return res.status(404).send('No existe un usuario con este correo');
        
        res.json(usuario);
    }catch(err){
        res.status(500).send(err);
    }

});

app.post('/usuarios',async (req,res) => {

        try{
            const {nickname, correo, contrasena} = req.body;
            const salt = await bcrypt.genSalt(10);
            const hashedpassword = await bcrypt.hash(contrasena, salt);
            const user = await Usuario.create({nickname,correo,contrasena: hashedpassword});
            res.status(201).json(user);
        }catch(err)
        {
            res.status(500).send(err);
        }
}
);



app.post('/login', async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const doc = await Usuario.findOne({ correo });
    if (!doc) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const ok = await bcrypt.compare(contrasena, doc.contrasena);
    if (!ok) return res.status(401).json({ error: 'Credenciales incorrectas' });

    const user = doc.toObject();
    delete user.contrasena;

    const token = jwt.sign(
      { id: doc._id.toString(), correo: user.correo, nickname: user.nickname },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({ user, token });
  } catch (err) {
    console.error('Error en /login:', err);
    return res.status(500).json({ error: 'Error interno' });
  }
});




app.delete('/usuarios/:correo',async (req,res) => {

    try{
        const correo = req.params.correo.toLowerCase();
        const eliminado = await Usuario.findOneAndDelete({correo});

        if(!eliminado) return res.status(404).send('No hay usuarios con este correo');

        res.json({message: 'Usuario eliminado'});
    }catch(err)
    {
        res.status(500).send(err);
    }

});


app.use('/forum',forumRoutes);

const port = process.env.port || 3000;    
app.listen(port, () => console.log(`Escuchando en el puerto ${port} ...`));

module.exports = app;
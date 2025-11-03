import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

const app = express();
app.use(express.json());
app.use(cors());

// Conexión Atlas
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch((err) => console.error("Error al conectar a MongoDB:", err));

// Esquema de personajes
const personajeSchema = new mongoose.Schema({
  nombre: String,
  edad: Number,
  altura: Number,
  peso: Number,
  color_ojos: String,
  color_cabello: String,
  estado: String,
  imagen: String,
});

// Modelo
const Personaje = mongoose.model("Personaje", personajeSchema, "personajes");

// Swagger Configuración
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HunterxAPI",
      version: "1.0.0",
      description: "API REST para gestionar personajes de Hunter x Hunter en un DB No Relacional.",
    },
    servers: [
      {
        url: "https://backend-hxh-norelacional.onrender.com/",
        description: "Server en Render",
      },
    ],
  },
  apis: ["./server-nor.js"],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ENDPOINTS

/**
 * @openapi
 * /personajes:
 *   get:
 *     summary: Obtiene todos los personajes
 *     tags: [Personajes]
 *     responses:
 *       200:
 *         description: Lista de personajes.
 */
app.get("/personajes", async (req, res) => {
  try {
    const data = await Personaje.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los personajes" });
  }
});

/**
 * @openapi
 * /personajes/{nombre}:
 *   get:
 *     summary: Busca un personaje por nombre
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *         description: Nombre del personaje
 *     responses:
 *       200:
 *         description: Personaje encontrado.
 *       404:
 *         description: No encontrado.
 */
app.get("/personajes/:nombre", async (req, res) => {
  try {
    const nombreBuscado = req.params.nombre;
    const personaje = await Personaje.findOne({
      nombre: new RegExp(`^${nombreBuscado}$`, "i"),
    });

    if (!personaje) {
      return res.status(404).json({ mensaje: "Personaje no encontrado" });
    }

    res.json(personaje);
  } catch (err) {
    res.status(500).json({ error: "Error al buscar el personaje" });
  }
});

/**
 * @openapi
 * /personajes:
 *   post:
 *     summary: Agrega un nuevo personaje
 *     tags: [Personajes]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *                 example: Gon Freecss
 *               edad:
 *                 type: integer
 *                 example: 12
 *               altura:
 *                 type: number
 *                 example: 1.55
 *               peso:
 *                 type: number
 *                 example: 45
 *               color_ojos:
 *                 type: string
 *                 example: Verde
 *               color_cabello:
 *                 type: string
 *                 example: Negro
 *               estado:
 *                 type: string
 *                 example: Activo
 *               imagen:
 *                 type: string
 *     responses:
 *       201:
 *         description: Personaje creado correctamente.
 */
app.post("/personajes", async (req, res) => {
  try {
    const nuevo = new Personaje(req.body);
    await nuevo.save();
    res.status(201).json({ mensaje: "Personaje agregado", data: nuevo });
  } catch (err) {
    res.status(500).json({ error: "Error al agregar el personaje" });
  }
});

/**
 * @openapi
 * /personajes/{nombre}:
 *   put:
 *     summary: Actualiza un personaje por nombre
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               edad:
 *                 type: integer
 *               altura:
 *                 type: number
 *               peso:
 *                 type: number
 *               color_ojos:
 *                 type: string
 *               color_cabello:
 *                 type: string
 *               estado:
 *                 type: string
 *               imagen:
 *                 type: string
 *     responses:
 *       200:
 *         description: Personaje actualizado correctamente.
 */
app.put("/personajes/:nombre", async (req, res) => {
  try {
    const personajeActualizado = await Personaje.findOneAndUpdate(
      { nombre: new RegExp(`^${req.params.nombre}$`, "i") },
      req.body,
      { new: true }
    );

    if (!personajeActualizado) {
      return res.status(404).json({ mensaje: "Personaje no encontrado" });
    }

    res.json({ mensaje: "Actualizado correctamente", data: personajeActualizado });
  } catch (err) {
    res.status(500).json({ error: "Error al actualizar el personaje" });
  }
});

/**
 * @openapi
 * /personajes/{nombre}:
 *   delete:
 *     summary: Elimina un personaje por nombre
 *     tags: [Personajes]
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Personaje eliminado correctamente.
 */
app.delete("/personajes/:nombre", async (req, res) => {
  try {
    const eliminado = await Personaje.findOneAndDelete({
      nombre: new RegExp(`^${req.params.nombre}$`, "i"),
    });

    if (!eliminado) {
      return res.status(404).json({ mensaje: "Personaje no encontrado" });
    }

    res.json({ mensaje: "Eliminado correctamente", data: eliminado });
  } catch (err) {
    res.status(500).json({ error: "Error al eliminar el personaje" });
  }
});

// 🚀 Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor ejecutándose en https://backend-hxh-norelacional.onrender.com`);
});




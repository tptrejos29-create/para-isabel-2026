/* ============================================================
   CONFIGURACIÓN — lo único que necesitas tocar para personalizar
   ============================================================ */
window.CONFIG = {

  /* Nombre de ella (se usa en el sobre, el título y el reproductor) */
  nombre: 'Isabel',

  /* Fecha de inicio del contador "Desde aquel día" (hora local) */
  desde: '2026-10-06T00:00:00',

  /* Fecha y hora en que se desbloquea el capítulo final (hora local).
     Antes de esa fecha se ve la cuenta regresiva; al llegar, cambia el mensaje. */
  propuesta: '2026-10-31T00:00:00',

  /* Canción. El archivo va en la carpeta /music. Si algún día quieres más
     canciones, agrega otro bloque a la lista y el reproductor mostrará los botones. */
  canciones: [
    {
      titulo: 'Leni',
      artista: 'Crystal Castles',
      src: 'music/leni.mp3',
      nota: 'Suena cuando pienso en ti.'
    }
  ],

  /* Fotos del capítulo "Momentos". Puedes agregar todas las que quieras.
     pos = punto de enfoque de la foto (ej. 'center 20%' para ver más arriba). */
  fotos: [
    { src: 'img/isabel-1.jpg', titulo: 'Tú',  pie: 'Sin esfuerzo, así eres.', pos: 'center 18%' },
    { src: 'img/johan-1.jpg',  titulo: 'Yo',  pie: 'Pensando en cuándo te veo.', pos: 'center 28%' }
  ]
};

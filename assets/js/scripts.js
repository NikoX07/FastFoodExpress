// Inicializa Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC0zURJKtIZgIbc36jIsaC-0O9Q9SY6nng",
  authDomain: "fastfoodexpress-page.firebaseapp.com",
  projectId: "fastfoodexpress-page",
  storageBucket: "fastfoodexpress-page.appspot.com",
  messagingSenderId: "950633943864",
  appId: "1:950633943864:web:aa451fce3ad76a9fe927cd",
  databaseURL: "https://fastfoodexpress-page-default-rtdb.firebaseio.com"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Datos de los platillos por categoría
const platillos = {
  hamburguesas: [
    {
      nombre: "Hamburguesa Clásica de Pan",
      descripcion: "Pan, queso, carne de res, cebolla deshilachada, salsa de ajo, tomate y lechuga.",
      precio: "$6.000",
      imagen: "assets/img/hamburguesacarne.png",
      vista: true,
      modelo3d: "assets/models/HamburguesaCarne.glb"
    },
    {
      nombre: "Hamburguesa de Plátano",
      descripcion: "Platano maduro, cebolla deshilachada, salsa de ajo, queso, tomate y lechuga.",
      precio: "$7.000",
      imagen: "assets/img/hamburguesaplatano.png",
      vista: true,
      modelo3d: "assets/models/HamburguesaPlatano.glb"
    }
  ],
  perros: [
    {
      nombre: "Perro Clásico",
      descripcion: "Salchicha, pan, salsa casera, papas ripi y cebolla deshilachada.",
      precio: "$3.000",
      imagen: "assets/img/perro.png",
      vista: true,
      modelo3d :"assets/models/PerroCaliente.glb"
    }
  ],
  empanadas: [
    {
      nombre: "Empanada de Carne",
      descripcion: "Carne desmechada",
      precio: "$1.500",
      imagen: "assets/img/empanadas.png",
      vista: true,
      modelo3d: "assets/models/Empanada.glb"
    }
  ],
  pasteles: [
    {
      nombre: "Pastel de Carne",
      descripcion: "Carne desmechada y arroz.",
      precio: "$2.000",
      imagen: "assets/img/pasteldecarne.png",
      vista: true,
      modelo3d: "assets/models/PastelCarne.glb"
    }
  ]
};

// Carrito persistente
let carrito = [];
if (localStorage.getItem('ffe_carrito')) {
  carrito = JSON.parse(localStorage.getItem('ffe_carrito'));
}

// Mostrar productos y stock en tiempo real
function mostrarPlatillos(categoria) {
  const lista = document.getElementById('platillos-lista');
  lista.innerHTML = '';
  platillos[categoria].forEach(plato => {
    lista.innerHTML += `
      <div class="platillo-card">
        ${plato.vista ? '<span class="vista-360">Vista 360°</span>' : ''}
        <img src="${plato.imagen}" alt="${plato.nombre}">
        <h3>${plato.nombre}</h3>
        <p>${plato.descripcion}</p>
        <div style="font-size:14px;color:#888;margin-bottom:6px;">
          Stock: <span class="stock-num" data-nombre="${plato.nombre}">...</span>
        </div>
        <div class="platillo-bottom">
          <span class="precio">${plato.precio}</span>
          <button class="agregar-btn" data-nombre="${plato.nombre}">Agregar</button>
        </div>
      </div>
    `;
    escucharStock(plato.nombre, stock => {
      const stockSpan = document.querySelector(`.stock-num[data-nombre="${plato.nombre}"]`);
      const btn = document.querySelector(`.agregar-btn[data-nombre="${plato.nombre}"]`);
      if (stockSpan) stockSpan.textContent = stock !== null ? stock : 0;
      if (btn) {
        if (stock <= 0) {
          btn.disabled = true;
          btn.style.opacity = ".5";
          btn.style.cursor = "not-allowed";
        } else {
          btn.disabled = false;
          btn.style.opacity = "1";
          btn.style.cursor = "pointer";
        }
      }
      // Si el producto está en el carrito y el stock es 0, elimínalo y muestra mensaje
      let item = carrito.find(i => i.nombre === plato.nombre);
      if (item && stock <= 0) {
        carrito = carrito.filter(i => i.nombre !== plato.nombre);
        actualizarCarrito();
        mostrarMensaje('Un producto se agotó y fue eliminado del carrito', 'error');
      }
    });
  });
}

// Tabs de categorías
document.addEventListener('DOMContentLoaded', function() {
  mostrarPlatillos('hamburguesas');
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      mostrarPlatillos(this.dataset.categoria);
    });
  });
  actualizarCarrito();
});

// Modal 3D
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('vista-360')) {
    const card = e.target.closest('.platillo-card');
    const nombre = card.querySelector('h3').textContent;
    let producto;
    Object.values(platillos).forEach(categoria => {
      categoria.forEach(p => {
        if (p.nombre === nombre) producto = p;
      });
    });
    document.getElementById('modal-3d-title').textContent = `Modelo 3D Interactivo - ${nombre}`;
    document.getElementById('modal-3d-details').innerHTML = `
      <h3>${producto.nombre}</h3>
      <p>${producto.descripcion}</p>
      <div style="background:#eaf6fd;padding:12px;border-radius:8px;display:inline-block;margin-bottom:10px;">
        <span style="color:#039be5;font-size:1.3em;font-weight:700;">${producto.precio}</span>
      </div>
    `;
    document.getElementById('modal-3d').style.display = 'flex';
    cargarModeloViewer(producto.modelo3d);
  }
});
function cargarModeloViewer(rutaModelo) {
  const viewer = document.getElementById('viewer-3d');
  viewer.innerHTML = `
    <model-viewer 
      id="modelViewer3d"
      src="${rutaModelo || ''}" 
      alt="Modelo 3D del producto" 
      camera-controls 
      auto-rotate 
      ar 
      shadow-intensity="2"
      exposure="0.75"
      environment-image="https://modelviewer.dev/shared-assets/environments/neutral.hdr"
      style="width:100%;height:400px;background:#eaf6fd;border-radius:8px;">
    </model-viewer>
  `;
}
document.addEventListener('click', function(e) {
  if (e.target.id === 'close-modal-btn' || e.target.classList.contains('close-modal')) {
    document.getElementById('modal-3d').style.display = 'none';
    document.getElementById('viewer-3d').innerHTML = '';
  }
});

// Carrito flotante
document.getElementById('carrito-btn').addEventListener('click', function(e) {
  e.stopPropagation();
  const lista = document.getElementById('carrito-lista');
  lista.style.display = (lista.style.display === 'none' || lista.style.display === '') ? 'block' : 'none';
});
document.addEventListener('click', function(e) {
  const lista = document.getElementById('carrito-lista');
  const btn = document.getElementById('carrito-btn');
  if (!lista.contains(e.target) && e.target !== btn) {
    lista.style.display = 'none';
  }
});

// Añadir producto al carrito
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('agregar-btn')) {
    const nombre = e.target.getAttribute('data-nombre');
    let producto;
    Object.values(platillos).forEach(categoria => {
      categoria.forEach(p => {
        if (p.nombre === nombre) producto = p;
      });
    });
    db.ref('stock/' + nombre).once('value').then(snapshot => {
      const stock = snapshot.val() || 0;
      let item = carrito.find(i => i.nombre === producto.nombre);
      const cantidadEnCarrito = item ? item.cantidad : 0;
      if (!producto || stock <= 0 || cantidadEnCarrito >= stock) {
        mostrarMensaje('No puedes agregar más, stock máximo alcanzado', 'error');
        return;
      }
      if (item) {
        item.cantidad += 1;
      } else {
        carrito.push({
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          imagen: producto.imagen
        });
      }
      guardarCarrito();
      document.getElementById('carrito-lista').style.display = 'block';
      actualizarCarrito();
      mostrarMensaje('Producto añadido al carrito', 'info');
    });
  }
});

// Carrito: sumar/restar/quitar productos
document.addEventListener('click', function(e) {
  // Sumar uno
  if (e.target.classList.contains('carrito-sumar-uno')) {
    const nombre = e.target.getAttribute('data-nombre');
    db.ref('stock/' + nombre).once('value').then(snapshot => {
      const stock = snapshot.val();
      let item = carrito.find(i => i.nombre === nombre);
      if (item && item.cantidad < stock) {
        item.cantidad += 1;
        guardarCarrito();
        actualizarCarrito();
      } else {
        mostrarMensaje('No hay más stock disponible', 'error');
      }
    });
  }
  // Quitar uno
  if (e.target.classList.contains('carrito-quitar-uno')) {
    const nombre = e.target.getAttribute('data-nombre');
    let item = carrito.find(i => i.nombre === nombre);
    if (item) {
      item.cantidad -= 1;
      if (item.cantidad <= 0) carrito = carrito.filter(i => i.nombre !== nombre);
      guardarCarrito();
      actualizarCarrito();
    }
  }
  // Quitar todos
  if (e.target.classList.contains('carrito-quitar-todos')) {
    const nombre = e.target.getAttribute('data-nombre');
    carrito = carrito.filter(i => i.nombre !== nombre);
    guardarCarrito();
    actualizarCarrito();
  }
  // Vaciar carrito
  if (e.target.id === 'vaciar-carrito-btn') {
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
  }
  // Pagar
  if (e.target.id === 'pagar-carrito-btn') {
    validarYMostrarModalPago();
  }
});

// Actualizar la vista del carrito
function actualizarCarrito() {
  localStorage.setItem('ffe_carrito', JSON.stringify(carrito));
  const ul = document.getElementById('carrito-productos');
  const totalDiv = document.getElementById('carrito-total');
  const cantidadSpan = document.getElementById('carrito-cantidad');
  ul.innerHTML = '';
  let total = 0;
  carrito.forEach(item => {
    const precioNum = parseInt(item.precio.replace(/[\$.]/g, ''));
    const subtotal = precioNum * item.cantidad;
    total += subtotal;
    ul.innerHTML += `
      <li class="carrito-item" style="display:flex;align-items:center;gap:10px;border:1px solid #eee;border-radius:10px;padding:8px;margin-bottom:8px;">
        <img src="${item.imagen}" alt="${item.nombre}" style="width:48px;height:48px;object-fit:cover;border-radius:8px;">
        <span style="font-weight:700;">x${item.cantidad}</span>
        <span style="flex:1;">${item.nombre}</span>
        <span style="font-weight:700;">$${subtotal.toLocaleString('es-CO')}</span>
        <button class="carrito-sumar-uno" data-nombre="${item.nombre}" title="Agregar uno" style="background:#e3f2fd;color:#22c55e;border:none;padding:6px 10px;border-radius:6px;font-weight:700;cursor:pointer;">+</button>
        <button class="carrito-quitar-uno" data-nombre="${item.nombre}" title="Quitar uno" style="background:#f2f6ff;color:#1e90ff;border:none;padding:6px 10px;border-radius:6px;font-weight:700;cursor:pointer;">-</button>
        <button class="carrito-quitar-todos" data-nombre="${item.nombre}" title="Quitar todos" style="background:#ffeaea;color:#ff4d4f;border:none;padding:6px 10px;border-radius:6px;font-weight:700;cursor:pointer;">🗑</button>
      </li>
    `;
  });
  cantidadSpan.textContent = carrito.reduce((acc, item) => acc + item.cantidad, 0);
  totalDiv.innerHTML = `
    <div style="margin-top:10px;font-size:16px;">
      <strong>Total: $${total.toLocaleString('es-CO')}</strong>
    </div>
    <div style="display:flex;gap:8px;margin-top:10px;">
      <button id="vaciar-carrito-btn" style="flex:1;background:#f2f6ff;color:#1e90ff;border:none;padding:10px;border-radius:8px;font-weight:700;cursor:pointer;">Vaciar carrito</button>
      <button id="pagar-carrito-btn" style="flex:1;background:#22c55e;color:#fff;border:none;padding:10px;border-radius:8px;font-weight:700;cursor:pointer;">Proceder al pago</button>
    </div>
  `;
}

// Validar stock antes de pagar y mostrar modal
async function validarYMostrarModalPago() {
  if (carrito.length === 0) {
    mostrarMensaje('El carrito está vacío', 'error');
    return;
  }
  // Valida stock y descuenta solo si hay suficiente
  const exito = await descontarStockAlPagar();
  if (!exito) {
    mostrarMensaje('Algunos productos ya no tienen stock suficiente', 'error');
    actualizarCarrito();
    return;
  }
  mostrarModalPago();
}

// Modal de pago Nequi
function mostrarModalPago() {
  let total = 0;
  let detalle = '';
  carrito.forEach(item => {
    const precioNum = parseInt(item.precio.replace(/[\$.]/g, ''));
    total += precioNum * item.cantidad;
    detalle += `• ${item.cantidad} x ${item.nombre}\n`;
  });
  const numeroNequi = '3235305297';
  const modal = document.getElementById('modal-pago');
  modal.innerHTML = `
    <div style="background:#fff;padding:30px 24px;border-radius:16px;max-width:340px;text-align:center;position:relative;">
      <button id="cerrar-modal-pago" style="position:absolute;top:10px;right:10px;background:none;border:none;font-size:22px;cursor:pointer;">✖</button>
      <h3 style="margin-bottom:12px;">Pago por Nequi</h3>
      <div style="margin-bottom:10px;font-size:17px;">
        <strong>Total a pagar: $${total.toLocaleString('es-CO')}</strong>
        <button id="copiar-monto-btn" style="margin-left:8px;background:#e3f2fd;color:#8e24aa;border:none;padding:4px 10px;border-radius:6px;font-weight:700;cursor:pointer;">Copiar monto</button>
      </div>
      <div style="text-align:left;font-size:15px;margin-bottom:10px;">
        <strong>Pedido:</strong><br>
        ${detalle.replace(/\n/g, '<br>')}
      </div>
      <p style="font-size:16px;margin-bottom:8px;">
        Envía el pago a <strong id="numero-nequi">${numeroNequi}</strong> desde tu app Nequi.
        <button id="copiar-nequi-btn" style="margin-left:8px;background:#e3f2fd;color:#8e24aa;border:none;padding:4px 10px;border-radius:6px;font-weight:700;cursor:pointer;">Copiar número</button>
      </p>
      <div style="margin:12px 0;">
        <img src="assets/img/CodigoNequi.jpeg" alt="QR Nequi" style="width:160px;border-radius:12px;">
      </div>
      <a href="nequi://app" id="abrir-nequi-btn" style="display:inline-block;margin-bottom:10px;background:#8e24aa;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;">Abrir Nequi</a>
      <p style="font-size:15px;">Después de pagar, envía captura del comprobante por WhatsApp.</p>
      <a href="https://wa.me/573105118265?text=${encodeURIComponent('Hola, acabo de pagar $' + total.toLocaleString('es-CO') + ' por:\n' + detalle + '\nMi nombre es: ')}" target="_blank" style="display:inline-block;margin-top:10px;background:#25d366;color:#fff;padding:8px 16px;border-radius:8px;text-decoration:none;font-weight:700;">Enviar comprobante</a>
    </div>
  `;
  modal.style.display = 'flex';

  // Copiar número Nequi
  document.getElementById('copiar-nequi-btn').onclick = function() {
    navigator.clipboard.writeText(numeroNequi);
    this.textContent = "¡Copiado!";
    setTimeout(() => { this.textContent = "Copiar número"; }, 1500);
  };
  // Copiar monto
  document.getElementById('copiar-monto-btn').onclick = function() {
    navigator.clipboard.writeText(total);
    this.textContent = "¡Copiado!";
    setTimeout(() => { this.textContent = "Copiar monto"; }, 1500);
  };
  // Cerrar modal
  document.getElementById('cerrar-modal-pago').onclick = function() {
    modal.style.display = 'none';
    carrito = [];
    guardarCarrito();
    actualizarCarrito();
    document.getElementById('carrito-lista').style.display = 'none';
  };
}

// Utilidades de stock en Firebase
function escucharStock(nombreProducto, callback) {
  db.ref('stock/' + nombreProducto).on('value', snapshot => {
    callback(snapshot.val());
  });
}
function descontarStock(nombreProducto, cantidad) {
  const ref = db.ref('stock/' + nombreProducto);
  ref.transaction(stock => {
    if (stock === null) return 0;
    return stock - cantidad >= 0 ? stock - cantidad : 0;
  });
}
function guardarCarrito() {
  localStorage.setItem('ffe_carrito', JSON.stringify(carrito));
}

// Feedback visual
function mostrarMensaje(texto, tipo = 'info') {
  const msg = document.createElement('div');
  msg.textContent = texto;
  msg.className = 'mensaje-feedback ' + tipo;
  msg.style.position = 'fixed';
  msg.style.top = '20px';
  msg.style.right = '20px';
  msg.style.background = tipo === 'error' ? '#ff4d4f' : '#22c55e';
  msg.style.color = '#fff';
  msg.style.padding = '10px 18px';
  msg.style.borderRadius = '8px';
  msg.style.zIndex = 9999;
  document.body.appendChild(msg);
  setTimeout(() => msg.remove(), 1800);
}

async function descontarStockAlPagar() {
  let sinStock = false;
  await Promise.all(carrito.map(item =>
    db.ref('stock/' + item.nombre).transaction(stock => {
      if (stock === null) return 0;
      if (stock < item.cantidad) {
        sinStock = true;
        return stock; // No descuenta si no hay suficiente
      }
      return stock - item.cantidad;
    })
  ));
  return !sinStock;

}

document.addEventListener("DOMContentLoaded", () => {
	
	// Arrays con productos y productos en el carrito
	const products = [
		{
			id: 1,
			name: "Sprite 591ml",
			price: 2000,
			offer: 1500,
			img: '/img/sprite.jpg'
		},
		{
			id: 2,
			name: "Doritos 300g",
			price: 1000,
			img: '/img/dorito.webp'
		},
		{
			id: 3,
			name: "Yogurt 120g",
			price: 250,
			img: '/img/yogurt.webp'
		},
		{
			id: 4,
			name: "Leche 1L",
			price: 1250,
			img: '/img/leche.png'
		},
		{
			id: 5,
			name: "Arroz 1kg",
			price: 2100,
			img: '/img/arroz.png'
		},
		{
			id: 6,
			name: "Habas Interagro 1kg",
			price: 1800,
			img: '/img/habas.jpg'
		},
		{
			id: 7,
			name: "Habas congeladas 1kg",
			price: 2100,
			img: '/img/habas3.jpg'
		},
		{
			id: 8,
			name: "Habas en conserva 380g",
			price: 1600,
			img: '/img/habas2.webp'
		},
		{
			id: 9,
			name: "Queso 500g",
			price: 6000,
			img: '/img/queso.webp'
		},
		{
			id: 10,
			name: "Pan bimbo 620g",
			price: 2400,
			img: '/img/pan.webp'
		},
	]
	const carrito = [];

	// Divs de productos y carrito
	const containerProductos = document.getElementById("productos");
	const containerCarrito = document.getElementById("carrito");
	const containerPedir = document.getElementById("pedir");

	// Calcular descuento
	function calcularDcto (original, oferta) {
		return 100 - (oferta * 100 / original); 
	}
	
	// Mostrar productos
	function printProduct(product) {
		const descuento = product.offer ? calcularDcto(product.price, product.offer) : 0;

		const divProduct = document.createElement("div");
		divProduct.className = "producto";
		divProduct.innerHTML =
			`<div class="producto-body">
		${descuento ? '<span class="descuento">' + descuento + '% dcto</span>' : ''}
		<img src="${product.img}">
		<h4>${product.name}</h4>
		<span class="producto-precio">$${product.offer ? product.offer + '<small class="precio-oferta">$' + product.price + '</small>' : product.price}</span>
		</div>
		<button class="add-product" type="button" value="${product.id}">Agregar al carro</button>`;
		containerProductos.appendChild(divProduct);
	}

	// Iterar sobre productos
	products.forEach((product) => {
		printProduct(product);
	});

	// Renderizar carrito
	function renderCarrito(product) {
		let productoExistente = document.getElementById("carrito-prod-" + product.id);
		if (productoExistente) {
			const cantidadInput = productoExistente.querySelector("input");
			cantidadInput.value = product.quantity;
		} else {
			containerCarrito.innerHTML = '';
			carrito.forEach(producto => {
				const productDiv = document.createElement("div");
				productDiv.className = "producto-carrito";
				productDiv.id = "carrito-prod-" + producto.id;
				productDiv.innerHTML = `
				<img src="${producto.img}">
				<div class="producto-carrito-body">
					<h4>${producto.name}</h4>
					<span class="producto-precio">$${producto.offer ? producto.offer + '<small class="precio-oferta">$' + producto.price + '</small>' : producto.price}</span>
					<div class="producto-carrito-botones">
						<button class="cantidad cantidad-subir" data-id="${producto.id}">-</button>
						<input id="cantidad-${producto.id}" type="number" value="${producto.quantity}">
						<button class="cantidad cantidad-bajar" data-id="${producto.id}">+</button>
					</div>
				</div>`;

				inputCantidad = productDiv.querySelector("#cantidad-" + producto.id);
				inputCantidad.addEventListener("focus", function (e) {
					// Guardar el valor del input al hacer focus
					e.target.dataset.old = e.target.value;
				});

				inputCantidad.addEventListener("keydown", function (e) {
					if (
						["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
					) return;

					// Regex para numeros
					if (!/^\d$/.test(e.key)) {
						e.preventDefault();
						if (e.target.dataset.old !== undefined) {
							e.target.value = e.target.dataset.old;
						}
					}
				});

				inputCantidad.addEventListener("input", function (e) {
					// Mantener valor anterior al cambio si es válido
					if (/^\d+$/.test(e.target.value)) {
						e.target.dataset.old = e.target.value;
					}
				});
				inputCantidad.addEventListener("change", (e) => {
					modificarPorInput(producto.id, e);
				})
				containerCarrito.appendChild(productDiv);
			});
		};
		if (carrito.length == 0) {
			containerPedir.innerHTML = '<p class="empty">No hay productos en el carrito.</p>';
		} else {
			calcTotal();
		}
	}

	// Calcular total del carrito
	function calcTotal () {
		precioTotal = carrito.reduce((acc, p) => {
			const precio = p.offer ?? p.price;
			return acc + (precio * p.quantity);
		}, 0);

		containerPedir.innerHTML = '';
		divTotal = document.createElement("div");
		divTotal.innerHTML = `
		<input id="input-nombre" class="form-input" required type="text" placeholder="Nombre">
		<input id="input-direccion" class="form-input" required type="text" placeholder="Dirección">
		<p class="total">Total <b>$${precioTotal}</b></p>
		<button id="enviar" type="button">Realizar pedido</button>`;
		containerPedir.appendChild(divTotal);

		document.getElementById("enviar").addEventListener("click", (e) => {
			e.preventDefault();
			const user = document.getElementById("input-nombre").value;
			const direccion = document.getElementById("input-direccion").value;
			divTotal.innerHTML = `
			<p>Gracias ${user}, su pedido ha sido enviado a ${direccion}.</p>`
		})

	}

	// Función para agregar productos al carro
	function agregarProducto (id) {
		const productoPorAgregar = products.find(e => e.id == id);
		if (!productoPorAgregar) return;

		const productoEnCarrito = carrito.find(e => e.id == id);

		if (productoEnCarrito) {
			productoEnCarrito.quantity += 1;
		} else {
			carrito.push({...productoPorAgregar, quantity: 1});
		}

		renderCarrito(productoEnCarrito || carrito[carrito.length - 1]);
	}

	// Array de botones para agregar producto
	const agregar = document.querySelectorAll(".add-product");
		agregar.forEach(btn => {
		btn.addEventListener("click", () => agregarProducto(btn.value));
	})

	// Funcionalidad de botones subir/bajarcantidad
	containerCarrito.addEventListener("click", (e) => {
		if (e.target.classList.contains("cantidad-subir")) {
			modificarCantidad(e.target.dataset.id, -1);
		}
		if (e.target.classList.contains("cantidad-bajar")) {
			modificarCantidad(e.target.dataset.id, 1);
		}
	});

	// Editar cantidad por input
	function modificarPorInput(id, e) {
		const producto = carrito.find(p => p.id === id);
		producto.quantity = parseInt(e.target.value);
		if (producto.quantity <= 0) {
			const index = carrito.findIndex(p => p.id === id);
			if (index > -1) carrito.splice(index, 1);

			const elem = document.getElementById("carrito-prod-" + id);
			if (elem) elem.remove();
		}

		if (carrito.length == 0) {
			containerPedir.innerHTML = '<p class="empty">No hay productos en el carrito.</p>';
		} else {
			calcTotal();
		}
	}

	// Modificar cantidad por botones
	function modificarCantidad(id, cambio) {
		id = +id;
		const producto = carrito.find(p => p.id === id);
		if (!producto) return;

		producto.quantity += cambio;

		if (producto.quantity <= 0) {
			const index = carrito.findIndex(p => p.id === id);
			if (index > -1) carrito.splice(index, 1);

			const elem = document.getElementById("carrito-prod-" + id);
			if (elem) elem.remove();
		} else {
			const input = document.getElementById("cantidad-" + id);
			if (input) input.value = producto.quantity;
		}

		if (carrito.length == 0) {
			containerPedir.innerHTML = '<p class="empty">No hay productos en el carrito.</p>';
		} else {
			calcTotal();
		}
	}
});
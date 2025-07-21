document.addEventListener("DOMContentLoaded", () => {
	AOS.init(); // Inicialización de AOS

	// Spinner y banner de errores
	const loadingSpinner = document.getElementById("loading-spinner");
	const errorContainer = document.getElementById("fetch-error");

	// Config de la API
	const apiUrl = "https://dummyjson.com/products";
	const pageLimit = 20;
	let currentPage = 1;

	// Función para renderizar producto individual
	const productsContainer = document.getElementById("products");
	function renderProducts(productList) {
		productsContainer.innerHTML = '';
		productList.forEach((product) => {
			const divProduct = document.createElement("div");
			divProduct.classList.add("col-12", "col-md-6", "col-lg-4", "col-xl-3");
			divProduct.setAttribute('data-aos', 'zoom-in');
			divProduct.setAttribute('data-aos-once', 'true');
			divProduct.innerHTML =
				`<div class="card h-100">
					
					<img 
					style="height: 300px; object-fit: contain;" 
					alt="${product.title}" 
					class="card-img-top px-3 pt-3 opacity-0" 
					src="${product.thumbnail}" onload="this.classList.remove('opacity-0');"
					>

					<div class="card-body">
						<div class="d-flex flex-column justify-content h-100">
							<div class="h-100">
								<h5 class="card-title mb-3 text-muted">${product.title}</h5>
								</div>
								<h6 class="card-subtitle mb-3 fs-3">$${product.price}</h6>
							<button class="btn btn-outline-dark d-block w-100" type="button" value="${product.id}"><small><i class="fa-solid fa-cart-shopping me-2"></i></small>Agregar al carro</button>
						</div>
					</div>
				</div>
				`;

			const addProductBtn = divProduct.querySelector(".btn");
			addProductBtn.addEventListener("click", () => addProduct(product));
			
			productsContainer.appendChild(divProduct);
		})
	}

	// Paginación
	function renderPagination(productsTotal) {
		const containerPaginacion = document.getElementById("pagination");
		containerPaginacion.innerHTML = '';

		const totalPages = Math.ceil(productsTotal / pageLimit);

		for (let i = 1; i <= totalPages; i++) {
			const li = document.createElement('li');
			li.className = `page-item ${i === currentPage ? 'active' : ''}`;
			li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
			li.addEventListener('click', (e) => {
				e.preventDefault();
				currentPage = i;
				getProducts(currentPage);
			});
			pagination.appendChild(li);
		}
	}

	// Fetch de productos
	const getProducts = async (page) => {
		try {
			// Errores y spinner de carga
			errorContainer.style.display = "none";
			loadingSpinner.style.display = "block";

			// Configuración para paginación
			const skip = (page - 1) * pageLimit;
			const response = await fetch(`${apiUrl}?limit=${pageLimit}&skip=${skip}`);
			const data = await response.json();

			// Renderizar productos y paginación
			renderPagination(data.total);
			renderProducts(data.products);
			
		} catch (error) {
			console.error("Error obteniendo productos: " + error);
			errorContainer.style.display = "block"; // Mostrar error si hay error
			return [];
		} finally {
			loadingSpinner.style.display = "none"; // Dejar de cargar
		}
	}
	
	getProducts(1); // Productos página 1

	// Login

	// Checkear si usuario está loggeado
	let isAuth = localStorage.getItem("isAuth") === "true";
	console.log(localStorage.getItem("isAuth"));
	console.log(isAuth);
	let openCheckoutOnLogin = false;

	const usernameContainer = document.getElementById("navbar-username");
	const logoutBtn = document.getElementById("logout-btn");
	const loginBtn = document.getElementById("login-btn");

	loginBtn.addEventListener("click", () => {
		openCheckoutOnLogin = false; // Abrir login y no pasar a checkout
	});

	if (isAuth == true) {
		console.log("trueeee")
		login(localStorage.getItem("username"));
	} else {
		loginBtn.style.display = "block";
	}

	// Formulario modal
	const loginForm = document.getElementById("login-form");
	const loginModal = document.getElementById("loginModal");
	const userInput = loginForm.querySelector("#login-name");
	const checkRemember = loginForm.querySelector("#login-rember");
	
	const checkoutForm = document.getElementById("checkout-form");
	const checkoutModal = document.getElementById("checkoutModal");

	function login(username) {
		usernameContainer.innerHTML = `<span class="user-select-none nav-link">Bienvenido, ${username}!</span>`;
		loginBtn.style.display = "none";
		logoutBtn.style.display = "block";
		isAuth = true;
	}

	loginForm.addEventListener("submit", (e) => {
		e.preventDefault();
		if (checkRemember.checked) {
			console.log("hola");
			localStorage.setItem("username", userInput.value);
			localStorage.setItem("isAuth", true);
		}
		login(userInput.value);

		Toastify({
			text: "¡Sesión iniciada!",
			style: {
				background: "none"
			},
			className: "bg-success",
			duration: 2000,
			gravity: 'bottom',
			position: 'center'
		}).showToast();

		const modalInstance = bootstrap.Modal.getInstance(loginModal);
		modalInstance.hide();

		loginModal.addEventListener("hidden.bs.modal", () => {
			if (openCheckoutOnLogin) {
				openCheckoutOnLogin = false;
				bootstrap.Modal.getOrCreateInstance(document.getElementById("checkoutModal")).show();
			}
		}, { once: true });
	});

	// Cerrar sesión
	logoutBtn.addEventListener("click", () => {
		console.log("holaaaa");
		localStorage.setItem("isAuth", false);
		localStorage.removeItem("username");
		isAuth = false;
		logoutBtn.style.display = "none";
		loginBtn.style.display = "block";
		usernameContainer.innerHTML = "";
		Toastify({
			text: "Sesión cerrada",
			style: {
				background: "none"
			},
			duration: 2000,
			className: "bg-danger",
			gravity: 'bottom',
			position: 'center'
		}).showToast();
	});

	// Botón para realizar pedido
	const purchaseBtn = document.getElementById("cartPurchaseBtn");
	purchaseBtn.addEventListener("click", () => {
		if (isAuth) {
			bootstrap.Modal.getOrCreateInstance(document.getElementById("checkoutModal")).show();
		} else {
			// Autentificar a usuario si no está loggeado
			openCheckoutOnLogin = true;
			bootstrap.Modal.getOrCreateInstance(loginModal).show();
		}
	});

	checkoutForm.addEventListener("submit", (e) => {
		e.preventDefault();
		const address = checkoutForm.querySelector("#checkout-address").value;

		const modalInstance = bootstrap.Modal.getInstance(checkoutModal);
		modalInstance.hide();

		cart = [];
		renderCart({});
		calcTotal();
		hideDrawer();

		Toastify({
			text: `¡Pago realizado! Su pedido se enviará a ${address}`,
			style: {
				background: "none"
			},
			className: "bg-success",
			duration: 4000,
			gravity: 'bottom',
			position: 'center'
		}).showToast();
	})
	
	// Carrito ===============================================================
	// Drawer para carrito
	const drawerCart = document.getElementById("drawerCart");
	const btnCart = document.getElementById("btnCart");

	function showDrawer() {
		drawerCart.style.display = "block";
		btnCart.classList.add("bg-body-secondary");
		btnCart.classList.remove("bg-dark-subtle");
	}

	function hideDrawer() {
		btnCart.classList.remove("bg-body-secondary");
		btnCart.classList.add("bg-dark-subtle");
		drawerCart.style.display = "none";
	}
	
	function toggleDrawer() {
		if (drawerCart.style.display == "none") {
			showDrawer();
		} else {
			hideDrawer();
		}
	}
	btnCart.addEventListener("click", () => toggleDrawer());

	// Calcular total del carrito
	const cartBuyContainer = document.getElementById("cartBuy");
	const cartEmptyContainer = document.getElementById("cartEmpty");
	const cartBuyTotal = cartBuyContainer.querySelector("#cartTotal");
	

	function calcTotal() {
		if (cart.length == 0) {
			cartEmptyContainer.style.display = "block";
			cartBuyContainer.style.display = "none";
			localStorage.setItem("cart", []);
		} else {
			precioTotal = (Math.round(cart.reduce((acc, p) => {
				return acc + (p.price * p.quantity);
			}, 0) * 100) / 100).toFixed(2);
			cartEmptyContainer.style.display = "none";
			cartBuyContainer.style.display = "block";
			cartBuyTotal.innerText = precioTotal;
			localStorage.setItem("cart", JSON.stringify(cart));
		}
	}
	
	const cartContainer = document.getElementById("cart");
	let cart = [];
	
	// Conseguir carrito guardado como JSON
	try {
		rawCart = localStorage.getItem("cart");
		cart = rawCart ? JSON.parse(rawCart) : [];
	} catch (e) {
		console.warn("Error al obtener carrito: ", e);
		localStorage.removeItem("cart");
	}

	// Renderizar carrito
	function renderCart(product) {
		let existingProduct = document.getElementById("cart-prod-" + product.id);
		if (existingProduct) {
			const quantityInput = existingProduct.querySelector("input");
			quantityInput.value = product.quantity;
		} else {
			cartContainer.innerHTML = '';
			cart.forEach(prod => {
				const productDiv = document.createElement("div");
				productDiv.classList.add("d-flex", "align-items-center", "gap-3", "py-3", "border-bottom", "border-secondary-subtle");
				productDiv.id = "cart-prod-" + prod.id;
				productDiv.innerHTML = `
				<img style="width: 120px; height: 120px; object-fit: contain;" src="${prod.thumbnail}">
				<div>
					<h4 class="text-secondary fs-6 mb-1">${prod.title}</h4>
					<div  class="mb-3"><span class="fs-5 text-secondary-emphasis fw-bold">$${ prod.price }</span></div>
					<div class="input-group">
						<button class="btn btn-sm btn-outline-secondary cantidad-bajar" type="button" data-id="${prod.id}">-</button>
						<input id="cantidad-${prod.id}" class="form-control form-control-sm" type="number" value="${prod.quantity}">
						<button class="btn btn-sm btn-outline-secondary cantidad-subir" type="button" data-id="${prod.id}">+</button>
					</div>
					
				</div>`;

				quantityInput = productDiv.querySelector("#cantidad-" + prod.id);
				quantityInput.addEventListener("focus", function (e) {
					// Guardar el valor del input al hacer focus
					e.target.dataset.old = e.target.value;
				});

				quantityInput.addEventListener("keydown", function (e) {
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

				quantityInput.addEventListener("input", function (e) {
					// Mantener valor anterior al cambio si es válido
					if (/^\d+$/.test(e.target.value)) {
						e.target.dataset.old = e.target.value;
					}
				});

				quantityInput.addEventListener("change", (e) => {
					modifyQuantity(prod.id, e.target.value, true);
				})
				cartContainer.appendChild(productDiv);
			});
		};
		calcTotal();
	}

	renderCart({});

	// Vaciar carrito
	document.getElementById("btnEmptyCart").addEventListener("click", () => {
		cart = [];
		renderCart({});
	});

	// Función para agregar productos al carro
	function addProduct(product) {
		showDrawer();
		const productAlreadyInCart = cart.find(e => e.id == product.id);
		if (productAlreadyInCart) {
			productAlreadyInCart.quantity += 1;
		} else {
			cart.push({...product, quantity: 1});
		}

		Toastify({
			text: `"${product.title}" agregado al carro`,
			position: "left",
			gravity: "bottom",
			style: {
				background: "none",
			},
			className: "bg-success"
		}).showToast();

		renderCart(productAlreadyInCart || cart[cart.length - 1]);
	}

	// Modificar cantidad de un producto
	function modifyQuantity(id, change, isInput) {
		const productInCart = cart.find(e => e.id == id);
		if (!productInCart) return;

		if (isInput) {
			productInCart.quantity = parseInt(change);
		} else {
			productInCart.quantity += change;
		}
		
		let productInCartDiv = document.getElementById("cart-prod-" + id);
		const quantityInput = productInCartDiv.querySelector("input");

		quantityInput.value = productInCart.quantity;
		if (productInCart.quantity <= 0) {
			// Buscar producto, borrar del carro y DOM
			productToDelete = cart.findIndex(p => p.id == id);
			if (productToDelete > -1) cart.splice(productToDelete, 1); 
			productInCartDiv.remove();
		} else {
			if (quantityInput) quantityInput.value = productInCart.quantity;
		}
		// Guardar en localStorage y calcular total de costos
		calcTotal();
	}

	// Funcionalidad de botones subir/bajarcantidad
	cartContainer.addEventListener("click", (e) => {
		if (e.target.classList.contains("cantidad-bajar")) {
			modifyQuantity(e.target.dataset.id, -1, false);
		}
		if (e.target.classList.contains("cantidad-subir")) {
			modifyQuantity(e.target.dataset.id, 1, false);
		}
	});
	
});
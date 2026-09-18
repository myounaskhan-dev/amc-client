
import { useEffect, useState } from "react";

type Product = {
  _id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  stock?: number;
  description?: string;
};

type CartItem = Product & {
  quantity: number;
};

type Customer = {
  name: string;
  phone: string;
  address: string;
};

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    address: "",
  });

  // =========================
  // LOAD PRODUCTS
  // =========================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError("");

       
const response = await fetch(
  "https://amc-server-azure.vercel.app/api/products"
);

        if (!response.ok) {
          throw new Error("Products load nahi huin");
        }

        const data = await response.json();

        console.log("PRODUCTS FROM BACKEND:", data);

        const formattedProducts: Product[] = data.map(
          (item: any) => ({
            _id: String(item._id),
            name: item.name,
            price: Number(item.price),
            category: item.category || "Other",
            image: item.image || "",
            stock:
              item.stock !== undefined
                ? Number(item.stock)
                : undefined,
            description: item.description || "",
          })
        );

        setProducts(formattedProducts);
      } catch (err) {
        console.error("Products Error:", err);
        setError("Products load nahi ho rahin.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =========================
  // ADD TO CART
  // =========================

  const addToCart = (product: Product) => {
    setCart((previousCart) => {
      const existingProduct = previousCart.find(
        (item) => String(item._id) === String(product._id)
      );

      if (existingProduct) {
        return previousCart.map((item) =>
          String(item._id) === String(product._id)
            ? {
                ...item,
                quantity: item.quantity + 1,
              }
            : item
        );
      }

      return [
        ...previousCart,
        {
          ...product,
          quantity: 1,
        },
      ];
    });

    alert(`${product.name} added to cart!`);
  };

  // =========================
  // CHANGE QUANTITY
  // =========================

  const changeQuantity = (
    id: string,
    amount: number
  ) => {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          String(item._id) === String(id)
            ? {
                ...item,
                quantity: item.quantity + amount,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  // =========================
  // REMOVE FROM CART
  // =========================

  const removeFromCart = (id: string) => {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => String(item._id) !== String(id)
      )
    );
  };

  // =========================
  // SEARCH + CATEGORY
  // =========================

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(search.toLowerCase());

    const matchesCategory =
      category === "All" ||
      product.category === category;

    return matchesSearch && matchesCategory;
  });

  // =========================
  // CATEGORIES
  // =========================

  const categories = [
    "All",
    ...Array.from(
      new Set(
        products.map((product) => product.category)
      )
    ),
  ];

  // =========================
  // CART TOTALS
  // =========================

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  const totalPrice = cart.reduce(
    (total, item) =>
      total + item.price * item.quantity,
    0
  );

  // =========================
  // CUSTOMER UPDATE
  // =========================

  const updateCustomer = (
    field: keyof Customer,
    value: string
  ) => {
    setCustomer((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  // =========================
  // WHATSAPP ORDER
  // =========================

  const placeOrder = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    if (
      !customer.name.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim()
    ) {
      alert("Please fill all customer details.");
      return;
    }

    // WhatsApp number:
    // Pakistan country code = 92
    // 03xxxxxxxxx becomes 923xxxxxxxxx
    const whatsappNumber = "923719134200";

    const orderDetails = cart
      .map(
        (item) =>
          `${item.name} x ${item.quantity} = Rs. ${(
            item.price * item.quantity
          ).toLocaleString()}`
      )
      .join("\n");

    const message = `
Ali Mobile Corner - New Order

Customer Name: ${customer.name}
Phone: ${customer.phone}
Address: ${customer.address}

Products:
${orderDetails}

Total Items: ${totalItems}
Total: Rs. ${totalPrice.toLocaleString()}
`;

    const whatsappUrl =
      `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

    setShowCheckout(false);
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* ================= NAVBAR ================= */}

      <nav className="sticky top-0 z-40 flex flex-wrap items-center justify-between gap-4 border-b border-yellow-500/30 bg-black/95 px-5 py-5 backdrop-blur md:px-10">

        <a
          href="#"
          className="text-2xl font-extrabold text-yellow-400"
        >
          AMC
        </a>

        <div className="flex flex-wrap items-center gap-3 md:gap-5">

          <a
            href="#"
            className="hover:text-yellow-400"
          >
            Home
          </a>

          <a
            href="#products"
            className="hover:text-yellow-400"
          >
            Products
          </a>

          <button
            type="button"
            onClick={() =>
              setShowCart((previous) => !previous)
            }
            className="rounded-lg bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300"
          >
            Cart ({totalItems})
          </button>

        </div>
      </nav>

      {/* ================= HERO ================= */}

      <section className="px-5 py-20 text-center md:py-28">

        <p className="mb-4 text-sm tracking-widest text-yellow-400">
          WELCOME TO ALI MOBILE CORNER
        </p>

        <h1 className="text-4xl font-extrabold md:text-6xl">
          Mobile Accessories
          <span className="block text-yellow-400">
            For Your Style
          </span>
        </h1>

        <p className="mx-auto mt-5 max-w-xl text-gray-400">
          Discover mobile phones, chargers, earbuds
          and accessories at Ali Mobile Corner.
        </p>

        <a
          href="#products"
          className="mt-8 inline-block rounded-lg bg-yellow-400 px-7 py-3 font-bold text-black transition hover:bg-yellow-300"
        >
          Shop Now
        </a>

      </section>

      {/* ================= PRODUCTS ================= */}

      <section
        id="products"
        className="mx-auto max-w-7xl px-5 py-12"
      >

        <div className="mb-8 text-center">

          <h2 className="text-3xl font-bold text-yellow-400 md:text-4xl">
            Our Products
          </h2>

          <p className="mt-2 text-gray-400">
            Choose your favorite mobile accessories
          </p>

        </div>

        {/* SEARCH */}

        <div className="mx-auto mb-6 max-w-xl">

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full rounded-lg border border-yellow-500/30 bg-zinc-900 p-3 text-white outline-none transition focus:border-yellow-400"
          />

        </div>

        {/* CATEGORIES */}

        <div className="mb-10 flex flex-wrap justify-center gap-3">

          {categories.map((item) => (

            <button
              key={item}
              type="button"
              onClick={() => setCategory(item)}
              className={`rounded-lg px-4 py-2 font-semibold transition ${
                category === item
                  ? "bg-yellow-400 text-black"
                  : "bg-zinc-800 text-white hover:bg-zinc-700"
              }`}
            >
              {item}
            </button>

          ))}

        </div>

        {/* LOADING */}

        {loading && (
          <div className="py-16 text-center">

            <p className="text-lg text-yellow-400">
              Loading products...
            </p>

          </div>
        )}

        {/* ERROR */}

        {!loading && error && (
          <div className="rounded-lg border border-red-500/30 bg-red-950/30 p-5 text-center">

            <p className="text-red-400">
              {error}
            </p>

            <p className="mt-2 text-sm text-gray-400">
              Make sure your backend server is running.
            </p>

          </div>
        )}

        {/* PRODUCTS */}

        {!loading &&
          !error &&
          filteredProducts.length === 0 && (

            <div className="py-16 text-center">

              <p className="text-xl text-gray-400">
                No products found.
              </p>

            </div>
          )}

        {!loading &&
          !error &&
          filteredProducts.length > 0 && (

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

              {filteredProducts.map((product) => (

                <div
                  key={product._id}
                  className="overflow-hidden rounded-2xl border border-yellow-500/20 bg-zinc-900 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/60"
                >

                  {/* IMAGE */}

                  <div className="h-56 overflow-hidden bg-zinc-800">

                    {product.image ? (

                      <img
                        src={product.image}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-300 hover:scale-105"
                      />

                    ) : (

                      <div className="flex h-full items-center justify-center text-gray-500">
                        No Image
                      </div>

                    )}

                  </div>

                  {/* CONTENT */}

                  <div className="p-5">

                    <p className="mb-2 text-sm text-yellow-400">
                      {product.category}
                    </p>

                    <h3 className="text-xl font-bold">
                      {product.name}
                    </h3>

                    {product.description && (

                      <p className="mt-2 line-clamp-2 text-sm text-gray-400">
                        {product.description}
                      </p>

                    )}

                    <div className="mt-5 flex items-center justify-between gap-3">

                      <p className="text-lg font-bold text-yellow-400">
                        Rs.{" "}
                        {product.price.toLocaleString()}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          addToCart(product)
                        }
                        disabled={
                          product.stock !== undefined &&
                          product.stock <= 0
                        }
                        className="rounded-lg bg-yellow-400 px-4 py-2 font-bold text-black transition hover:bg-yellow-300 disabled:cursor-not-allowed disabled:bg-gray-600 disabled:text-gray-300"
                      >
                        {product.stock !== undefined &&
                        product.stock <= 0
                          ? "Out of Stock"
                          : "Add to Cart"}
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>
          )}

      </section>

      {/* ================= CART ================= */}

      {showCart && (

        <section className="mx-auto max-w-5xl px-5 py-8">

          <div className="rounded-xl border border-yellow-500/30 bg-zinc-900 p-5">

            <div className="flex items-center justify-between gap-4">

              <h2 className="text-2xl font-bold text-yellow-400">
                Your Cart
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowCart(false)
                }
                className="text-gray-400 hover:text-white"
              >
                Close ✕
              </button>

            </div>

            {cart.length === 0 ? (

              <p className="mt-5 text-gray-400">
                Your cart is empty. Add some products!
              </p>

            ) : (

              <>

                <div className="mt-5 space-y-4">

                  {cart.map((item) => (

                    <div
                      key={item._id}
                      className="flex flex-col gap-4 border-b border-white/10 pb-4 sm:flex-row sm:items-center sm:justify-between"
                    >

                      <div className="min-w-[150px]">

                        <h3 className="font-semibold">
                          {item.name}
                        </h3>

                        <p className="text-sm text-gray-400">
                          Rs.{" "}
                          {item.price.toLocaleString()}{" "}
                          each
                        </p>

                      </div>

                      <div className="flex items-center gap-3">

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item._id,
                              -1
                            )
                          }
                          className="rounded bg-zinc-700 px-3 py-1 hover:bg-zinc-600"
                        >
                          −
                        </button>

                        <span className="min-w-6 text-center">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            changeQuantity(
                              item._id,
                              1
                            )
                          }
                          className="rounded bg-zinc-700 px-3 py-1 hover:bg-zinc-600"
                        >
                          +
                        </button>

                      </div>

                      <p className="font-bold text-yellow-400">
                        Rs.{" "}
                        {(
                          item.price *
                          item.quantity
                        ).toLocaleString()}
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromCart(item._id)
                        }
                        className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold hover:bg-red-500"
                      >
                        Remove
                      </button>

                    </div>

                  ))}

                </div>

                <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

                  <h3 className="text-xl font-bold">
                    Total: Rs.{" "}
                    {totalPrice.toLocaleString()}
                  </h3>

                  <button
                    type="button"
                    onClick={() =>
                      setShowCheckout(true)
                    }
                    className="rounded-lg bg-yellow-400 px-6 py-3 font-bold text-black hover:bg-yellow-300"
                  >
                    Checkout
                  </button>

                </div>

              </>
            )}

          </div>

        </section>
      )}

      {/* ================= CHECKOUT ================= */}

      {showCheckout && (

        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4">

          <form
            onSubmit={placeOrder}
            className="my-8 w-full max-w-lg space-y-4 rounded-2xl border border-yellow-500/30 bg-zinc-900 p-6 shadow-2xl"
          >

            {/* HEADER */}

            <div className="flex items-center justify-between gap-4">

              <h2 className="text-2xl font-bold text-yellow-400">
                Checkout
              </h2>

              <button
                type="button"
                onClick={() =>
                  setShowCheckout(false)
                }
                className="text-xl text-gray-400 hover:text-white"
              >
                ✕
              </button>

            </div>

            {/* TOTAL */}

            <p className="text-gray-300">

              Total:{" "}

              <span className="font-bold text-yellow-400">
                Rs.{" "}
                {totalPrice.toLocaleString()}
              </span>

            </p>

            {/* NAME */}

            <input
              required
              type="text"
              placeholder="Your Full Name"
              value={customer.name}
              onChange={(e) =>
                updateCustomer(
                  "name",
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-yellow-500/30 bg-black p-3 text-white outline-none focus:border-yellow-400"
            />

            {/* PHONE */}

            <input
              required
              type="tel"
              placeholder="Phone Number"
              value={customer.phone}
              onChange={(e) =>
                updateCustomer(
                  "phone",
                  e.target.value
                )
              }
              className="w-full rounded-lg border border-yellow-500/30 bg-black p-3 text-white outline-none focus:border-yellow-400"
            />

            {/* ADDRESS */}

            <textarea
              required
              placeholder="Your Delivery Address"
              value={customer.address}
              onChange={(e) =>
                updateCustomer(
                  "address",
                  e.target.value
                )
              }
              className="min-h[120px] w-full rounded-lg border border-yellow-500/30 bg-black p-3 text-white outline-none focus:border-yellow-400"
            />

            {/* WHATSAPP */}

            <button
              type="submit"
              className="w-full rounded-lg bg-green-500 py-3 font-bold text-white transition hover:bg-green-400"
            >
              Order on WhatsApp
            </button>

            {/* CANCEL */}

            <button
              type="button"
              onClick={() =>
                setShowCheckout(false)
              }
              className="w-full rounded-lg bg-gray-700 py-3 font-bold text-white hover:bg-gray-600"
            >
              Cancel
            </button>

          </form>

        </div>
      )}

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-yellow-500/30 px-5 py-8 text-center">

        <h3 className="text-xl font-bold text-yellow-400">
          Ali Mobile Corner
        </h3>

        <p className="mt-2 text-gray-400">
          Your trusted mobile accessories store.
        </p>

      </footer>

    </div>
  );
}

export default App;


export const useCart = () => {
  const orders = useCookie('orders', { default: () => [], maxAge: 43200 })
  const cart = useState('cart', () => [...orders.value])

  watch(cart, newCart => {
    orders.value = newCart
  }, { deep: true })
  
  const addToCart = (productId, amount) => {
    const orderIndex = cart.value.findIndex(order => order.produk === productId)
    if (orderIndex >= 0) {
      cart.value[orderIndex].jumlah = amount
    } else {
      cart.value.push({
        produk: productId,
        jumlah: amount
      })
    }
  }

  const removeFromCart = productId => {
    cart.value = cart.value.filter(order => order.produk !== productId)
  }

  const clearCart = () => {
    cart.value = []
  }

  return { cart, addToCart, removeFromCart, clearCart }
}
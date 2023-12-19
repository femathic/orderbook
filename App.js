import { store } from './store'
import { Provider } from 'react-redux'
import OrderBook from './screens';

export default function App() {
  return (
    <Provider store={store}>
      <OrderBook />
    </Provider>
  );
};


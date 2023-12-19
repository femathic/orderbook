import React, { useState, useEffect, useCallback} from 'react';
import { SafeAreaView, StyleSheet, View, StatusBar, Text, TouchableOpacity, ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux'
import { updateOrderBook } from '../store/orderBookSlice';
import { formatOrderData, formatPrice } from '../utils/helper';

const params = {
  event: 'subscribe', channel: 'book', symbol: 'tBTCUSD', freq: "F1"
};

export default function OrderBook() {

  // State
  const orderBook = useSelector((state) => state.orderBook)
  const dispatch = useDispatch()
  const { bids, asks, lastUpdateId } = orderBook

  // Change Precision
  const [precision, setPrecision] = useState(0);
  const reducePrecision = useCallback(() => setPrecision(precision - 1))
  const increasePrecision = useCallback(() => setPrecision(precision + 1))

  // Connection
  const [connection, setConnection] = useState(null);
  const [connectionId, setConnectionId] = useState(Date.now());
  const handleDisconnect = () => {
    if (connection) {
      connection.close();
      setConnection(null);
    }
  };
  const handleConnect = () => {
    handleDisconnect();
    dispatch(updateOrderBook({ asks: {}, bids: {}, lastUpdateId: null }))
    setConnectionId(Date.now());
  };
  


  // console.log(orderBook);

  useEffect(() => {
    const ws = new WebSocket('wss://api-pub.bitfinex.com/ws/2');
    setConnection(ws);
    ws.onopen = () => ws.send(JSON.stringify({...params, prec: `P${precision}`}));
    ws.onmessage = (event) => {
      const response = JSON.parse(event.data);
      if (Array.isArray(response)) {
        const[timeStamp, newOrders] = response;
        if (timeStamp && timeStamp !== lastUpdateId && Array.isArray(newOrders)) {
          const { newAsks, newBids } = formatOrderData(newOrders, { currentAsks: asks, currentBids: bids });
          const newOrderBookState = {
            asks: newAsks,
            bids: newBids,
            lastUpdateId: timeStamp,
          }
          dispatch(updateOrderBook(newOrderBookState));
        }
      }
    };
    return () => ws.close();
  }, [asks, bids, lastUpdateId, precision, connectionId]);



  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.precision}>(P{precision})</Text>
        <TouchableOpacity disabled={precision <= 0} onPress={reducePrecision}>
          <Text style={[styles.button, precision <= 0 ? styles.disabled : {}]}> – </Text>
        </TouchableOpacity>
        <TouchableOpacity disabled={precision >= 4} onPress={increasePrecision}>
          <Text style={[styles.button, precision >= 4 ? styles.disabled : {}]}> + </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.body}>
        <View style={styles.tablesHeading}>
          <View style={styles.tableHeaderLeft}>
            <Text style={styles.tableHeaderCell}>AMOUNT</Text>
            <Text style={styles.tableHeaderCell}>PRICE</Text>
          </View>
          <View style={styles.tableHeaderRight}>
            <Text style={styles.tableHeaderCell}>PRICE</Text>
            <Text style={styles.tableHeaderCell}>AMOUNT</Text>
          </View>
        </View>
        
        <ScrollView>
          <View style={styles.tables}>
            <View style={styles.table}>
              {Object.entries(bids)?.map(([price, amount]) => (
                <View style={styles.tableRowLeft} key={price}>
                  <Text style={styles.tableBodyCell}>{amount}</Text>
                  <Text style={styles.tableBodyCell}>{formatPrice(price)}</Text>
                </View>
              ))}
            </View>
            <View style={styles.table}>
              {Object.entries(asks)?.map(([price, amount]) => (
                <View style={styles.tableRowRight} key={price}>
                  <Text style={styles.tableBodyCell}>{formatPrice(price)}</Text>
                  <Text style={styles.tableBodyCell}>{amount}</Text>
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
        <View style={styles.control}>
          <TouchableOpacity disabled={false} style={[styles.controlButton]} onPress={handleConnect}>
            <Text style={[styles.controlText]}> Connect </Text>
          </TouchableOpacity>
          <TouchableOpacity disabled={false} style={[styles.controlButton]} onPress={handleDisconnect}>
            <Text style={[styles.controlText]}> Disconnect </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#152330',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#152338',
  },
  body: {
    flex: 1,
    paddingTop: 10,
  },
  precision: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    marginHorizontal: 15,
  },
  disabled: {
    opacity: 0.5,
  },
  button: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 12,
  },
  tablesHeading: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tables: {
    flexDirection: 'row',
  },
  table: {
    width: '50%',
  },
  tableHeaderLeft: {
    width: '50%',
    paddingLeft: 20,
    paddingVertical: 10,
    paddingRight: 4,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableHeaderRight: {
    width: '50%',
    paddingRight: 20,
    paddingLeft: 4,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tableRowLeft: {
    paddingLeft: 20,
    paddingRight: 4,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#19293A',
  },
  tableRowRight: {
    paddingRight: 20,
    paddingLeft: 4,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#19293A',
  },
  tableHeaderCell: {
    fontSize: 16,
    color: '#fff',
    opacity: 0.5,
  },
  tableBodyCell: {
    fontSize: 14,
    color: '#fff',
  },
  control: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  controlButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginHorizontal: 10,
  },
  controlText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#152330',
  },
});
